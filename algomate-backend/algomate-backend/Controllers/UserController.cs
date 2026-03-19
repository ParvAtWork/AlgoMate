using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoMateBackend.Models;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Extensions;
using AlgoMateBackend.Validators; // ← ADDED

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

        // GET /api/user/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var supabaseUid = User.GetSupabaseUid();

            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            var user = await Task.Run(() => _repo.GetBySupabaseUid(supabaseUid));
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);

            return Ok(user);
        }

        // GET /api/user/{id}
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

        // POST /api/user/register
        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] User user)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // ← EDITED — UserValidator use kiya
            var validation = UserValidator.ValidateRegistration(user);
            if (!validation.IsValid)
                return BadRequest(validation.Errors);

            if (_repo.UserExists(user.Email))
                return Conflict(ErrorMessages.DuplicateEmail);

            var supabaseUid = User.GetSupabaseUid();

            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            user.SupabaseUid = supabaseUid;
            user.Role = Roles.Student;
            user.CreatedAt = DateTime.UtcNow;
            user.LastLoginAt = DateTime.UtcNow;

            await Task.Run(() => _repo.AddUser(user));
            return CreatedAtAction(nameof(GetUserById),
                new { id = user.Id }, user);
        }

        // PUT /api/user/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] User updatedUser)
        {
            var supabaseUid = User.GetSupabaseUid();

            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            var existing = await Task.Run(() => _repo.GetBySupabaseUid(supabaseUid));
            if (existing == null)
                return NotFound(ErrorMessages.UserNotFound);

            // ← EDITED — UserValidator use kiya
            var validation = UserValidator.ValidateProfileUpdate(updatedUser.Username);
            if (!validation.IsValid)
                return BadRequest(validation.Errors);

            existing.Username = updatedUser.Username;
            existing.AvatarUrl = updatedUser.AvatarUrl;

            await Task.Run(() => _repo.UpdateUser(existing));
            return Ok(existing);
        }

        // GET /api/user/top/{count}
        [HttpGet("top/{count}")]
        public async Task<IActionResult> GetTopUsers(
            int count = AppConstants.DefaultLeaderboardCount)
        {
            if (count <= 0 || count > AppConstants.MaxLeaderboardCount)
                return BadRequest($"Count must be between 1 and {AppConstants.MaxLeaderboardCount}.");

            var users = await Task.Run(() => _repo.GetTopUsersByRating(count));
            return Ok(users);
        }

        // GET /api/user/all — Admin only
        [HttpGet("all")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await Task.Run(() => _repo.GetAllUsers());
            return Ok(users);
        }
    }
}



