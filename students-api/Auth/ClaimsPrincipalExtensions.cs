using System.Security.Claims;

namespace StudentsApi.Auth;

public static class AuthConstants
{
    public const string RoleClaimType =
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

    public const string StudentRole = "Student";
    public const string TeacherRole = "Teacher";
    public const string AdminRole = "Admin";
}

public static class ClaimsPrincipalExtensions
{
    public static string? GetUserSub(this ClaimsPrincipal user) =>
        user.FindFirstValue("sub") ??
        user.FindFirstValue(ClaimTypes.NameIdentifier);

    public static string? GetUserName(this ClaimsPrincipal user) =>
        user.FindFirstValue("name") ??
        user.FindFirstValue(ClaimTypes.Name);

    public static IReadOnlyList<string> GetRoles(this ClaimsPrincipal user)
    {
        var roles = user.FindAll(AuthConstants.RoleClaimType)
            .Select(c => c.Value)
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .ToList();

        if (roles.Count > 0) return roles;

        return user.FindAll(ClaimTypes.Role)
            .Select(c => c.Value)
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .ToList();
    }

    public static bool IsAdminOrTeacher(this ClaimsPrincipal user)
    {
        var roles = user.GetRoles();
        return roles.Contains(AuthConstants.AdminRole, StringComparer.OrdinalIgnoreCase) ||
               roles.Contains(AuthConstants.TeacherRole, StringComparer.OrdinalIgnoreCase);
    }
}
