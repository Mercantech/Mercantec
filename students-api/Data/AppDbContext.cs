using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using StudentsApi.Models;

namespace StudentsApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<StudentProject> StudentProjects => Set<StudentProject>();
    public DbSet<StudentProjectMedia> StudentProjectMedia => Set<StudentProjectMedia>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var jsonOptions = new JsonSerializerOptions();

        var stringListConverter = new ValueConverter<List<string>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>());

        var techStackConverter = new ValueConverter<List<TechStackItem>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => JsonSerializer.Deserialize<List<TechStackItem>>(v, jsonOptions) ?? new List<TechStackItem>());

        modelBuilder.Entity<StudentProject>(entity =>
        {
            entity.ToTable("student_projects");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.AuthorSub).HasMaxLength(256).IsRequired();
            entity.Property(p => p.AuthorName).HasMaxLength(256).IsRequired();
            entity.Property(p => p.Title).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Tagline).HasMaxLength(300);
            entity.Property(p => p.Description).IsRequired();
            entity.Property(p => p.Features).HasConversion(stringListConverter).HasColumnType("jsonb");
            entity.Property(p => p.TechStack).HasConversion(techStackConverter).HasColumnType("jsonb");
            entity.Property(p => p.GithubUrl).HasMaxLength(500);
            entity.Property(p => p.LiveUrl).HasMaxLength(500);
            entity.Property(p => p.Status).HasConversion<string>().HasMaxLength(32);
            entity.Property(p => p.RejectionReason).HasMaxLength(2000);
            entity.Property(p => p.ApprovedBy).HasMaxLength(256);
            entity.HasIndex(p => p.Status);
            entity.HasIndex(p => p.AuthorSub);
            entity.HasMany(p => p.Media)
                .WithOne(m => m.Project)
                .HasForeignKey(m => m.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StudentProjectMedia>(entity =>
        {
            entity.ToTable("student_project_media");
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Url).HasMaxLength(2000).IsRequired();
            entity.Property(m => m.StorageKey).HasMaxLength(500);
            entity.Property(m => m.Type).HasConversion<string>().HasMaxLength(32);
            entity.HasIndex(m => m.ProjectId);
        });
    }
}
