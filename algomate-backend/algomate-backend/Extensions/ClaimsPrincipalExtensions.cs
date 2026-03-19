using System.Security.Claims;

namespace AlgoMateBackend.Extensions
{
    /// <summary>
    /// Extension methods for ClaimsPrincipal to simplify
    /// JWT claims extraction in controllers.
    /// Eliminates repetitive claims extraction code.
    /// </summary>
    public static class ClaimsPrincipalExtensions
    {
        /// <summary>
        /// Gets the Supabase UID from JWT claims.
        /// Checks both NameIdentifier and "sub" claim types.
        /// </summary>
        /// <param name="user">Current ClaimsPrincipal</param>
        /// <returns>Supabase UID string or null if not found</returns>
        /// <example>
        /// var supabaseUid = User.GetSupabaseUid();
        /// if (string.IsNullOrEmpty(supabaseUid))
        ///     return Unauthorized(ErrorMessages.InvalidToken);
        /// </example>
        public static string? GetSupabaseUid(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value;
        }

        /// <summary>
        /// Gets the email from JWT claims.
        /// Checks both Email and "email" claim types.
        /// </summary>
        /// <param name="user">Current ClaimsPrincipal</param>
        /// <returns>Email string or null if not found</returns>
        /// <example>
        /// var email = User.GetEmail();
        /// if (string.IsNullOrEmpty(email))
        ///     return BadRequest(ValidationMessages.EmailRequired);
        /// </example>
        public static string? GetEmail(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Email)?.Value
                ?? user.FindFirst("email")?.Value;
        }

        /// <summary>
        /// Gets the role from JWT claims.
        /// </summary>
        /// <param name="user">Current ClaimsPrincipal</param>
        /// <returns>Role string or null if not found</returns>
        /// <example>
        /// var role = User.GetRole();
        /// </example>
        public static string? GetRole(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Role)?.Value
                ?? user.FindFirst("role")?.Value;
        }

        /// <summary>
        /// Checks if the current user is an Admin.
        /// </summary>
        /// <param name="user">Current ClaimsPrincipal</param>
        /// <returns>True if user is Admin, false otherwise</returns>
        /// <example>
        /// if (!User.IsAdmin())
        ///     return Forbid();
        /// </example>
        public static bool IsAdmin(this ClaimsPrincipal user)
        {
            return user.IsInRole(Constants.Roles.Admin);
        }

        /// <summary>
        /// Validates that Supabase UID is present in token.
        /// </summary>
        /// <param name="user">Current ClaimsPrincipal</param>
        /// <returns>True if UID is present, false otherwise</returns>
        /// <example>
        /// if (!User.HasValidUid())
        ///     return Unauthorized(ErrorMessages.InvalidToken);
        /// </example>
        public static bool HasValidUid(this ClaimsPrincipal user)
        {
            return !string.IsNullOrEmpty(user.GetSupabaseUid());
        }
    }
}