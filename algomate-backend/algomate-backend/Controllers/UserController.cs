using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using AlgoMateBackend.Models;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Extensions;
using AlgoMateBackend.Validators;

namespace AlgoMateBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _repo;

        public UserController(IUserRepository repo)
        {
            _repo = repo;
        }

        // ── GET /api/user/me ─────────────────────────────────────
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var supabaseUid = User.GetSupabaseUid();
            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            var user = await Task.Run(() => _repo.GetBySupabaseUid(supabaseUid));
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.Role,
                user.IsPremium,
                user.Rating,
                user.Streak,
                user.ProblemsSolved,
                user.TotalSubmissions,
                user.AvatarUrl,
                user.Bio,
                user.CreatedAt,
                user.LastLoginAt,
            });
        }

        // ── GET /api/user/{id} ───────────────────────────────────
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            if (id <= 0)
                return BadRequest(string.Format(ValidationMessages.InvalidId, "user"));

            var user = await Task.Run(() => _repo.GetUserById(id));
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);

            user.SupabaseUid = string.Empty;
            return Ok(user);
        }

        // ── POST /api/user/register ──────────────────────────────
        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] User user)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var validation = UserValidator.ValidateRegistration(user);
            if (!validation.IsValid)
                return BadRequest(validation.Errors);

            if (_repo.UserExists(user.Email))
                return Conflict(ErrorMessages.DuplicateEmail);

            var supabaseUid = User.GetSupabaseUid();
            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            user.SupabaseUid  = supabaseUid;
            user.Role         = Roles.Student;
            user.CreatedAt    = DateTime.UtcNow;
            user.LastLoginAt  = DateTime.UtcNow;

            await Task.Run(() => _repo.AddUser(user));
            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }

        // ── PUT /api/user/profile ────────────────────────────────
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var supabaseUid = User.GetSupabaseUid();
            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            var existing = await Task.Run(() => _repo.GetBySupabaseUid(supabaseUid));
            if (existing == null)
                return NotFound(ErrorMessages.UserNotFound);

            if (!string.IsNullOrWhiteSpace(request.Username))
                existing.Username = request.Username.Trim();

            if (request.Bio != null)
                existing.Bio = request.Bio.Trim();

            await Task.Run(() => _repo.UpdateUser(existing));
            return Ok(new { message = "Profile updated successfully." });
        }

        // ── PUT /api/user/me (legacy support) ───────────────────
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] User updatedUser)
        {
            var supabaseUid = User.GetSupabaseUid();
            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            var existing = await Task.Run(() => _repo.GetBySupabaseUid(supabaseUid));
            if (existing == null)
                return NotFound(ErrorMessages.UserNotFound);

            var validation = UserValidator.ValidateProfileUpdate(updatedUser.Username);
            if (!validation.IsValid)
                return BadRequest(validation.Errors);

            existing.Username  = updatedUser.Username;
            existing.AvatarUrl = updatedUser.AvatarUrl;

            await Task.Run(() => _repo.UpdateUser(existing));
            return Ok(existing);
        }

        // ── POST /api/user/avatar ────────────────────────────────
        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            if (file.Length > 2 * 1024 * 1024)
                return BadRequest("File size must be less than 2MB.");

            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest("Only JPG, PNG, GIF, WEBP allowed.");

            var supabaseUid = User.GetSupabaseUid();
            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            var user = await Task.Run(() => _repo.GetBySupabaseUid(supabaseUid));
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);

            // ── Base64 mein convert karo ──────────────────────────
            using var ms    = new MemoryStream();
            await file.CopyToAsync(ms);
            var base64      = Convert.ToBase64String(ms.ToArray());
            var dataUrl     = $"data:{file.ContentType};base64,{base64}";

            user.AvatarUrl  = dataUrl;
            await Task.Run(() => _repo.UpdateUser(user));

            return Ok(new
            {
                message   = "Avatar uploaded successfully.",
                avatarUrl = dataUrl,
            });
        }

        // ── GET /api/user/top/{count} ────────────────────────────
        [HttpGet("top/{count}")]
        public async Task<IActionResult> GetTopUsers(
            int count = AppConstants.DefaultLeaderboardCount)
        {
            if (count <= 0 || count > AppConstants.MaxLeaderboardCount)
                return BadRequest($"Count must be between 1 and {AppConstants.MaxLeaderboardCount}.");

            var users = await Task.Run(() => _repo.GetTopUsersByRating(count));
            return Ok(users);
        }

        // ── GET /api/user/all — Admin only ───────────────────────
        [HttpGet("all")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await Task.Run(() => _repo.GetAllUsers());
            return Ok(users);
        }
    }

    // ── Request DTOs ─────────────────────────────────────────────
    public class UpdateProfileRequest
    {
        public string? Username { get; set; }
        public string? Bio      { get; set; }
    }
}