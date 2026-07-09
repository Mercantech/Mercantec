using System.Security.Claims;
using Amazon.S3;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudentsApi.Auth;
using StudentsApi.Configuration;
using StudentsApi.Data;
using StudentsApi.Models;
using StudentsApi.Models.Dtos;
using StudentsApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<StorageOptions>(builder.Configuration.GetSection(StorageOptions.SectionName));
builder.Services.Configure<MediaOptions>(builder.Configuration.GetSection(MediaOptions.SectionName));
builder.Services.Configure<CorsOptions>(builder.Configuration.GetSection(CorsOptions.SectionName));

var authOptions = builder.Configuration.GetSection(AuthOptions.SectionName).Get<AuthOptions>()
    ?? new AuthOptions();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = authOptions.Authority;
        options.Audience = authOptions.Audience;
        options.RequireHttpsMetadata = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = authOptions.Authority,
            ValidateAudience = true,
            ValidAudience = authOptions.Audience,
            RoleClaimType = AuthConstants.RoleClaimType,
            NameClaimType = "name",
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOrTeacher", policy =>
        policy.RequireAssertion(ctx =>
            ctx.User.IsAdminOrTeacher()));
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

var storageOptions = builder.Configuration.GetSection(StorageOptions.SectionName).Get<StorageOptions>()
    ?? new StorageOptions();

builder.Services.AddSingleton<IAmazonS3>(_ =>
{
    var config = new AmazonS3Config
    {
        ServiceURL = storageOptions.Endpoint,
        ForcePathStyle = true,
        AuthenticationRegion = "us-east-1",
    };

    return new AmazonS3Client(
        storageOptions.AccessKey,
        storageOptions.SecretKey,
        config);
});

builder.Services.AddSingleton<IStorageService, MinioStorageService>();
builder.Services.AddSingleton<MediaValidationService>();

var corsOrigins = builder.Configuration.GetSection(CorsOptions.SectionName).Get<CorsOptions>()?.Origins
    ?? ["https://mercantec.tech"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    var storage = scope.ServiceProvider.GetRequiredService<IStorageService>();
    await storage.EnsureBucketAsync();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

var publicApi = app.MapGroup("/api/student-projects");

publicApi.MapGet("/", async (
    AppDbContext db,
    int page = 1,
    int pageSize = 12) =>
{
    page = Math.Max(1, page);
    pageSize = Math.Clamp(pageSize, 1, 50);

    var query = db.StudentProjects
        .AsNoTracking()
        .Include(p => p.Media)
        .Where(p => p.Status == ProjectStatus.Approved)
        .OrderByDescending(p => p.ApprovedAt ?? p.CreatedAt);

    var total = await query.CountAsync();
    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return Results.Ok(new StudentProjectListDto(
        items.Select(ProjectMapping.ToDto).ToList(),
        total,
        page,
        pageSize));
});

publicApi.MapGet("/{id:guid}", async (Guid id, AppDbContext db) =>
{
    var project = await db.StudentProjects
        .AsNoTracking()
        .Include(p => p.Media)
        .FirstOrDefaultAsync(p => p.Id == id && p.Status == ProjectStatus.Approved);

    return project is null
        ? Results.NotFound()
        : Results.Ok(ProjectMapping.ToDto(project));
});

var authedApi = app.MapGroup("/api/student-projects").RequireAuthorization();

authedApi.MapGet("/mine", async (ClaimsPrincipal user, AppDbContext db) =>
{
    var sub = user.GetUserSub();
    if (string.IsNullOrWhiteSpace(sub)) return Results.Unauthorized();

    var projects = await db.StudentProjects
        .AsNoTracking()
        .Include(p => p.Media)
        .Where(p => p.AuthorSub == sub)
        .OrderByDescending(p => p.UpdatedAt)
        .ToListAsync();

    return Results.Ok(projects.Select(ProjectMapping.ToDto));
});

authedApi.MapPost("/", async (
    ClaimsPrincipal user,
    CreateProjectRequest request,
    AppDbContext db) =>
{
    var sub = user.GetUserSub();
    if (string.IsNullOrWhiteSpace(sub)) return Results.Unauthorized();

    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest(new { error = "Titel er påkrævet." });
    }

    var now = DateTimeOffset.UtcNow;
    var project = new StudentProject
    {
        Id = Guid.NewGuid(),
        AuthorSub = sub,
        AuthorName = user.GetUserName() ?? "Elev",
        Title = request.Title.Trim(),
        Tagline = request.Tagline?.Trim() ?? "",
        Description = request.Description?.Trim() ?? "",
        Features = request.Features?.Where(f => !string.IsNullOrWhiteSpace(f)).Select(f => f.Trim()).ToList() ?? [],
        TechStack = request.TechStack?.Select(t => new TechStackItem
        {
            Name = t.Name.Trim(),
            Icon = t.Icon,
        }).ToList() ?? [],
        GithubUrl = NormalizeUrl(request.GithubUrl),
        LiveUrl = NormalizeUrl(request.LiveUrl),
        Status = ProjectStatus.Draft,
        CreatedAt = now,
        UpdatedAt = now,
    };

    db.StudentProjects.Add(project);
    await db.SaveChangesAsync();

    return Results.Created($"/api/student-projects/{project.Id}", ProjectMapping.ToDto(project));
});

