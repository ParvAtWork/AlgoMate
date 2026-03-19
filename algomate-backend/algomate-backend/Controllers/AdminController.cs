using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoMateBackend.Models;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.Services;
using AlgoMateBackend.Enums;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Validators; // ← ADDED

namespace AlgoMateBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.Admin)]
    public class AdminController : ControllerBase
    {
        private readonly IUserRepository _userRepo;
        private readonly IProblemRepository _problemRepo;
        private readonly ISubmissionRepository _submissionRepo;
        private readonly ILeaderboardRepository _leaderboardRepo;
        private readonly ILeaderboardService _leaderboardService;
        private readonly IProblemService _problemService;

        public AdminController(
            IUserRepository userRepo,
            IProblemRepository problemRepo,
            ISubmissionRepository submissionRepo,
            ILeaderboardRepository leaderboardRepo,
            ILeaderboardService leaderboardService,
            IProblemService problemService)
        {
            _userRepo = userRepo;
            _problemRepo = problemRepo;
            _submissionRepo = submissionRepo;
            _leaderboardRepo = leaderboardRepo;
            _leaderboardService = leaderboardService;
            _problemService = problemService;
        }

        // =============================================
        // DASHBOARD STATS
        // =============================================

        // GET /api/admin/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalUsers = await Task.Run(() => _userRepo.GetTotalUsers());
            var totalProblems = await Task.Run(() => _problemRepo.GetTotalProblems());
            var totalSubmissions = await Task.Run(() => _submissionRepo.GetTotalSubmissions());
            var acceptedSubmissions = await Task.Run(() => _submissionRepo.GetAcceptedSubmissions());
            var problemStats = await _problemService.GetProblemStatsAsync();

            return Ok(new
            {
                totalUsers,
                totalProblems,
                totalSubmissions,
                acceptedSubmissions,
                acceptanceRate = totalSubmissions > 0
                    ? Math.Round((double)acceptedSubmissions / totalSubmissions * 100, 2)
                    : 0,
                problemStats
            });
        }

        // =============================================
        // USER MANAGEMENT
        // =============================================

        // GET /api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await Task.Run(() => _userRepo.GetAllUsers());
            return Ok(users);
        }

        // PUT /api/admin/users/{id}/role
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(
            int id, [FromBody] UpdateRoleRequest request)
        {
            if (!Roles.IsValid(request.Role))
                return BadRequest($"Role must be one of: {string.Join(", ", Roles.AllRoles)}");

            var user = await Task.Run(() => _userRepo.GetUserById(id));
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);

            user.Role = request.Role;
            await Task.Run(() => _userRepo.UpdateUser(user));

            return Ok(new { message = $"User {id} role updated to {request.Role}." });
        }

        // PUT /api/admin/users/{id}/premium
        [HttpPut("users/{id}/premium")]
        public async Task<IActionResult> TogglePremium(
            int id, [FromBody] TogglePremiumRequest request)
        {
            var user = await Task.Run(() => _userRepo.GetUserById(id));
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);

            user.IsPremium = request.IsPremium;
            await Task.Run(() => _userRepo.UpdateUser(user));

            return Ok(new
            {
                message = $"User {id} premium status set to {request.IsPremium}."
            });
        }

        // DELETE /api/admin/users/{id}
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await Task.Run(() => _userRepo.GetUserById(id));
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);

            await Task.Run(() => _userRepo.DeleteUser(id));
            return Ok(new { message = $"User {id} deleted successfully." });
        }

        // =============================================
        // PROBLEM MANAGEMENT
        // =============================================

        // POST /api/admin/problems
        [HttpPost("problems")]
        public async Task<IActionResult> AddProblem([FromBody] Problem problem)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // ← EDITED — DifficultyExtensions validate karo
            if (!DifficultyExtensions.IsValid(problem.Difficulty))
                return BadRequest(ValidationMessages.InvalidDifficulty);

            var added = await _problemService.AddProblemAsync(problem);
            return CreatedAtAction(nameof(GetProblemById),
                new { id = added.Id }, added);
        }

        // GET /api/admin/problems/{id}
        [HttpGet("problems/{id}")]
        public async Task<IActionResult> GetProblemById(int id)
        {
            var problem = await _problemService.GetProblemByIdAsync(id);
            if (problem == null)
                return NotFound(ErrorMessages.ProblemNotFound);

            return Ok(problem);
        }

        // PUT /api/admin/problems/{id}
        [HttpPut("problems/{id}")]
        public async Task<IActionResult> UpdateProblem(
            int id, [FromBody] Problem problem)
        {
            if (id != problem.Id)
                return BadRequest(ErrorMessages.BadRequest);

            var existing = await _problemService.GetProblemByIdAsync(id);
            if (existing == null)
                return NotFound(ErrorMessages.ProblemNotFound);

            if (!DifficultyExtensions.IsValid(problem.Difficulty))
                return BadRequest(ValidationMessages.InvalidDifficulty);

            await _problemService.UpdateProblemAsync(problem);
            return NoContent();
        }

        // DELETE /api/admin/problems/{id}
        [HttpDelete("problems/{id}")]
        public async Task<IActionResult> DeleteProblem(int id)
        {
            var existing = await _problemService.GetProblemByIdAsync(id);
            if (existing == null)
                return NotFound(ErrorMessages.ProblemNotFound);

            await _problemService.DeleteProblemAsync(id);
            return Ok(new { message = $"Problem {id} deleted successfully." });
        }

        // =============================================
        // SUBMISSION MANAGEMENT
        // =============================================

        // GET /api/admin/submissions
        [HttpGet("submissions")]
        public async Task<IActionResult> GetAllSubmissions()
        {
            var submissions = await Task.Run(() => _submissionRepo.GetAllSubmissions());
            return Ok(submissions);
        }

        // GET /api/admin/submissions/recent
        [HttpGet("submissions/recent")]
        public async Task<IActionResult> GetRecentSubmissions(
            [FromQuery] int count = AppConstants.DefaultPageSize)
        {
            if (count <= 0 || count > AppConstants.MaxPageSize)
                return BadRequest($"Count must be between 1 and {AppConstants.MaxPageSize}.");

            var submissions = await Task.Run(() => _submissionRepo.GetRecentSubmissions(count));
            return Ok(submissions);
        }

        // =============================================
        // LEADERBOARD MANAGEMENT
        // =============================================

        // POST /api/admin/leaderboard/recalculate
        [HttpPost("leaderboard/recalculate")]
        public async Task<IActionResult> RecalculateLeaderboard(
            [FromQuery] string period = "AllTime")
        {
            if (!LeaderboardPeriodExtensions.IsValid(period))
                return BadRequest($"{ErrorMessages.InvalidPeriod} Valid values: {string.Join(", ", LeaderboardPeriodExtensions.GetAllPeriods())}");

            var periodEnum = Enum.Parse<LeaderboardPeriod>(period, true);
            await _leaderboardService.RecalculateAllRanksAsync(periodEnum);
            return Ok(new { message = $"Leaderboard recalculated for {period}." });
        }
    }

    // Request DTOs
    public class UpdateRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }

    public class TogglePremiumRequest
    {
        public bool IsPremium { get; set; }
    }
}


