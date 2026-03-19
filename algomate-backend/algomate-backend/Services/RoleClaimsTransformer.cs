using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using AlgoMateBackend.Repositories;
using Microsoft.Extensions.Logging;

namespace AlgoMateBackend.Services
{
    /// <summary>
    /// Supabase JWT mein sirf "authenticated" role hoti hai.
    /// Yeh transformer database se user ka actual role fetch karke
    /// ClaimsPrincipal mein inject karta hai — har authenticated request pe.
    /// </summary>
    public class RoleClaimsTransformer : IClaimsTransformation
    {
        private readonly IUserRepository _userRepo;
        private readonly ILogger<RoleClaimsTransformer> _logger;

        // Baar baar DB hit na ho isliye cache karo ek request mein
        private const string TransformedClaimType = "role_transformed";

        public RoleClaimsTransformer(
            IUserRepository userRepo,
            ILogger<RoleClaimsTransformer> logger)
        {
            _userRepo = userRepo;
            _logger = logger;
        }

        public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            try
            {
                // Already transform ho chuka hai toh skip karo
                if (principal.HasClaim(TransformedClaimType, "true"))
                    return principal;

                // Token authenticated hai ya nahi
                if (principal.Identity == null || !principal.Identity.IsAuthenticated)
                    return principal;

                // Supabase UID nikalo JWT se
                var supabaseUid = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                               ?? principal.FindFirst("sub")?.Value;

                if (string.IsNullOrEmpty(supabaseUid))
                {
                    _logger.LogWarning("RoleClaimsTransformer: supabaseUid not found in token.");
                    return principal;
                }

                // Database se user fetch karo
                var user = await Task.Run(() => _userRepo.GetBySupabaseUid(supabaseUid));

                if (user == null)
                {
                    _logger.LogWarning(
                        "RoleClaimsTransformer: User not found in DB for UID: {Uid}", 
                        supabaseUid);
                    return principal;
                }

                // Naya identity banao with role + transformed marker
                var claimsIdentity = new ClaimsIdentity();

                claimsIdentity.AddClaim(
                    new Claim(ClaimTypes.Role, user.Role ?? "Student"));

                claimsIdentity.AddClaim(
                    new Claim(TransformedClaimType, "true"));

                // User ID bhi inject karo — controllers mein kaam aayega
                claimsIdentity.AddClaim(
                    new Claim("app_user_id", user.Id.ToString()));

                principal.AddIdentity(claimsIdentity);

                _logger.LogDebug(
                    "RoleClaimsTransformer: Role '{Role}' injected for user {UserId}",
                    user.Role, user.Id);

                return principal;
            }
            catch (Exception ex)
            {
                // Transform fail ho toh bhi request block mat karo
                _logger.LogError(ex, 
                    "RoleClaimsTransformer: Unexpected error during claims transformation.");
                return principal;
            }
        }
    }
}