authedApi.MapPut("/{id:guid}", async (
    Guid id,
    ClaimsPrincipal user,
    UpdateProjectRequest request,
    AppDbContext db) =>
{
    var sub = user.GetUserSub();
    if (string.IsNullOrWhiteSpace(sub)) return Results.Unauthorized();

    var project = await db.StudentProjects.FirstOrDefaultAsync(p => p.Id == id && p.AuthorSub == sub);
    if (project is null) return Results.NotFound();

    if (project.Status is not (ProjectStatus.Draft or ProjectStatus.Rejected))
    {
        return Results.BadRequest(new { error = "Projektet kan kun redigeres i kladde eller efter afvisning." });
    }

    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest(new { error = "Titel er påkrævet." });
    }

    project.Title = request.Title.Trim();
    project.Tagline = request.Tagline?.Trim() ?? "";
    project.Description = request.Description?.Trim() ?? "";
    project.Features = request.Features?.Where(f => !string.IsNullOrWhiteSpace(f)).Select(f => f.Trim()).ToList() ?? [];
    project.TechStack = request.TechStack?.Select(t => new TechStackItem
    {
        Name = t.Name.Trim(),
        Icon = t.Icon,
    }).ToList() ?? [];
    project.GithubUrl = NormalizeUrl(request.GithubUrl);
    project.LiveUrl = NormalizeUrl(request.LiveUrl);
    project.Status = ProjectStatus.Draft;
    project.RejectionReason = null;
    project.UpdatedAt = DateTimeOffset.UtcNow;

    await db.SaveChangesAsync();

    await db.Entry(project).Collection(p => p.Media).LoadAsync();
    return Results.Ok(ProjectMapping.ToDto(project));
});

authedApi.MapPost("/{id:guid}/submit", async (
    Guid id,
    ClaimsPrincipal user,
    AppDbContext db) =>
{
    var sub = user.GetUserSub();
    if (string.IsNullOrWhiteSpace(sub)) return Results.Unauthorized();

    var project = await db.StudentProjects.FirstOrDefaultAsync(p => p.Id == id && p.AuthorSub == sub);
    if (project is null) return Results.NotFound();

    if (project.Status is not (ProjectStatus.Draft or ProjectStatus.Rejected))
    {
        return Results.BadRequest(new { error = "Projektet er allerede indsendt." });
    }

    if (string.IsNullOrWhiteSpace(project.Title) || string.IsNullOrWhiteSpace(project.Description))
    {
        return Results.BadRequest(new { error = "Titel og beskrivelse er påkrævet før indsendelse." });
    }

    project.Status = ProjectStatus.Pending;
    project.RejectionReason = null;
    project.UpdatedAt = DateTimeOffset.UtcNow;
    await db.SaveChangesAsync();

    await db.Entry(project).Collection(p => p.Media).LoadAsync();
    return Results.Ok(ProjectMapping.ToDto(project));
});