// using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.Authorization;
// using AlgoMateBackend.Models;
// using AlgoMateBackend.Repositories;
// using AlgoMateBackend.Services;
// using AlgoMateBackend.Enums;
// using AlgoMateBackend.Constants; // ← ADDED
//
// namespace AlgoMateBackend.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     [Authorize(Roles = Roles.Admin)] // ← EDITED — Roles constant use kiya
//     public class AdminController : ControllerBase
//     {
//         private readonly IUserRepository _userRepo;
//         private readonly IProblemRepository _problemRepo;
//         private readonly ISubmissionRepository _submissionRepo;
//         private readonly ILeaderboardRepository _leaderboardRepo;
//         private readonly ILeaderboardService _leaderboardService;
//         private readonly IProblemService _problemService;
//
//         public AdminController(
//             IUserRepository userRepo,
//             IProblemRepository problemRepo,
//             ISubmissionRepository submissionRepo,
//             ILeaderboardRepository leaderboardRepo,
//             ILeaderboardService leaderboardService,
//             IProblemService problemService)
//         {
//             _userRepo = userRepo;
//             _problemRepo = problemRepo;
//             _submissionRepo = submissionRepo;
//             _leaderboardRepo = leaderboardRepo;
//             _leaderboardService = leaderboardService;
//             _problemService = problemService;
//         }
//
//         // =============================================
//         // DASHBOARD STATS
//         // =============================================
//
//         // GET /api/admin/stats
//         [HttpGet("stats")]
//         public async Task<IActionResult> GetDashboardStats()
//         {
//             var totalUsers = await Task.Run(() => _userRepo.GetTotalUsers());
//             var totalProblems = await Task.Run(() => _problemRepo.GetTotalProblems());
//             var totalSubmissions = await Task.Run(() => _submissionRepo.GetTotalSubmissions());
//             var acceptedSubmissions = await Task.Run(() => _submissionRepo.GetAcceptedSubmissions());
//             var problemStats = await _problemService.GetProblemStatsAsync();
//
//             return Ok(new
//             {
//                 totalUsers,
//                 totalProblems,
//                 totalSubmissions,
//                 acceptedSubmissions,
//                 acceptanceRate = totalSubmissions > 0
//                     ? Math.Round((double)acceptedSubmissions / totalSubmissions * 100, 2)
//                     : 0,
//                 problemStats
//             });
//         }
//
//         // =============================================
//         // USER MANAGEMENT
//         // =============================================
//
//         // GET /api/admin/users
//         [HttpGet("users")]
//         public async Task<IActionResult> GetAllUsers()
//         {
//             var users = await Task.Run(() => _userRepo.GetAllUsers());
//             return Ok(users);
//         }
//
//         // PUT /api/admin/users/{id}/role
//         [HttpPut("users/{id}/role")]
//         public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleRequest request)
//         {
//             // ← EDITED — Roles constant use kiya
//             if (!Roles.IsValid(request.Role))
//                 return BadRequest($"Role must be one of: {string.Join(", ", Roles.AllRoles)}");
//
//             var user = await Task.Run(() => _userRepo.GetUserById(id));
//             if (user == null)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return NotFound(ErrorMessages.UserNotFound);
//
//             user.Role = request.Role;
//             await Task.Run(() => _userRepo.UpdateUser(user));
//
//             return Ok(new { message = $"User {id} role updated to {request.Role}." });
//         }
//
//         // PUT /api/admin/users/{id}/premium
//         [HttpPut("users/{id}/premium")]
//         public async Task<IActionResult> TogglePremium(int id, [FromBody] TogglePremiumRequest request)
//         {
//             var user = await Task.Run(() => _userRepo.GetUserById(id));
//             if (user == null)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return NotFound(ErrorMessages.UserNotFound);
//
//             user.IsPremium = request.IsPremium;
//             await Task.Run(() => _userRepo.UpdateUser(user));
//
//             return Ok(new
//             {
//                 message = $"User {id} premium status set to {request.IsPremium}."
//             });
//         }
//
//         // DELETE /api/admin/users/{id}
//         [HttpDelete("users/{id}")]
//         public async Task<IActionResult> DeleteUser(int id)
//         {
//             var user = await Task.Run(() => _userRepo.GetUserById(id));
//             if (user == null)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return NotFound(ErrorMessages.UserNotFound);
//
//             await Task.Run(() => _userRepo.DeleteUser(id));
//             return Ok(new { message = $"User {id} deleted successfully." });
//         }
//
//         // =============================================
//         // PROBLEM MANAGEMENT
//         // =============================================
//
//         // POST /api/admin/problems
//         [HttpPost("problems")]
//         public async Task<IActionResult> AddProblem([FromBody] Problem problem)
//         {
//             if (!ModelState.IsValid)
//                 return BadRequest(ModelState);
//
//             // ← EDITED — ValidationMessages constant use kiya
//             if (!DifficultyExtensions.IsValid(problem.Difficulty))
//                 return BadRequest(ValidationMessages.InvalidDifficulty);
//
//             var added = await _problemService.AddProblemAsync(problem);
//             return CreatedAtAction(nameof(GetProblemById),
//                 new { id = added.Id }, added);
//         }
//
//         // GET /api/admin/problems/{id}
//         [HttpGet("problems/{id}")]
//         public async Task<IActionResult> GetProblemById(int id)
//         {
//             var problem = await _problemService.GetProblemByIdAsync(id);
//             if (problem == null)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return NotFound(ErrorMessages.ProblemNotFound);
//
//             return Ok(problem);
//         }
//
//         // PUT /api/admin/problems/{id}
//         [HttpPut("problems/{id}")]
//         public async Task<IActionResult> UpdateProblem(int id, [FromBody] Problem problem)
//         {
//             if (id != problem.Id)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return BadRequest(ErrorMessages.BadRequest);
//
//             var existing = await _problemService.GetProblemByIdAsync(id);
//             if (existing == null)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return NotFound(ErrorMessages.ProblemNotFound);
//
//             // ← EDITED — ValidationMessages constant use kiya
//             if (!DifficultyExtensions.IsValid(problem.Difficulty))
//                 return BadRequest(ValidationMessages.InvalidDifficulty);
//
//             await _problemService.UpdateProblemAsync(problem);
//             return NoContent();
//         }
//
//         // DELETE /api/admin/problems/{id}
//         [HttpDelete("problems/{id}")]
//         public async Task<IActionResult> DeleteProblem(int id)
//         {
//             var existing = await _problemService.GetProblemByIdAsync(id);
//             if (existing == null)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return NotFound(ErrorMessages.ProblemNotFound);
//
//             await _problemService.DeleteProblemAsync(id);
//             return Ok(new { message = $"Problem {id} deleted successfully." });
//         }
//
//         // =============================================
//         // SUBMISSION MANAGEMENT
//         // =============================================
//
//         // GET /api/admin/submissions
//         [HttpGet("submissions")]
//         public async Task<IActionResult> GetAllSubmissions()
//         {
//             var submissions = await Task.Run(() => _submissionRepo.GetAllSubmissions());
//             return Ok(submissions);
//         }
//
//         // GET /api/admin/submissions/recent
//         [HttpGet("submissions/recent")]
//         public async Task<IActionResult> GetRecentSubmissions(
//             // ← EDITED — AppConstants use kiya
//             [FromQuery] int count = AppConstants.DefaultPageSize)
//         {
//             // ← EDITED — AppConstants use kiya
//             if (count <= 0 || count > AppConstants.MaxPageSize)
//                 return BadRequest($"Count must be between 1 and {AppConstants.MaxPageSize}.");
//
//             var submissions = await Task.Run(() => _submissionRepo.GetRecentSubmissions(count));
//             return Ok(submissions);
//         }
//
//         // =============================================
//         // LEADERBOARD MANAGEMENT
//         // =============================================
//
//         // POST /api/admin/leaderboard/recalculate
//         [HttpPost("leaderboard/recalculate")]
//         public async Task<IActionResult> RecalculateLeaderboard([FromQuery] string period = "AllTime")
//         {
//             // ← EDITED — ErrorMessages constant use kiya
//             if (!LeaderboardPeriodExtensions.IsValid(period))
//                 return BadRequest($"{ErrorMessages.InvalidPeriod} Valid values: {string.Join(", ", LeaderboardPeriodExtensions.GetAllPeriods())}");
//
//             var periodEnum = Enum.Parse<LeaderboardPeriod>(period, true);
//             await _leaderboardService.RecalculateAllRanksAsync(periodEnum);
//             return Ok(new { message = $"Leaderboard recalculated for {period}." });
//         }
//     }
//
//     // Request DTOs
//     public class UpdateRoleRequest
//     {
//         public string Role { get; set; } = string.Empty;
//     }
//
//     public class TogglePremiumRequest
//     {
//         public bool IsPremium { get; set; }
//     }
// }
//
