namespace StudentsApi.Configuration;

public class StorageOptions
{
    public const string SectionName = "Storage";

    public string Endpoint { get; set; } = "http://minio:9000";
    public string AccessKey { get; set; } = "";
    public string SecretKey { get; set; } = "";
    public string Bucket { get; set; } = "student-projects";
    public string PublicUrl { get; set; } = "";
    public bool UseSsl { get; set; }
}

public class MediaOptions
{
    public const string SectionName = "Media";

    public long MaxImageBytes { get; set; } = 5 * 1024 * 1024;
    public long MaxVideoBytes { get; set; } = 50 * 1024 * 1024;
}

public class CorsOptions
{
    public const string SectionName = "Cors";

    public string[] Origins { get; set; } = [];
}

public class AuthOptions
{
    public const string SectionName = "Auth";

    public string Authority { get; set; } = "https://auth.mercantec.tech";
    public string Audience { get; set; } = "mercantec-apps";
}
