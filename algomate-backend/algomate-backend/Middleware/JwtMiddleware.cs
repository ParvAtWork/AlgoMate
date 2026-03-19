using System.IdentityModel.Tokens.Jwt;
using AlgoMateBackend.Repositories;

namespace AlgoMateBackend.Middleware
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<JwtMiddleware> _logger;

        public JwtMiddleware(
            RequestDelegate next,
            ILogger<JwtMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, IUserRepository userRepo)
        {
            var token = ExtractToken(context);

            if (!string.IsNullOrEmpty(token))
            {
                await AttachUserToContext(context, userRepo, token);
            }

            await _next(context);
        }

        // Authorization header se token nikalo
        private static string? ExtractToken(HttpContext context)
        {
            var authHeader = context.Request.Headers["Authorization"]
                .FirstOrDefault();

            if (authHeader != null && authHeader.StartsWith("Bearer "))
                return authHeader["Bearer ".Length..].Trim();

            return null;
        }

        // Token se user fetch karke context mein attach karo
        private async Task AttachUserToContext(
            HttpContext context,
            IUserRepository userRepo,
            string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);

                // Supabase UID "sub" claim mein hota hai
                var supabaseUid = jwtToken.Claims
                    .FirstOrDefault(c => c.Type == "sub")?.Value;

                if (!string.IsNullOrEmpty(supabaseUid))
                {
                    // User fetch karo aur context mein store karo
                    var user = await Task.Run(() =>
                        userRepo.GetBySupabaseUid(supabaseUid));

                    if (user != null)
                    {
                        context.Items["UserId"] = user.Id;
                        context.Items["UserRole"] = user.Role;
                        context.Items["SupabaseUid"] = supabaseUid;
                    }
                }
            }
            catch (Exception ex)
            {
                // Token invalid — log karo but block mat karo
                // [Authorize] attribute handle karega
                _logger.LogWarning("JWT parsing failed: {Message}", ex.Message);
            }
        }
    }
}