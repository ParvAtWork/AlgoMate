using AlgoMateBackend.Models;
using AlgoMateBackend.Repositories;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;

namespace AlgoMateBackend.Services
{
    // =============================================
    // INTERFACE
    // =============================================
    public interface IAuthService
    {
        Task<User?> GetOrCreateUserFromSupabaseAsync(string supabaseUid, string email, string username);
        Task<User?> GetUserFromTokenAsync(string jwtToken);
        bool IsTokenValid(string jwtToken);
    }

    // =============================================
    // AUTH SERVICE IMPLEMENTATION
    // =============================================
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IConfiguration _config;

        public AuthService(
            IUserRepository userRepo,
            IConfiguration config)
        {
            _userRepo = userRepo;
            _config = config;
        }

        // =============================================
        // Supabase login ke baad user profile
        // create karo ya existing fetch karo
        // =============================================
        public async Task<User?> GetOrCreateUserFromSupabaseAsync(
            string supabaseUid,
            string email,
            string username)
        {
            // Pehle check karo — user already exist karta hai?
            var existingUser = await Task.Run(() =>
                _userRepo.GetBySupabaseUid(supabaseUid));

            if (existingUser != null)
            {
                // Last login update karo
                existingUser.LastLoginAt = DateTime.UtcNow;
                await Task.Run(() => _userRepo.UpdateUser(existingUser));
                return existingUser;
            }

            // Naya user banao
            var newUser = new User
            {
                SupabaseUid = supabaseUid,
                Email = email,
                Username = username,
                Role = "Student",
                Rating = 0,
                ProblemsSolved = 0,
                TotalSubmissions = 0,
                IsPremium = false,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            await Task.Run(() => _userRepo.AddUser(newUser));
            return newUser;
        }

        // =============================================
        // JWT token se user fetch karo
        // =============================================
        public async Task<User?> GetUserFromTokenAsync(string jwtToken)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var token = handler.ReadJwtToken(jwtToken);

                // Supabase UID "sub" claim mein hota hai
                var supabaseUid = token.Claims
                    .FirstOrDefault(c => c.Type == "sub")?.Value;

                if (string.IsNullOrEmpty(supabaseUid))
                    return null;

                return await Task.Run(() =>
                    _userRepo.GetBySupabaseUid(supabaseUid));
            }
            catch
            {
                return null;
            }
        }

        // =============================================
        // Token valid hai ya nahi check karo
        // =============================================
        public bool IsTokenValid(string jwtToken)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var token = handler.ReadJwtToken(jwtToken);

                // Expiry check karo
                return token.ValidTo > DateTime.UtcNow;
            }
            catch
            {
                return false;
            }
        }
    }
}