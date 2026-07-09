using Microsoft.Extensions.Options;
using StudentsApi.Configuration;
using StudentsApi.Models;

namespace StudentsApi.Services;

public class MediaValidationService(IOptions<MediaOptions> options)
{
    private static readonly Dictionary<string, MediaType> ImageMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = MediaType.Image,
        ["image/png"] = MediaType.Image,
        ["image/webp"] = MediaType.Image,
    };

    private static readonly Dictionary<string, MediaType> VideoMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        ["video/mp4"] = MediaType.Video,
        ["video/webm"] = MediaType.Video,
    };

    private readonly MediaOptions _options = options.Value;

    public (MediaType Type, string NormalizedMime) ValidateUpload(string contentType, long contentLength)
    {
        if (ImageMimeTypes.TryGetValue(contentType, out var imageType))
        {
            if (contentLength > _options.MaxImageBytes)
            {
                throw new InvalidOperationException(
                    $"Billedet er for stort (max {_options.MaxImageBytes / (1024 * 1024)} MB).");
            }

            return (imageType, contentType.ToLowerInvariant());
        }

        if (VideoMimeTypes.TryGetValue(contentType, out var videoType))
        {
            if (contentLength > _options.MaxVideoBytes)
            {
                throw new InvalidOperationException(
                    $"Videoen er for stort (max {_options.MaxVideoBytes / (1024 * 1024)} MB).");
            }

            return (videoType, contentType.ToLowerInvariant());
        }

        throw new InvalidOperationException("Filtypen understøttes ikke. Brug jpeg, png, webp, mp4 eller webm.");
    }

    public static string? ValidateVideoEmbedUrl(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            return "Ugyldig video-URL.";
        }

        var host = uri.Host.ToLowerInvariant();
        var isYouTube = host is "youtube.com" or "www.youtube.com" or "youtu.be" or "m.youtube.com";
        var isVimeo = host is "vimeo.com" or "www.vimeo.com" or "player.vimeo.com";

        if (!isYouTube && !isVimeo)
        {
            return "Kun YouTube- og Vimeo-links understøttes til video-embed.";
        }

        return null;
    }

    public static string ToEmbedUrl(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            return url;
        }

        var host = uri.Host.ToLowerInvariant();

        if (host is "youtu.be")
        {
            var id = uri.AbsolutePath.TrimStart('/');
            return $"https://www.youtube.com/embed/{id}";
        }

        if (host.Contains("youtube.com"))
        {
            var query = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(uri.Query);
            if (query.TryGetValue("v", out var values) && values.Count > 0)
            {
                return $"https://www.youtube.com/embed/{values[0]}";
            }
        }

        if (host.Contains("vimeo.com"))
        {
            var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            var id = segments.LastOrDefault();
            if (!string.IsNullOrWhiteSpace(id) && id != "video")
            {
                return $"https://player.vimeo.com/video/{id}";
            }
        }

        return url;
    }
}