authedApi.MapPost("/{id:guid}/media", async (
    Guid id,
    ClaimsPrincipal user,
    HttpRequest httpRequest,
    AppDbContext db,
    IStorageService storage,
    MediaValidationService mediaValidation,
    CancellationToken cancellationToken) =>
{
    var sub = user.GetUserSub();
    if (string.IsNullOrWhiteSpace(sub)) return Results.Unauthorized();

    if (!httpRequest.HasFormContentType)
    {
        return Results.BadRequest(new { error = "Forventet multipart/form-data." });
    }

    var project = await db.StudentProjects
        .Include(p => p.Media)
        .FirstOrDefaultAsync(p => p.Id == id && p.AuthorSub == sub, cancellationToken);

    if (project is null) return Results.NotFound();

    if (project.Status is not (ProjectStatus.Draft or ProjectStatus.Rejected))
    {
        return Results.BadRequest(new { error = "Media kan kun tilføjes til kladder eller afviste projekter." });
    }

    var file = httpRequest.Form.Files.FirstOrDefault();
    if (file is null || file.Length == 0)
    {
        return Results.BadRequest(new { error = "Ingen fil modtaget." });
    }

    try
    {
        var (mediaType, _) = mediaValidation.ValidateUpload(
            file.ContentType ?? "application/octet-stream",
            file.Length);

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = mediaType == MediaType.Image ? ".jpg" : ".mp4";
        }

        var objectKey = $"{project.Id}/{Guid.NewGuid()}{extension}";
        await using var stream = file.OpenReadStream();
        var publicUrl = await storage.UploadAsync(
            stream,
            file.ContentType ?? "application/octet-stream",
            objectKey,
            cancellationToken);

        var media = new StudentProjectMedia
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            Type = mediaType,
            Url = publicUrl,
            StorageKey = objectKey,
            SortOrder = project.Media.Count,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        db.StudentProjectMedia.Add(media);
        project.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(new MediaDto(
            media.Id,
            media.Type.ToString().ToLowerInvariant(),
            media.Url,
            media.SortOrder));
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
}).DisableAntiforgery();

authedApi.MapPost("/{id:guid}/media/embed", async (
    Guid id,
    ClaimsPrincipal user,
    AddVideoEmbedRequest request,
    AppDbContext db) =>
{
    var sub = user.GetUserSub();
    if (string.IsNullOrWhiteSpace(sub)) return Results.Unauthorized();

    var project = await db.StudentProjects
        .Include(p => p.Media)
        .FirstOrDefaultAsync(p => p.Id == id && p.AuthorSub == sub);

    if (project is null) return Results.NotFound();

    if (project.Status is not (ProjectStatus.Draft or ProjectStatus.Rejected))
    {
        return Results.BadRequest(new { error = "Media kan kun tilføjes til kladder eller afviste projekter." });
    }

    var validationError = MediaValidationService.ValidateVideoEmbedUrl(request.Url);
    if (validationError is not null)
    {
        return Results.BadRequest(new { error = validationError });
    }

    var embedUrl = MediaValidationService.ToEmbedUrl(request.Url);
    var media = new StudentProjectMedia
    {
        Id = Guid.NewGuid(),
        ProjectId = project.Id,
        Type = MediaType.VideoEmbed,
        Url = embedUrl,
        SortOrder = project.Media.Count,
        CreatedAt = DateTimeOffset.UtcNow,
    };

    db.StudentProjectMedia.Add(media);
    project.UpdatedAt = DateTimeOffset.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok(new MediaDto(
        media.Id,
        media.Type.ToString().ToLowerInvariant(),
        media.Url,
        media.SortOrder));
});

