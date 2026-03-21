using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoMateBackend.Models;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.Services;
using AlgoMateBackend.Enums;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Validators;
using AlgoMateBackend.DTOs;

namespace AlgoMateBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.Admin)]
    public class AdminController : ControllerBase
    {
        private readonly IUserRepository       _userRepo;
        private readonly IProblemRepository    _problemRepo;
        private readonly ISubmissionRepository _submissionRepo;
        private readonly ILeaderboardRepository _leaderboardRepo;
        private readonly ILeaderboardService   _leaderboardService;
        private readonly IProblemService       _problemService;

        public AdminController(
            IUserRepository       userRepo,
            IProblemRepository    problemRepo,
            ISubmissionRepository submissionRepo,
            ILeaderboardRepository leaderboardRepo,
            ILeaderboardService   leaderboardService,
            IProblemService       problemService)
        {
            _userRepo           = userRepo;
            _problemRepo        = problemRepo;
            _submissionRepo     = submissionRepo;
            _leaderboardRepo    = leaderboardRepo;
            _leaderboardService = leaderboardService;
            _problemService     = problemService;
        }

        // =============================================
        // DASHBOARD STATS
        // =============================================
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalUsers          = await Task.Run(() => _userRepo.GetTotalUsers());
            var totalProblems       = await Task.Run(() => _problemRepo.GetTotalProblems());
            var totalSubmissions    = await Task.Run(() => _submissionRepo.GetTotalSubmissions());
            var acceptedSubmissions = await Task.Run(() => _submissionRepo.GetAcceptedSubmissions());
            var problemStats        = await _problemService.GetProblemStatsAsync();

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
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await Task.Run(() => _userRepo.GetAllUsers());
            return Ok(users);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleRequest request)
        {
            if (!Roles.IsValid(request.Role))
                return BadRequest($"Role must be one of: {string.Join(", ", Roles.AllRoles)}");

            var user = await Task.Run(() => _userRepo.GetUserById(id));
            if (user == null) return NotFound(ErrorMessages.UserNotFound);

            user.Role = request.Role;
            await Task.Run(() => _userRepo.UpdateUser(user));
            return Ok(new { message = $"User {id} role updated to {request.Role}." });
        }

        [HttpPut("users/{id}/premium")]
        public async Task<IActionResult> TogglePremium(int id, [FromBody] TogglePremiumRequest request)
        {
            var user = await Task.Run(() => _userRepo.GetUserById(id));
            if (user == null) return NotFound(ErrorMessages.UserNotFound);

            user.IsPremium = request.IsPremium;
            await Task.Run(() => _userRepo.UpdateUser(user));
            return Ok(new { message = $"User {id} premium status set to {request.IsPremium}." });
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await Task.Run(() => _userRepo.GetUserById(id));
            if (user == null) return NotFound(ErrorMessages.UserNotFound);

            await Task.Run(() => _userRepo.DeleteUser(id));
            return Ok(new { message = $"User {id} deleted successfully." });
        }

        // =============================================
        // PROBLEM MANAGEMENT
        // =============================================
        [HttpPost("problems")]
        public async Task<IActionResult> AddProblem([FromBody] CreateProblemDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (!DifficultyExtensions.IsValid(dto.Difficulty))
                return BadRequest(ValidationMessages.InvalidDifficulty);

            var problem = new Problem
            {
                Title           = dto.Title,
                Description     = dto.Description,
                Difficulty      = dto.Difficulty,
                Topic           = dto.Topic,
                InputFormat     = dto.InputFormat,
                OutputFormat    = dto.OutputFormat,
                SampleInput     = dto.SampleInput,
                SampleOutput    = dto.SampleOutput,
                Constraints     = dto.Constraints,
                TimeLimitMs     = dto.TimeLimitMs,
                MemoryLimitMb   = dto.MemoryLimitMb,
                MaxScore        = dto.MaxScore,
                ContributorName = dto.ContributorName,
                Hints           = dto.Hints,   // ← Hints
                IsActive        = true,
                CreatedAt       = DateTime.UtcNow,
            };

            var added = await _problemService.AddProblemAsync(problem);

            if (dto.TestCases.Any())
            {
                foreach (var tc in dto.TestCases)
                {
                    var testCase = new TestCase
                    {
                        ProblemId      = added.Id,
                        Input          = tc.Input,
                        ExpectedOutput = tc.ExpectedOutput,
                        IsHidden       = tc.IsHidden,
                        Points         = tc.Points > 0 ? tc.Points : 10,
                    };
                    await Task.Run(() => _problemRepo.AddTestCase(testCase));
                }
            }

            return CreatedAtAction(nameof(GetProblemById), new { id = added.Id }, new
            {
                problem   = added,
                testCases = dto.TestCases.Count,
                message   = $"Problem '{added.Title}' added with {dto.TestCases.Count} test cases."
            });
        }

        [HttpGet("problems/{id}")]
        public async Task<IActionResult> GetProblemById(int id)
        {
            var problem = await _problemService.GetProblemByIdAsync(id);
            if (problem == null) return NotFound(ErrorMessages.ProblemNotFound);

            var testCases = await Task.Run(() => _problemRepo.GetTestCases(id));
            return Ok(new
            {
                problem,
                testCases = testCases.Select(tc => new TestCaseResponseDTO
                {
                    Id             = tc.Id,
                    ProblemId      = tc.ProblemId,
                    Input          = tc.Input,
                    ExpectedOutput = tc.ExpectedOutput,
                    IsHidden       = tc.IsHidden,
                    Points         = tc.Points,
                })
            });
        }

        [HttpPut("problems/{id}")]
        public async Task<IActionResult> UpdateProblem(int id, [FromBody] CreateProblemDTO dto)
        {
            var existing = await _problemService.GetProblemByIdAsync(id);
            if (existing == null) return NotFound(ErrorMessages.ProblemNotFound);

            if (!DifficultyExtensions.IsValid(dto.Difficulty))
                return BadRequest(ValidationMessages.InvalidDifficulty);

            existing.Title           = dto.Title;
            existing.Description     = dto.Description;
            existing.Difficulty      = dto.Difficulty;
            existing.Topic           = dto.Topic;
            existing.InputFormat     = dto.InputFormat;
            existing.OutputFormat    = dto.OutputFormat;
            existing.SampleInput     = dto.SampleInput;
            existing.SampleOutput    = dto.SampleOutput;
            existing.Constraints     = dto.Constraints;
            existing.TimeLimitMs     = dto.TimeLimitMs;
            existing.MemoryLimitMb   = dto.MemoryLimitMb;
            existing.MaxScore        = dto.MaxScore;
            existing.ContributorName = dto.ContributorName;
            existing.Hints           = dto.Hints;   // ← Hints

            await _problemService.UpdateProblemAsync(existing);

            if (dto.TestCases.Any())
            {
                await Task.Run(() => _problemRepo.DeleteAllTestCases(id));
                foreach (var tc in dto.TestCases)
                {
                    var testCase = new TestCase
                    {
                        ProblemId      = id,
                        Input          = tc.Input,
                        ExpectedOutput = tc.ExpectedOutput,
                        IsHidden       = tc.IsHidden,
                        Points         = tc.Points > 0 ? tc.Points : 10,
                    };
                    await Task.Run(() => _problemRepo.AddTestCase(testCase));
                }
            }

            return Ok(new { message = $"Problem {id} updated with {dto.TestCases.Count} test cases." });
        }

        [HttpDelete("problems/{id}")]
        public async Task<IActionResult> DeleteProblem(int id)
        {
            var existing = await _problemService.GetProblemByIdAsync(id);
            if (existing == null) return NotFound(ErrorMessages.ProblemNotFound);

            await Task.Run(() => _problemRepo.DeleteAllTestCases(id));
            await _problemService.DeleteProblemAsync(id);
            return Ok(new { message = $"Problem {id} and its test cases deleted successfully." });
        }

        // =============================================
        // TEST CASE MANAGEMENT
        // =============================================
        [HttpGet("problems/{problemId}/testcases")]
        public async Task<IActionResult> GetTestCases(int problemId)
        {
            var problem = await _problemService.GetProblemByIdAsync(problemId);
            if (problem == null) return NotFound(ErrorMessages.ProblemNotFound);

            var testCases = await Task.Run(() => _problemRepo.GetTestCases(problemId));
            return Ok(testCases.Select(tc => new TestCaseResponseDTO
            {
                Id             = tc.Id,
                ProblemId      = tc.ProblemId,
                Input          = tc.Input,
                ExpectedOutput = tc.ExpectedOutput,
                IsHidden       = tc.IsHidden,
                Points         = tc.Points,
            }));
        }

        [HttpPost("problems/{problemId}/testcases")]
        public async Task<IActionResult> AddTestCase(int problemId, [FromBody] TestCaseDTO dto)
        {
            var problem = await _problemService.GetProblemByIdAsync(problemId);
            if (problem == null) return NotFound(ErrorMessages.ProblemNotFound);

            if (string.IsNullOrWhiteSpace(dto.Input) || string.IsNullOrWhiteSpace(dto.ExpectedOutput))
                return BadRequest("Input and ExpectedOutput are required.");

            var testCase = new TestCase
            {
                ProblemId      = problemId,
                Input          = dto.Input,
                ExpectedOutput = dto.ExpectedOutput,
                IsHidden       = dto.IsHidden,
                Points         = dto.Points > 0 ? dto.Points : 10,
            };

            await Task.Run(() => _problemRepo.AddTestCase(testCase));
            return Ok(new
            {
                message  = "Test case added successfully.",
                testCase = new TestCaseResponseDTO
                {
                    Id             = testCase.Id,
                    ProblemId      = testCase.ProblemId,
                    Input          = testCase.Input,
                    ExpectedOutput = testCase.ExpectedOutput,
                    IsHidden       = testCase.IsHidden,
                    Points         = testCase.Points,
                }
            });
        }

        [HttpPut("testcases/{id}")]
        public async Task<IActionResult> UpdateTestCase(int id, [FromBody] TestCaseDTO dto)
        {
            var existing = await Task.Run(() => _problemRepo.GetTestCaseById(id));
            if (existing == null) return NotFound("Test case not found.");

            existing.Input          = dto.Input;
            existing.ExpectedOutput = dto.ExpectedOutput;
            existing.IsHidden       = dto.IsHidden;
            existing.Points         = dto.Points > 0 ? dto.Points : 10;

            await Task.Run(() => _problemRepo.UpdateTestCase(existing));
            return Ok(new { message = $"Test case {id} updated successfully." });
        }

        [HttpDelete("testcases/{id}")]
        public async Task<IActionResult> DeleteTestCase(int id)
        {
            var existing = await Task.Run(() => _problemRepo.GetTestCaseById(id));
            if (existing == null) return NotFound("Test case not found.");

            await Task.Run(() => _problemRepo.DeleteTestCase(id));
            return Ok(new { message = $"Test case {id} deleted successfully." });
        }

        [HttpDelete("problems/{problemId}/testcases")]
        public async Task<IActionResult> DeleteAllTestCases(int problemId)
        {
            var problem = await _problemService.GetProblemByIdAsync(problemId);
            if (problem == null) return NotFound(ErrorMessages.ProblemNotFound);

            await Task.Run(() => _problemRepo.DeleteAllTestCases(problemId));
            return Ok(new { message = $"All test cases for problem {problemId} deleted." });
        }

        // =============================================
        // SUBMISSION MANAGEMENT
        // =============================================
        [HttpGet("submissions")]
        public async Task<IActionResult> GetAllSubmissions()
        {
            var submissions = await Task.Run(() => _submissionRepo.GetAllSubmissions());
            return Ok(submissions);
        }

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

    // ── Request DTOs ─────────────────────────────────────────────
    public class UpdateRoleRequest  { public string Role      { get; set; } = string.Empty; }
    public class TogglePremiumRequest { public bool IsPremium { get; set; } }
}

