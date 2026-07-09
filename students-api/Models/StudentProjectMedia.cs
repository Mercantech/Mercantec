namespace StudentsApi.Models;

public class StudentProjectMedia
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public MediaType Type { get; set; }
    public string Url { get; set; } = "";
    public string? StorageKey { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public StudentProject? Project { get; set; }
}
