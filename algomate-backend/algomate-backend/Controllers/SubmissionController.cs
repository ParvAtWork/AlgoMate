using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.DTOs;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Extensions; // ← ADDED

namespace AlgoMateBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SubmissionController : ControllerBase
    {
        private readonly ISubmissionRepository _repo;
        private readonly IUserRepository _userRepo;

        public SubmissionController(
            ISubmissionRepository repo,
            IUserRepository userRepo)
        {
            _repo = repo;
            _userRepo = userRepo;
        }

        // GET /api/submission/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMySubmissions()
        {
            // ← EDITED — Extension method use kiya
            var supabaseUid = User.GetSupabaseUid();

            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            var user = await Task.Run(() => _userRepo.GetBySupabaseUid(supabaseUid));
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);

            var submissions = await Task.Run(() => _repo.GetByUserId(user.Id));
            var dto = submissions.Select(s => new SubmissionDto
            {
                Id = s.Id,
                UserId = s.UserId,
                ProblemId = s.ProblemId,
                Language = s.Language,
                Status = s.Status,
                Output = s.Output,
                ErrorMessage = s.ErrorMessage,
                ExecutionTimeMs = s.ExecutionTimeMs,
                MemoryUsedMb = s.MemoryUsedMb,
                Score = s.Score,
                TestCasesPassed = s.TestCasesPassed,
                TotalTestCases = s.TotalTestCases,
                IsSuccessful = s.IsSuccessful,
                SubmittedAt = s.SubmittedAt
            });
            return Ok(dto);
        }

        // GET /api/submission/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSubmissionById(int id)
        {
            if (id <= 0)
                return BadRequest(string.Format(ValidationMessages.InvalidId, "submission"));

            var submission = await Task.Run(() => _repo.GetSubmissionById(id));
            if (submission == null)
                return NotFound(ErrorMessages.SubmissionNotFound);

            // ← EDITED — Extension method use kiya
            var supabaseUid = User.GetSupabaseUid();
            var user = await Task.Run(() => _userRepo.GetBySupabaseUid(supabaseUid!));

            // ← EDITED — IsAdmin() Extension method use kiya
            if (user == null || (submission.UserId != user.Id && !User.IsAdmin()))
                return Forbid();

            var dto = new SubmissionDto
            {
                Id = submission.Id,
                UserId = submission.UserId,
                ProblemId = submission.ProblemId,
                Language = submission.Language,
                Status = submission.Status,
                Output = submission.Output,
                ErrorMessage = submission.ErrorMessage,
                ExecutionTimeMs = submission.ExecutionTimeMs,
                MemoryUsedMb = submission.MemoryUsedMb,
                Score = submission.Score,
                TestCasesPassed = submission.TestCasesPassed,
                TotalTestCases = submission.TotalTestCases,
                IsSuccessful = submission.IsSuccessful,
                SubmittedAt = submission.SubmittedAt
            };
            return Ok(dto);
        }

        // GET /api/submission/problem/{problemId} — Admin only
        [HttpGet("problem/{problemId}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetByProblem(int problemId)
        {
            var submissions = await Task.Run(() => _repo.GetByProblemId(problemId));
            var dto = submissions.Select(s => new SubmissionDto
            {
                Id = s.Id,
                UserId = s.UserId,
                ProblemId = s.ProblemId,
                Language = s.Language,
                Status = s.Status,
                ExecutionTimeMs = s.ExecutionTimeMs,
                MemoryUsedMb = s.MemoryUsedMb,
                Score = s.Score,
                TestCasesPassed = s.TestCasesPassed,
                TotalTestCases = s.TotalTestCases,
                IsSuccessful = s.IsSuccessful,
                SubmittedAt = s.SubmittedAt
            });
            return Ok(dto);
        }

        // GET /api/submission/check/{problemId}
        [HttpGet("check/{problemId}")]
        public async Task<IActionResult> HasSolvedProblem(int problemId)
        {
            // ← EDITED — Extension method use kiya
            var supabaseUid = User.GetSupabaseUid();

            var user = await Task.Run(() => _userRepo.GetBySupabaseUid(supabaseUid!));
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);

            var solved = await Task.Run(() =>
                _repo.HasUserSolvedProblem(user.Id, problemId));

            return Ok(new { problemId, solved });
        }

        // GET /api/submission/recent — Admin only
        [HttpGet("recent")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetRecentSubmissions(
            [FromQuery] int count = AppConstants.DefaultPageSize)
        {
            if (count <= 0 || count > AppConstants.MaxPageSize)
                return BadRequest($"Count must be between 1 and {AppConstants.MaxPageSize}.");

            var submissions = await Task.Run(() => _repo.GetRecentSubmissions(count));
            var dto = submissions.Select(s => new SubmissionDto
            {
                Id = s.Id,
                UserId = s.UserId,
                ProblemId = s.ProblemId,
                Language = s.Language,
                Status = s.Status,
                ExecutionTimeMs = s.ExecutionTimeMs,
                MemoryUsedMb = s.MemoryUsedMb,
                Score = s.Score,
                TestCasesPassed = s.TestCasesPassed,
                TotalTestCases = s.TotalTestCases,
                IsSuccessful = s.IsSuccessful,
                SubmittedAt = s.SubmittedAt
            });
            return Ok(dto);
        }

        // POST /api/submission
        [HttpPost]
        public IActionResult AddSubmission()
        {
            return BadRequest(ErrorMessages.BadRequest);
        }
    }
}