// using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.Authorization;
// using AlgoMateBackend.Models;
// using AlgoMateBackend.Repositories;
// using AlgoMateBackend.Services;
// using AlgoMateBackend.Enums;
// using AlgoMateBackend.Constants;
// using AlgoMateBackend.Validators;
// using AlgoMateBackend.DTOs;
//
// namespace AlgoMateBackend.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     [Authorize(Roles = Roles.Admin)]
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
//             var totalUsers          = await Task.Run(() => _userRepo.GetTotalUsers());
//             var totalProblems       = await Task.Run(() => _problemRepo.GetTotalProblems());
//             var totalSubmissions    = await Task.Run(() => _submissionRepo.GetTotalSubmissions());
//             var acceptedSubmissions = await Task.Run(() => _submissionRepo.GetAcceptedSubmissions());
//             var problemStats        = await _problemService.GetProblemStatsAsync();
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
//         public async Task<IActionResult> UpdateUserRole(
//             int id, [FromBody] UpdateRoleRequest request)
//         {
//             if (!Roles.IsValid(request.Role))
//                 return BadRequest($"Role must be one of: {string.Join(", ", Roles.AllRoles)}");
//
//             var user = await Task.Run(() => _userRepo.GetUserById(id));
//             if (user == null)
//                 return NotFound(ErrorMessages.UserNotFound);
//
//             user.Role = request.Role;
//             await Task.Run(() => _userRepo.UpdateUser(user));
//             return Ok(new { message = $"User {id} role updated to {request.Role}." });
//         }
//
//         // PUT /api/admin/users/{id}/premium
//         [HttpPut("users/{id}/premium")]
//         public async Task<IActionResult> TogglePremium(
//             int id, [FromBody] TogglePremiumRequest request)
//         {
//             var user = await Task.Run(() => _userRepo.GetUserById(id));
//             if (user == null)
//                 return NotFound(ErrorMessages.UserNotFound);
//
//             user.IsPremium = request.IsPremium;
//             await Task.Run(() => _userRepo.UpdateUser(user));
//             return Ok(new { message = $"User {id} premium status set to {request.IsPremium}." });
//         }
//
//         // DELETE /api/admin/users/{id}
//         [HttpDelete("users/{id}")]
//         public async Task<IActionResult> DeleteUser(int id)
//         {
//             var user = await Task.Run(() => _userRepo.GetUserById(id));
//             if (user == null)
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
//         public async Task<IActionResult> AddProblem([FromBody] CreateProblemDTO dto)
//         {
//             if (!ModelState.IsValid)
//                 return BadRequest(ModelState);
//
//             if (!DifficultyExtensions.IsValid(dto.Difficulty))
//                 return BadRequest(ValidationMessages.InvalidDifficulty);
//
//             var problem = new Problem
//             {
//                 Title           = dto.Title,
//                 Description     = dto.Description,
//                 Difficulty      = dto.Difficulty,
//                 Topic           = dto.Topic,
//                 InputFormat     = dto.InputFormat,
//                 OutputFormat    = dto.OutputFormat,
//                 SampleInput     = dto.SampleInput,
//                 SampleOutput    = dto.SampleOutput,
//                 Constraints     = dto.Constraints,
//                 TimeLimitMs     = dto.TimeLimitMs,
//                 MemoryLimitMb   = dto.MemoryLimitMb,
//                 MaxScore        = dto.MaxScore,
//                 ContributorName = dto.ContributorName,
//                 IsActive        = true,
//                 CreatedAt       = DateTime.UtcNow,
//             };
//
//             var added = await _problemService.AddProblemAsync(problem);
//
//             // ── Test cases add karo ──────────────────────────────
//             if (dto.TestCases.Any())
//             {
//                 foreach (var tc in dto.TestCases)
//                 {
//                     var testCase = new TestCase
//                     {
//                         ProblemId      = added.Id,
//                         Input          = tc.Input,
//                         ExpectedOutput = tc.ExpectedOutput,
//                         IsHidden       = tc.IsHidden,
//                         Points         = tc.Points > 0 ? tc.Points : 10,
//                     };
//                     await Task.Run(() => _problemRepo.AddTestCase(testCase));
//                 }
//             }
//
//             return CreatedAtAction(nameof(GetProblemById), new { id = added.Id }, new
//             {
//                 problem  = added,
//                 testCases = dto.TestCases.Count,
//                 message  = $"Problem '{added.Title}' added with {dto.TestCases.Count} test cases."
//             });
//         }
//
//         // GET /api/admin/problems/{id}
//         [HttpGet("problems/{id}")]
//         public async Task<IActionResult> GetProblemById(int id)
//         {
//             var problem = await _problemService.GetProblemByIdAsync(id);
//             if (problem == null)
//                 return NotFound(ErrorMessages.ProblemNotFound);
//
//             var testCases = await Task.Run(() => _problemRepo.GetTestCases(id));
//             return Ok(new
//             {
//                 problem,
//                 testCases = testCases.Select(tc => new TestCaseResponseDTO
//                 {
//                     Id             = tc.Id,
//                     ProblemId      = tc.ProblemId,
//                     Input          = tc.Input,
//                     ExpectedOutput = tc.ExpectedOutput,
//                     IsHidden       = tc.IsHidden,
//                     Points         = tc.Points,
//                 })
//             });
//         }
//
//         // PUT /api/admin/problems/{id}
//         [HttpPut("problems/{id}")]
//         public async Task<IActionResult> UpdateProblem(
//             int id, [FromBody] CreateProblemDTO dto)
//         {
//             var existing = await _problemService.GetProblemByIdAsync(id);
//             if (existing == null)
//                 return NotFound(ErrorMessages.ProblemNotFound);
//
//             if (!DifficultyExtensions.IsValid(dto.Difficulty))
//                 return BadRequest(ValidationMessages.InvalidDifficulty);
//
//             existing.Title           = dto.Title;
//             existing.Description     = dto.Description;
//             existing.Difficulty      = dto.Difficulty;
//             existing.Topic           = dto.Topic;
//             existing.InputFormat     = dto.InputFormat;
//             existing.OutputFormat    = dto.OutputFormat;
//             existing.SampleInput     = dto.SampleInput;
//             existing.SampleOutput    = dto.SampleOutput;
//             existing.Constraints     = dto.Constraints;
//             existing.TimeLimitMs     = dto.TimeLimitMs;
//             existing.MemoryLimitMb   = dto.MemoryLimitMb;
//             existing.MaxScore        = dto.MaxScore;
//             existing.ContributorName = dto.ContributorName;
//
//             await _problemService.UpdateProblemAsync(existing);
//
//             // ── Test cases update karo ───────────────────────────
//             if (dto.TestCases.Any())
//             {
//                 // Purane sab delete karo
//                 await Task.Run(() => _problemRepo.DeleteAllTestCases(id));
//
//                 // Naye add karo
//                 foreach (var tc in dto.TestCases)
//                 {
//                     var testCase = new TestCase
//                     {
//                         ProblemId      = id,
//                         Input          = tc.Input,
//                         ExpectedOutput = tc.ExpectedOutput,
//                         IsHidden       = tc.IsHidden,
//                         Points         = tc.Points > 0 ? tc.Points : 10,
//                     };
//                     await Task.Run(() => _problemRepo.AddTestCase(testCase));
//                 }
//             }
//
//             return Ok(new { message = $"Problem {id} updated with {dto.TestCases.Count} test cases." });
//         }
//
//         // DELETE /api/admin/problems/{id}
//         [HttpDelete("problems/{id}")]
//         public async Task<IActionResult> DeleteProblem(int id)
//         {
//             var existing = await _problemService.GetProblemByIdAsync(id);
//             if (existing == null)
//                 return NotFound(ErrorMessages.ProblemNotFound);
//
//             await Task.Run(() => _problemRepo.DeleteAllTestCases(id));
//             await _problemService.DeleteProblemAsync(id);
//             return Ok(new { message = $"Problem {id} and its test cases deleted successfully." });
//         }
//
//         // =============================================
//         // TEST CASE MANAGEMENT
//         // =============================================
//
//         // GET /api/admin/problems/{problemId}/testcases
//         [HttpGet("problems/{problemId}/testcases")]
//         public async Task<IActionResult> GetTestCases(int problemId)
//         {
//             var problem = await _problemService.GetProblemByIdAsync(problemId);
//             if (problem == null)
//                 return NotFound(ErrorMessages.ProblemNotFound);
//
//             var testCases = await Task.Run(() => _problemRepo.GetTestCases(problemId));
//             return Ok(testCases.Select(tc => new TestCaseResponseDTO
//             {
//                 Id             = tc.Id,
//                 ProblemId      = tc.ProblemId,
//                 Input          = tc.Input,
//                 ExpectedOutput = tc.ExpectedOutput,
//                 IsHidden       = tc.IsHidden,
//                 Points         = tc.Points,
//             }));
//         }
//
//         // POST /api/admin/problems/{problemId}/testcases
//         [HttpPost("problems/{problemId}/testcases")]
//         public async Task<IActionResult> AddTestCase(
//             int problemId, [FromBody] TestCaseDTO dto)
//         {
//             var problem = await _problemService.GetProblemByIdAsync(problemId);
//             if (problem == null)
//                 return NotFound(ErrorMessages.ProblemNotFound);
//
//             if (string.IsNullOrWhiteSpace(dto.Input) ||
//                 string.IsNullOrWhiteSpace(dto.ExpectedOutput))
//                 return BadRequest("Input and ExpectedOutput are required.");
//
//             var testCase = new TestCase
//             {
//                 ProblemId      = problemId,
//                 Input          = dto.Input,
//                 ExpectedOutput = dto.ExpectedOutput,
//                 IsHidden       = dto.IsHidden,
//                 Points         = dto.Points > 0 ? dto.Points : 10,
//             };
//
//             await Task.Run(() => _problemRepo.AddTestCase(testCase));
//             return Ok(new
//             {
//                 message  = "Test case added successfully.",
//                 testCase = new TestCaseResponseDTO
//                 {
//                     Id             = testCase.Id,
//                     ProblemId      = testCase.ProblemId,
//                     Input          = testCase.Input,
//                     ExpectedOutput = testCase.ExpectedOutput,
//                     IsHidden       = testCase.IsHidden,
//                     Points         = testCase.Points,
//                 }
//             });
//         }
//
//         // PUT /api/admin/testcases/{id}
//         [HttpPut("testcases/{id}")]
//         public async Task<IActionResult> UpdateTestCase(
//             int id, [FromBody] TestCaseDTO dto)
//         {
//             var existing = await Task.Run(() => _problemRepo.GetTestCaseById(id));
//             if (existing == null)
//                 return NotFound("Test case not found.");
//
//             existing.Input          = dto.Input;
//             existing.ExpectedOutput = dto.ExpectedOutput;
//             existing.IsHidden       = dto.IsHidden;
//             existing.Points         = dto.Points > 0 ? dto.Points : 10;
//
//             await Task.Run(() => _problemRepo.UpdateTestCase(existing));
//             return Ok(new { message = $"Test case {id} updated successfully." });
//         }
//
//         // DELETE /api/admin/testcases/{id}
//         [HttpDelete("testcases/{id}")]
//         public async Task<IActionResult> DeleteTestCase(int id)
//         {
//             var existing = await Task.Run(() => _problemRepo.GetTestCaseById(id));
//             if (existing == null)
//                 return NotFound("Test case not found.");
//
//             await Task.Run(() => _problemRepo.DeleteTestCase(id));
//             return Ok(new { message = $"Test case {id} deleted successfully." });
//         }
//
//         // DELETE /api/admin/problems/{problemId}/testcases
//         [HttpDelete("problems/{problemId}/testcases")]
//         public async Task<IActionResult> DeleteAllTestCases(int problemId)
//         {
//             var problem = await _problemService.GetProblemByIdAsync(problemId);
//             if (problem == null)
//                 return NotFound(ErrorMessages.ProblemNotFound);
//
//             await Task.Run(() => _problemRepo.DeleteAllTestCases(problemId));
//             return Ok(new { message = $"All test cases for problem {problemId} deleted." });
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
//             [FromQuery] int count = AppConstants.DefaultPageSize)
//         {
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
//         public async Task<IActionResult> RecalculateLeaderboard(
//             [FromQuery] string period = "AllTime")
//         {
//             if (!LeaderboardPeriodExtensions.IsValid(period))
//                 return BadRequest($"{ErrorMessages.InvalidPeriod} Valid values: {string.Join(", ", LeaderboardPeriodExtensions.GetAllPeriods())}");
//
//             var periodEnum = Enum.Parse<LeaderboardPeriod>(period, true);
//             await _leaderboardService.RecalculateAllRanksAsync(periodEnum);
//             return Ok(new { message = $"Leaderboard recalculated for {period}." });
//         }
//     }
//
//     // ── Request DTOs ─────────────────────────────────────────────
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
// // using Microsoft.AspNetCore.Mvc;
// // using Microsoft.AspNetCore.Authorization;
// // using AlgoMateBackend.Models;
// // using AlgoMateBackend.Repositories;
// // using AlgoMateBackend.Services;
// // using AlgoMateBackend.Enums;
// // using AlgoMateBackend.Constants;
// // using AlgoMateBackend.Validators; // ← ADDED
// //
// // namespace AlgoMateBackend.Controllers
// // {
// //     [ApiController]
// //     [Route("api/[controller]")]
// //     [Authorize(Roles = Roles.Admin)]
// //     public class AdminController : ControllerBase
// //     {
// //         private readonly IUserRepository _userRepo;
// //         private readonly IProblemRepository _problemRepo;
// //         private readonly ISubmissionRepository _submissionRepo;
// //         private readonly ILeaderboardRepository _leaderboardRepo;
// //         private readonly ILeaderboardService _leaderboardService;
// //         private readonly IProblemService _problemService;
// //
// //         public AdminController(
// //             IUserRepository userRepo,
// //             IProblemRepository problemRepo,
// //             ISubmissionRepository submissionRepo,
// //             ILeaderboardRepository leaderboardRepo,
// //             ILeaderboardService leaderboardService,
// //             IProblemService problemService)
// //         {
// //             _userRepo = userRepo;
// //             _problemRepo = problemRepo;
// //             _submissionRepo = submissionRepo;
// //             _leaderboardRepo = leaderboardRepo;
// //             _leaderboardService = leaderboardService;
// //             _problemService = problemService;
// //         }
// //
// //         // =============================================
// //         // DASHBOARD STATS
// //         // =============================================
// //
// //         // GET /api/admin/stats
// //         [HttpGet("stats")]
// //         public async Task<IActionResult> GetDashboardStats()
// //         {
// //             var totalUsers = await Task.Run(() => _userRepo.GetTotalUsers());
// //             var totalProblems = await Task.Run(() => _problemRepo.GetTotalProblems());
// //             var totalSubmissions = await Task.Run(() => _submissionRepo.GetTotalSubmissions());
// //             var acceptedSubmissions = await Task.Run(() => _submissionRepo.GetAcceptedSubmissions());
// //             var problemStats = await _problemService.GetProblemStatsAsync();
// //
// //             return Ok(new
// //             {
// //                 totalUsers,
// //                 totalProblems,
// //                 totalSubmissions,
// //                 acceptedSubmissions,
// //                 acceptanceRate = totalSubmissions > 0
// //                     ? Math.Round((double)acceptedSubmissions / totalSubmissions * 100, 2)
// //                     : 0,
// //                 problemStats
// //             });
// //         }
// //
// //         // =============================================
// //         // USER MANAGEMENT
// //         // =============================================
// //
// //         // GET /api/admin/users
// //         [HttpGet("users")]
// //         public async Task<IActionResult> GetAllUsers()
// //         {
// //             var users = await Task.Run(() => _userRepo.GetAllUsers());
// //             return Ok(users);
// //         }
// //
// //         // PUT /api/admin/users/{id}/role
// //         [HttpPut("users/{id}/role")]
// //         public async Task<IActionResult> UpdateUserRole(
// //             int id, [FromBody] UpdateRoleRequest request)
// //         {
// //             if (!Roles.IsValid(request.Role))
// //                 return BadRequest($"Role must be one of: {string.Join(", ", Roles.AllRoles)}");
// //
// //             var user = await Task.Run(() => _userRepo.GetUserById(id));
// //             if (user == null)
// //                 return NotFound(ErrorMessages.UserNotFound);
// //
// //             user.Role = request.Role;
// //             await Task.Run(() => _userRepo.UpdateUser(user));
// //
// //             return Ok(new { message = $"User {id} role updated to {request.Role}." });
// //         }
// //
// //         // PUT /api/admin/users/{id}/premium
// //         [HttpPut("users/{id}/premium")]
// //         public async Task<IActionResult> TogglePremium(
// //             int id, [FromBody] TogglePremiumRequest request)
// //         {
// //             var user = await Task.Run(() => _userRepo.GetUserById(id));
// //             if (user == null)
// //                 return NotFound(ErrorMessages.UserNotFound);
// //
// //             user.IsPremium = request.IsPremium;
// //             await Task.Run(() => _userRepo.UpdateUser(user));
// //
// //             return Ok(new
// //             {
// //                 message = $"User {id} premium status set to {request.IsPremium}."
// //             });
// //         }
// //
// //         // DELETE /api/admin/users/{id}
// //         [HttpDelete("users/{id}")]
// //         public async Task<IActionResult> DeleteUser(int id)
// //         {
// //             var user = await Task.Run(() => _userRepo.GetUserById(id));
// //             if (user == null)
// //                 return NotFound(ErrorMessages.UserNotFound);
// //
// //             await Task.Run(() => _userRepo.DeleteUser(id));
// //             return Ok(new { message = $"User {id} deleted successfully." });
// //         }
// //
// //         // =============================================
// //         // PROBLEM MANAGEMENT
// //         // =============================================
// //
// //         // POST /api/admin/problems
// //         [HttpPost("problems")]
// //         public async Task<IActionResult> AddProblem([FromBody] Problem problem)
// //         {
// //             if (!ModelState.IsValid)
// //                 return BadRequest(ModelState);
// //
// //             // ← EDITED — DifficultyExtensions validate karo
// //             if (!DifficultyExtensions.IsValid(problem.Difficulty))
// //                 return BadRequest(ValidationMessages.InvalidDifficulty);
// //
// //             var added = await _problemService.AddProblemAsync(problem);
// //             return CreatedAtAction(nameof(GetProblemById),
// //                 new { id = added.Id }, added);
// //         }
// //
// //         // GET /api/admin/problems/{id}
// //         [HttpGet("problems/{id}")]
// //         public async Task<IActionResult> GetProblemById(int id)
// //         {
// //             var problem = await _problemService.GetProblemByIdAsync(id);
// //             if (problem == null)
// //                 return NotFound(ErrorMessages.ProblemNotFound);
// //
// //             return Ok(problem);
// //         }
// //
// //         // PUT /api/admin/problems/{id}
// //         [HttpPut("problems/{id}")]
// //         public async Task<IActionResult> UpdateProblem(
// //             int id, [FromBody] Problem problem)
// //         {
// //             if (id != problem.Id)
// //                 return BadRequest(ErrorMessages.BadRequest);
// //
// //             var existing = await _problemService.GetProblemByIdAsync(id);
// //             if (existing == null)
// //                 return NotFound(ErrorMessages.ProblemNotFound);
// //
// //             if (!DifficultyExtensions.IsValid(problem.Difficulty))
// //                 return BadRequest(ValidationMessages.InvalidDifficulty);
// //
// //             await _problemService.UpdateProblemAsync(problem);
// //             return NoContent();
// //         }
// //
// //         // DELETE /api/admin/problems/{id}
// //         [HttpDelete("problems/{id}")]
// //         public async Task<IActionResult> DeleteProblem(int id)
// //         {
// //             var existing = await _problemService.GetProblemByIdAsync(id);
// //             if (existing == null)
// //                 return NotFound(ErrorMessages.ProblemNotFound);
// //
// //             await _problemService.DeleteProblemAsync(id);
// //             return Ok(new { message = $"Problem {id} deleted successfully." });
// //         }
// //
// //         // =============================================
// //         // SUBMISSION MANAGEMENT
// //         // =============================================
// //
// //         // GET /api/admin/submissions
// //         [HttpGet("submissions")]
// //         public async Task<IActionResult> GetAllSubmissions()
// //         {
// //             var submissions = await Task.Run(() => _submissionRepo.GetAllSubmissions());
// //             return Ok(submissions);
// //         }
// //
// //         // GET /api/admin/submissions/recent
// //         [HttpGet("submissions/recent")]
// //         public async Task<IActionResult> GetRecentSubmissions(
// //             [FromQuery] int count = AppConstants.DefaultPageSize)
// //         {
// //             if (count <= 0 || count > AppConstants.MaxPageSize)
// //                 return BadRequest($"Count must be between 1 and {AppConstants.MaxPageSize}.");
// //
// //             var submissions = await Task.Run(() => _submissionRepo.GetRecentSubmissions(count));
// //             return Ok(submissions);
// //         }
// //
// //         // =============================================
// //         // LEADERBOARD MANAGEMENT
// //         // =============================================
// //
// //         // POST /api/admin/leaderboard/recalculate
// //         [HttpPost("leaderboard/recalculate")]
// //         public async Task<IActionResult> RecalculateLeaderboard(
// //             [FromQuery] string period = "AllTime")
// //         {
// //             if (!LeaderboardPeriodExtensions.IsValid(period))
// //                 return BadRequest($"{ErrorMessages.InvalidPeriod} Valid values: {string.Join(", ", LeaderboardPeriodExtensions.GetAllPeriods())}");
// //
// //             var periodEnum = Enum.Parse<LeaderboardPeriod>(period, true);
// //             await _leaderboardService.RecalculateAllRanksAsync(periodEnum);
// //             return Ok(new { message = $"Leaderboard recalculated for {period}." });
// //         }
// //     }
// //
// //     // Request DTOs
// //     public class UpdateRoleRequest
// //     {
// //         public string Role { get; set; } = string.Empty;
// //     }
// //
// //     public class TogglePremiumRequest
// //     {
// //         public bool IsPremium { get; set; }
// //     }
// // }
//
//
