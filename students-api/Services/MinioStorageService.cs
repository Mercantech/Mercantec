using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using StudentsApi.Configuration;

namespace StudentsApi.Services;

public interface IStorageService
{
    Task EnsureBucketAsync(CancellationToken cancellationToken = default);
    Task<string> UploadAsync(Stream stream, string contentType, string objectKey, CancellationToken cancellationToken = default);
    Task DeleteAsync(string? storageKey, CancellationToken cancellationToken = default);
    string GetPublicUrl(string objectKey);
}

public class MinioStorageService : IStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly StorageOptions _options;

    public MinioStorageService(IAmazonS3 s3, IOptions<StorageOptions> options)
    {
        _s3 = s3;
        _options = options.Value;
    }

    public async Task EnsureBucketAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _s3.PutBucketAsync(new PutBucketRequest
            {
                BucketName = _options.Bucket,
            }, cancellationToken);
        }
        catch (AmazonS3Exception ex) when (ex.ErrorCode is "BucketAlreadyOwnedByYou" or "BucketAlreadyExists")
        {
            // Bucket exists — ok
        }

        var policy = $$"""
        {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": "*",
              "Action": ["s3:GetObject"],
              "Resource": ["arn:aws:s3:::{{_options.Bucket}}/*"]
            }
          ]
        }
        """;

        try
        {
            await _s3.PutBucketPolicyAsync(new PutBucketPolicyRequest
            {
                BucketName = _options.Bucket,
                Policy = policy,
            }, cancellationToken);
        }
        catch (AmazonS3Exception)
        {
            // Policy may already exist or MinIO version differs — non-fatal
        }
    }

    public async Task<string> UploadAsync(
        Stream stream,
        string contentType,
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        var request = new PutObjectRequest
        {
            BucketName = _options.Bucket,
            Key = objectKey,
            InputStream = stream,
            ContentType = contentType,
            AutoCloseStream = false,
        };

        await _s3.PutObjectAsync(request, cancellationToken);
        return GetPublicUrl(objectKey);
    }

    public async Task DeleteAsync(string? storageKey, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(storageKey)) return;

        await _s3.DeleteObjectAsync(new DeleteObjectRequest
        {
            BucketName = _options.Bucket,
            Key = storageKey,
        }, cancellationToken);
    }

    public string GetPublicUrl(string objectKey)
    {
        var baseUrl = _options.PublicUrl.TrimEnd('/');
        if (baseUrl.EndsWith($"/{_options.Bucket}", StringComparison.OrdinalIgnoreCase))
        {
            return $"{baseUrl}/{objectKey}";
        }

        return $"{baseUrl}/{objectKey}";
    }
}