authedApi.MapDelete("/{id:guid}/media/{mediaId:guid}", async (
    Guid id,
    Guid mediaId,
    ClaimsPrincipal user,
    AppDbContext db,
    IStorageService storage,
    CancellationToken cancellationToken) =>
{
    var sub = user.GetUserSub();
    if (string.IsNullOrWhiteSpace(sub)) return Results.Unauthorized();

    var media = await db.StudentProjectMedia
        .Include(m => m.Project)
        .FirstOrDefaultAsync(m => m.Id == mediaId && m.ProjectId == id, cancellationToken);

    if (media?.Project is null || media.Project.AuthorSub != sub)
    {
        return Results.NotFound();
    }

    if (media.Project.Status is not (ProjectStatus.Draft or ProjectStatus.Rejected))
    {
        return Results.BadRequest(new { error = "Media kan kun fjernes fra kladder eller afviste projekter." });
    }

    await storage.DeleteAsync(media.StorageKey, cancellationToken);
    db.StudentProjectMedia.Remove(media);
    media.Project.UpdatedAt = DateTimeOffset.UtcNow;
    await db.SaveChangesAsync(cancellationToken);

    return Results.NoContent();
});

var adminApi = app.MapGroup("/api/admin/student-projects")
    .RequireAuthorization("AdminOrTeacher");

adminApi.MapGet("/", async (AppDbContext db, string? status = "pending") =>
{
    if (!Enum.TryParse<ProjectStatus>(status, true, out var projectStatus))
    {
        return Results.BadRequest(new { error = "Ugyldig status." });
    }

    var projects = await db.StudentProjects
        .AsNoTracking()
        .Include(p => p.Media)
        .Where(p => p.Status == projectStatus)
        .OrderBy(p => p.UpdatedAt)
        .ToListAsync();

    return Results.Ok(projects.Select(ProjectMapping.ToDto));
});

adminApi.MapPost("/{id:guid}/approve", async (
    Guid id,
    ClaimsPrincipal user,
    AppDbContext db) =>
{
    var project = await db.StudentProjects
        .Include(p => p.Media)
        .FirstOrDefaultAsync(p => p.Id == id);

    if (project is null) return Results.NotFound();

    if (project.Status != ProjectStatus.Pending)
    {
        return Results.BadRequest(new { error = "Kun afventende projekter kan godkendes." });
    }

    project.Status = ProjectStatus.Approved;
    project.RejectionReason = null;
    project.ApprovedBy = user.GetUserSub();
    project.ApprovedAt = DateTimeOffset.UtcNow;
    project.UpdatedAt = DateTimeOffset.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok(ProjectMapping.ToDto(project));
});

adminApi.MapPost("/{id:guid}/reject", async (
    Guid id,
    ClaimsPrincipal user,
    RejectProjectRequest request,
    AppDbContext db) =>
{
    var project = await db.StudentProjects
        .Include(p => p.Media)
        .FirstOrDefaultAsync(p => p.Id == id);

    if (project is null) return Results.NotFound();

    if (project.Status != ProjectStatus.Pending)
    {
        return Results.BadRequest(new { error = "Kun afventende projekter kan afvises." });
    }

    if (string.IsNullOrWhiteSpace(request.Reason))
    {
        return Results.BadRequest(new { error = "Afvisningsårsag er påkrævet." });
    }

    project.Status = ProjectStatus.Rejected;
    project.RejectionReason = request.Reason.Trim();
    project.ApprovedBy = user.GetUserSub();
    project.ApprovedAt = DateTimeOffset.UtcNow;
    project.UpdatedAt = DateTimeOffset.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok(ProjectMapping.ToDto(project));
});

app.Run();

static string? NormalizeUrl(string? url)
{
    if (string.IsNullOrWhiteSpace(url)) return null;
    var trimmed = url.Trim();
    return Uri.TryCreate(trimmed, UriKind.Absolute, out _) ? trimmed : null;
}
