using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoMateBackend.Services;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.DTOs;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Extensions;
using AlgoMateBackend.Validators; // ← ADDED

namespace AlgoMateBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserRepository _userRepo;

        public AuthController(
            IAuthService authService,
            IUserRepository userRepo)
        {
            _authService = authService;
            _userRepo = userRepo;
        }

        // POST /api/auth/register
        [HttpPost("register")]
        [Authorize]
        public async Task<IActionResult> Register([FromBody] SignupRequest request)
        {
            // ← EDITED — SignupRequestValidator use kiya
            var validation = SignupRequestValidator.Validate(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors);

            var supabaseUid = User.GetSupabaseUid();
            var email = User.GetEmail();

            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            if (string.IsNullOrEmpty(email))
                return BadRequest(ValidationMessages.EmailRequired);

            var existingUser = await Task.Run(() =>
                _userRepo.GetBySupabaseUid(supabaseUid));

            if (existingUser != null)
                return Ok(new
                {
                    message = "Already registered.",
                    userId = existingUser.Id,
                    username = existingUser.Username,
                    role = existingUser.Role
                });

            var user = await _authService.GetOrCreateUserFromSupabaseAsync(
                supabaseUid,
                email,
                request.Username
            );

            return CreatedAtAction(nameof(GetMe), new { },
                new
                {
                    message = "Registration successful.",
                    userId = user!.Id,
                    username = user.Username,
                    email = user.Email,
                    role = user.Role
                });
        }

        // GET /api/auth/me
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var supabaseUid = User.GetSupabaseUid();

            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            var user = await Task.Run(() =>
                _userRepo.GetBySupabaseUid(supabaseUid));

            if (user == null)
                return NotFound(ErrorMessages.UserNotRegistered);

            user.LastLoginAt = DateTime.UtcNow;
            await Task.Run(() => _userRepo.UpdateUser(user));

            return Ok(new
            {
                userId = user.Id,
                username = user.Username,
                email = user.Email,
                role = user.Role,
                rating = user.Rating,
                problemsSolved = user.ProblemsSolved,
                totalSubmissions = user.TotalSubmissions,
                isPremium = user.IsPremium,
                createdAt = user.CreatedAt,
                lastLoginAt = user.LastLoginAt
            });
        }

        // GET /api/auth/check
        [HttpGet("check")]
        [Authorize]
        public IActionResult CheckToken()
        {
            var supabaseUid = User.GetSupabaseUid();

            return Ok(new
            {
                isValid = true,
                supabaseUid,
                message = "Token is valid."
            });
        }
    }
}


