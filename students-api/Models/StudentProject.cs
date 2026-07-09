namespace StudentsApi.Models;

public class StudentProject
{
    public Guid Id { get; set; }
    public string AuthorSub { get; set; } = "";
    public string AuthorName { get; set; } = "";
    public string Title { get; set; } = "";
    public string Tagline { get; set; } = "";
    public string Description { get; set; } = "";
    public List<string> Features { get; set; } = [];
    public List<TechStackItem> TechStack { get; set; } = [];
    public string? GithubUrl { get; set; }
    public string? LiveUrl { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;
    public string? RejectionReason { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public List<StudentProjectMedia> Media { get; set; } = [];
}

public class TechStackItem
{
    public string Name { get; set; } = "";
    public string? Icon { get; set; }
}