// using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.Authorization;
// using AlgoMateBackend.Models;
// using AlgoMateBackend.Repositories;
// using AlgoMateBackend.Constants;
// using AlgoMateBackend.Extensions; // ← ADDED
//
// namespace AlgoMateBackend.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     [Authorize]
//     public class UserController : ControllerBase
//     {
//         private readonly IUserRepository _repo;
//
//         public UserController(IUserRepository repo)
//         {
//             _repo = repo;
//         }
//
//         // GET /api/user/me
//         [HttpGet("me")]
//         public async Task<IActionResult> GetMyProfile()
//         {
//             // ← EDITED — Extension method use kiya
//             var supabaseUid = User.GetSupabaseUid();
//
//             if (string.IsNullOrEmpty(supabaseUid))
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return Unauthorized(ErrorMessages.InvalidToken);
//
//             var user = await Task.Run(() => _repo.GetBySupabaseUid(supabaseUid));
//             if (user == null)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return NotFound(ErrorMessages.UserNotFound);
//
//             return Ok(user);
//         }
//
//         // GET /api/user/{id}
//         [HttpGet("{id}")]
//         public async Task<IActionResult> GetUserById(int id)
//         {
//             if (id <= 0)
//                 // ← EDITED — ValidationMessages constant use kiya
//                 return BadRequest(string.Format(ValidationMessages.InvalidId, "user"));
//
//             var user = await Task.Run(() => _repo.GetUserById(id));
//             if (user == null)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return NotFound(ErrorMessages.UserNotFound);
//
//             // Sensitive fields hide karo
//             user.SupabaseUid = string.Empty;
//
//             return Ok(user);
//         }
//
//         // POST /api/user/register
//         [HttpPost("register")]
//         public async Task<IActionResult> RegisterUser([FromBody] User user)
//         {
//             if (!ModelState.IsValid)
//                 return BadRequest(ModelState);
//
//             if (string.IsNullOrWhiteSpace(user.Email))
//                 // ← EDITED — ValidationMessages constant use kiya
//                 return BadRequest(ValidationMessages.EmailRequired);
//
//             if (string.IsNullOrWhiteSpace(user.Username))
//                 // ← EDITED — ValidationMessages constant use kiya
//                 return BadRequest(ValidationMessages.UsernameRequired);
//
//             if (_repo.UserExists(user.Email))
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return Conflict(ErrorMessages.DuplicateEmail);
//
//             // ← EDITED — Extension method use kiya
//             var supabaseUid = User.GetSupabaseUid();
//
//             if (string.IsNullOrEmpty(supabaseUid))
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return Unauthorized(ErrorMessages.InvalidToken);
//
//             user.SupabaseUid = supabaseUid;
//             // ← EDITED — Roles constant use kiya
//             user.Role = Roles.Student;
//             user.CreatedAt = DateTime.UtcNow;
//             user.LastLoginAt = DateTime.UtcNow;
//
//             await Task.Run(() => _repo.AddUser(user));
//             return CreatedAtAction(nameof(GetUserById),
//                 new { id = user.Id }, user);
//         }
//
//         // PUT /api/user/me
//         [HttpPut("me")]
//         public async Task<IActionResult> UpdateMyProfile([FromBody] User updatedUser)
//         {
//             // ← EDITED — Extension method use kiya
//             var supabaseUid = User.GetSupabaseUid();
//
//             if (string.IsNullOrEmpty(supabaseUid))
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return Unauthorized(ErrorMessages.InvalidToken);
//
//             var existing = await Task.Run(() => _repo.GetBySupabaseUid(supabaseUid));
//             if (existing == null)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return NotFound(ErrorMessages.UserNotFound);
//
//             existing.Username = updatedUser.Username;
//             existing.AvatarUrl = updatedUser.AvatarUrl;
//
//             await Task.Run(() => _repo.UpdateUser(existing));
//             return Ok(existing);
//         }
//
//         // GET /api/user/top/{count}
//         [HttpGet("top/{count}")]
//         public async Task<IActionResult> GetTopUsers(
//             // ← EDITED — AppConstants use kiya
//             int count = AppConstants.DefaultLeaderboardCount)
//         {
//             // ← EDITED — AppConstants use kiya
//             if (count <= 0 || count > AppConstants.MaxLeaderboardCount)
//                 return BadRequest($"Count must be between 1 and {AppConstants.MaxLeaderboardCount}.");
//
//             var users = await Task.Run(() => _repo.GetTopUsersByRating(count));
//             return Ok(users);
//         }
//
//         // GET /api/user/all — Admin only
//         [HttpGet("all")]
//         // ← EDITED — Roles constant use kiya
//         [Authorize(Roles = Roles.Admin)]
//         public async Task<IActionResult> GetAllUsers()
//         {
//             var users = await Task.Run(() => _repo.GetAllUsers());
//             return Ok(users);
//         }
//     }
// }
//

