using StudentsApi.Models;

namespace StudentsApi.Models.Dtos;

public record TechStackItemDto(string Name, string? Icon);

public record MediaDto(
    Guid Id,
    string Type,
    string Url,
    int SortOrder
);

public record StudentProjectSummaryDto(
    Guid Id,
    string AuthorName,
    string Title,
    string Tagline,
    string Description,
    List<string> Features,
    List<TechStackItemDto> TechStack,
    string? GithubUrl,
    string? LiveUrl,
    string Status,
    string? RejectionReason,
    List<MediaDto> Media,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public record StudentProjectListDto(
    List<StudentProjectSummaryDto> Items,
    int Total,
    int Page,
    int PageSize
);

public record CreateProjectRequest(
    string Title,
    string Tagline,
    string Description,
    List<string>? Features,
    List<TechStackItemDto>? TechStack,
    string? GithubUrl,
    string? LiveUrl
);

public record UpdateProjectRequest(
    string Title,
    string Tagline,
    string Description,
    List<string>? Features,
    List<TechStackItemDto>? TechStack,
    string? GithubUrl,
    string? LiveUrl
);

public record RejectProjectRequest(string Reason);

public record AddVideoEmbedRequest(string Url);

public static class ProjectMapping
{
    public static StudentProjectSummaryDto ToDto(StudentProject project) =>
        new(
            project.Id,
            project.AuthorName,
            project.Title,
            project.Tagline,
            project.Description,
            project.Features,
            project.TechStack.Select(t => new TechStackItemDto(t.Name, t.Icon)).ToList(),
            project.GithubUrl,
            project.LiveUrl,
            project.Status.ToString().ToLowerInvariant(),
            project.RejectionReason,
            project.Media
                .OrderBy(m => m.SortOrder)
                .Select(m => new MediaDto(
                    m.Id,
                    m.Type.ToString().ToLowerInvariant(),
                    m.Url,
                    m.SortOrder))
                .ToList(),
            project.CreatedAt,
            project.UpdatedAt
        );
}
