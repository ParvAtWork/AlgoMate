using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.DTOs;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Extensions;

namespace AlgoMateBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SubmissionController : ControllerBase
    {
        private readonly ISubmissionRepository _repo;
        private readonly IUserRepository _userRepo;
        private readonly IProblemRepository _problemRepo;

        public SubmissionController(
            ISubmissionRepository repo,
            IUserRepository userRepo,
            IProblemRepository problemRepo)
        {
            _repo        = repo;
            _userRepo    = userRepo;
            _problemRepo = problemRepo;
        }

        // GET /api/submission/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMySubmissions()
        {
            var supabaseUid = User.GetSupabaseUid();
            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            var user = await Task.Run(() => _userRepo.GetBySupabaseUid(supabaseUid));
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);

            var submissions = await Task.Run(() => _repo.GetByUserId(user.Id));
            var dto = submissions.Select(s => new SubmissionDto
            {
                Id              = s.Id,
                UserId          = s.UserId,
                ProblemId       = s.ProblemId,
                Language        = s.Language,
                Status          = s.Status,
                Output          = s.Output,
                ErrorMessage    = s.ErrorMessage,
                ExecutionTimeMs = s.ExecutionTimeMs,
                MemoryUsedMb    = s.MemoryUsedMb,
                Score           = s.Score,
                TestCasesPassed = s.TestCasesPassed,
                TotalTestCases  = s.TotalTestCases,
                IsSuccessful    = s.IsSuccessful,
                SubmittedAt     = s.SubmittedAt
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

            var supabaseUid = User.GetSupabaseUid();
            var user = await Task.Run(() => _userRepo.GetBySupabaseUid(supabaseUid!));

            if (user == null || (submission.UserId != user.Id && !User.IsAdmin()))
                return Forbid();

            var dto = new SubmissionDto
            {
                Id              = submission.Id,
                UserId          = submission.UserId,
                ProblemId       = submission.ProblemId,
                Language        = submission.Language,
                Status          = submission.Status,
                Output          = submission.Output,
                ErrorMessage    = submission.ErrorMessage,
                ExecutionTimeMs = submission.ExecutionTimeMs,
                MemoryUsedMb    = submission.MemoryUsedMb,
                Score           = submission.Score,
                TestCasesPassed = submission.TestCasesPassed,
                TotalTestCases  = submission.TotalTestCases,
                IsSuccessful    = submission.IsSuccessful,
                SubmittedAt     = submission.SubmittedAt
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
                Id              = s.Id,
                UserId          = s.UserId,
                ProblemId       = s.ProblemId,
                Language        = s.Language,
                Status          = s.Status,
                ExecutionTimeMs = s.ExecutionTimeMs,
                MemoryUsedMb    = s.MemoryUsedMb,
                Score           = s.Score,
                TestCasesPassed = s.TestCasesPassed,
                TotalTestCases  = s.TotalTestCases,
                IsSuccessful    = s.IsSuccessful,
                SubmittedAt     = s.SubmittedAt
            });
            return Ok(dto);
        }

        // GET /api/submission/check/{problemId}
        [HttpGet("check/{problemId}")]
        public async Task<IActionResult> HasSolvedProblem(int problemId)
        {
            var supabaseUid = User.GetSupabaseUid();
            var user = await Task.Run(() => _userRepo.GetBySupabaseUid(supabaseUid!));
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);

            var solved = await Task.Run(() =>
                _repo.HasUserSolvedProblem(user.Id, problemId));

            return Ok(new { problemId, solved });
        }

        // GET /api/submission/leaderboard — Public
        [HttpGet("leaderboard")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLeaderboard()
        {
            var allSubs     = await Task.Run(() => _repo.GetAllSubmissions());
            var allUsers    = await Task.Run(() => _userRepo.GetAllUsers());
            var allProblems = await Task.Run(() => _problemRepo.GetAllProblems());

            var problemDict = allProblems.ToDictionary(p => p.Id, p => p.Difficulty);

            var result = allSubs
                .GroupBy(s => s.UserId)
                .Select(g =>
                {
                    var user     = allUsers.FirstOrDefault(u => u.Id == g.Key);
                    var username = user?.Username ?? user?.Email?.Split('@')[0] ?? "Unknown";
                    var solvedIds = new HashSet<int>();
                    var accepted  = 0;
                    var points    = 0;
                    var easyS     = 0;
                    var mediumS   = 0;
                    var hardS     = 0;

                    foreach (var sub in g)
                    {
                        if (sub.Status == "Accepted" && !solvedIds.Contains(sub.ProblemId))
                        {
                            solvedIds.Add(sub.ProblemId);
                            accepted++;
                            var diff = problemDict.GetValueOrDefault(sub.ProblemId, "Easy");
                            if (diff == "Hard")        { points += 150; hardS++;   }
                            else if (diff == "Medium") { points += 100; mediumS++; }
                            else                       { points += 50;  easyS++;   }
                        }
                    }

                    var total    = g.Count();
                    var accuracy = total > 0
                        ? (int)Math.Round((double)accepted / total * 100)
                        : 0;

                    return new
                    {
                        userId    = g.Key,
                        username,
                        avatar    = username.Length >= 2
                            ? username[..2].ToUpper()
                            : username.ToUpper(),
                        solved    = solvedIds.Count,
                        points,
                        totalSubs = total,
                        accepted,
                        accuracy,
                        easyS,
                        mediumS,
                        hardS,
                    };
                })
                .OrderByDescending(u => u.points)
                .ThenByDescending(u => u.solved)
                .ToList()
                .Select((u, i) => new
                {
                    rank      = i + 1,
                    u.userId,
                    u.username,
                    u.avatar,
                    u.solved,
                    u.points,
                    u.totalSubs,
                    u.accepted,
                    u.accuracy,
                    u.easyS,
                    u.mediumS,
                    u.hardS,
                })
                .ToList();

            return Ok(result);
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
                Id              = s.Id,
                UserId          = s.UserId,
                ProblemId       = s.ProblemId,
                Language        = s.Language,
                Status          = s.Status,
                ExecutionTimeMs = s.ExecutionTimeMs,
                MemoryUsedMb    = s.MemoryUsedMb,
                Score           = s.Score,
                TestCasesPassed = s.TestCasesPassed,
                TotalTestCases  = s.TotalTestCases,
                IsSuccessful    = s.IsSuccessful,
                SubmittedAt     = s.SubmittedAt
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