// using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.Authorization;
// using AlgoMateBackend.Models;
// using AlgoMateBackend.Repositories;
// using System.Security.Claims;
//
// namespace AlgoMateBackend.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     [Authorize]                          // saare endpoints login required
//     public class UserController : ControllerBase
//     {
//         private readonly IUserRepository _repo;
//
//         public UserController(IUserRepository repo)
//         {
//             _repo = repo;
//         }
//
//         // GET /api/user/me
//         // Apna profile dekho — Supabase JWT se UID nikalta hai
//         [HttpGet("me")]
//         public async Task<IActionResult> GetMyProfile()
//         {
//             var supabaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
//                            ?? User.FindFirst("sub")?.Value;
//
//             if (string.IsNullOrEmpty(supabaseUid))
//                 return Unauthorized("Invalid token.");
//
//             var user = await Task.Run(() => _repo.GetBySupabaseUid(supabaseUid));
//             if (user == null)
//                 return NotFound("User profile not found.");
//
//             return Ok(user);
//         }
//
//         // GET /api/user/{id}
//         // Kisi bhi user ka public profile
//         [HttpGet("{id}")]
//         public async Task<IActionResult> GetUserById(int id)
//         {
//             if (id <= 0)
//                 return BadRequest("Invalid user ID.");
//
//             var user = await Task.Run(() => _repo.GetUserById(id));
//             if (user == null)
//                 return NotFound($"User with ID {id} not found.");
//
//             // Password hash aur sensitive fields hide karo
//             user.SupabaseUid = string.Empty;
//
//             return Ok(user);
//         }
//
//         // POST /api/user/register
//         // Supabase auth ke baad profile create karna
//         [HttpPost("register")]
//         public async Task<IActionResult> RegisterUser([FromBody] User user)
//         {
//             if (!ModelState.IsValid)
//                 return BadRequest(ModelState);
//
//             if (string.IsNullOrWhiteSpace(user.Email))
//                 return BadRequest("Email is required.");
//
//             if (string.IsNullOrWhiteSpace(user.Username))
//                 return BadRequest("Username is required.");
//
//             // Duplicate check
//             if (_repo.UserExists(user.Email))
//                 return Conflict("User with this email already exists.");
//
//             // Supabase UID JWT se lo
//             var supabaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
//                            ?? User.FindFirst("sub")?.Value;
//
//             if (string.IsNullOrEmpty(supabaseUid))
//                 return Unauthorized("Invalid token.");
//
//             user.SupabaseUid = supabaseUid;
//             user.Role = "Student";           // default role
//             user.CreatedAt = DateTime.UtcNow;
//             user.LastLoginAt = DateTime.UtcNow;
//
//             await Task.Run(() => _repo.AddUser(user));
//             return CreatedAtAction(nameof(GetUserById),
//                 new { id = user.Id }, user);
//         }
//
//         // PUT /api/user/me
//         // Apna profile update karo
//         [HttpPut("me")]
//         public async Task<IActionResult> UpdateMyProfile([FromBody] User updatedUser)
//         {
//             var supabaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
//                            ?? User.FindFirst("sub")?.Value;
//
//             if (string.IsNullOrEmpty(supabaseUid))
//                 return Unauthorized("Invalid token.");
//
//             var existing = await Task.Run(() => _repo.GetBySupabaseUid(supabaseUid));
//             if (existing == null)
//                 return NotFound("User not found.");
//
//             // Sirf allowed fields update karo
//             existing.Username = updatedUser.Username;
//             existing.AvatarUrl = updatedUser.AvatarUrl;
//
//             await Task.Run(() => _repo.UpdateUser(existing));
//             return Ok(existing);
//         }
//
//         // GET /api/user/top/{count}
//         // Top users by rating — leaderboard ke liye
//         [HttpGet("top/{count}")]
//         public async Task<IActionResult> GetTopUsers(int count = 10)
//         {
//             if (count <= 0 || count > 100)
//                 return BadRequest("Count must be between 1 and 100.");
//
//             var users = await Task.Run(() => _repo.GetTopUsersByRating(count));
//             return Ok(users);
//         }
//
//         // GET /api/user/all
//         // Admin only
//         [HttpGet("all")]
//         [Authorize(Roles = "Admin")]
//         public async Task<IActionResult> GetAllUsers()
//         {
//             var users = await Task.Run(() => _repo.GetAllUsers());
//             return Ok(users);
//         }
//     }
// }