using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.DTOs;
using AlgoMateBackend.Enums;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Extensions; // ← ADDED

namespace AlgoMateBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaderboardController : ControllerBase
    {
        private readonly ILeaderboardRepository _repo;
        private readonly IUserRepository _userRepo;

        public LeaderboardController(
            ILeaderboardRepository repo,
            IUserRepository userRepo)
        {
            _repo = repo;
            _userRepo = userRepo;
        }

        // GET /api/leaderboard
        [HttpGet]
        public async Task<IActionResult> GetTopRankers(
            [FromQuery] int count = AppConstants.DefaultLeaderboardCount)
        {
            if (count <= 0 || count > AppConstants.MaxLeaderboardCount)
                return BadRequest($"Count must be between 1 and {AppConstants.MaxLeaderboardCount}.");

            var rankers = await Task.Run(() => _repo.GetTopRankers(count));

            var dto = new LeaderboardResponseDto()
            {
                Period = LeaderboardPeriod.AllTime.ToDisplayString(),
                TotalEntries = rankers.Count(),
                Rankings = rankers.Select(l => new LeaderboardDto
                {
                    Rank = l.Rank,
                    UserId = l.UserId,
                    Score = l.Score,
                    ProblemsSolved = l.ProblemsSolved,
                    TotalSubmissions = l.TotalSubmissions,
                    AccuracyPercent = l.AccuracyPercent,
                    BadgeTitle = l.BadgeTitle,
                    Period = l.Period,
                    LastUpdated = l.LastUpdated
                })
            };
            return Ok(dto);
        }

        // GET /api/leaderboard/period/{period}
        [HttpGet("period/{period}")]
        public async Task<IActionResult> GetByPeriod(string period)
        {
            if (!LeaderboardPeriodExtensions.IsValid(period))
                return BadRequest($"{ErrorMessages.InvalidPeriod} Valid values: {string.Join(", ", LeaderboardPeriodExtensions.GetAllPeriods())}");

            var periodEnum = Enum.Parse<LeaderboardPeriod>(period, true);
            var leaderboard = await Task.Run(() => _repo.GetByPeriod(periodEnum));

            var dto = new LeaderboardResponseDto()
            {
                Period = period,
                TotalEntries = leaderboard.Count(),
                Rankings = leaderboard.Select(l => new LeaderboardDto
                {
                    Rank = l.Rank,
                    UserId = l.UserId,
                    Score = l.Score,
                    ProblemsSolved = l.ProblemsSolved,
                    TotalSubmissions = l.TotalSubmissions,
                    AccuracyPercent = l.AccuracyPercent,
                    BadgeTitle = l.BadgeTitle,
                    Period = l.Period,
                    LastUpdated = l.LastUpdated
                })
            };
            return Ok(dto);
        }

        // GET /api/leaderboard/me
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMyRank()
        {
            // ← EDITED — Extension method use kiya
            var supabaseUid = User.GetSupabaseUid();

            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            var user = await Task.Run(() => _userRepo.GetBySupabaseUid(supabaseUid));
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);

            var entry = await Task.Run(() => _repo.GetByUserId(user.Id));
            if (entry == null)
                return NotFound(ErrorMessages.LeaderboardEntryNotFound);

            var dto = new LeaderboardDto
            {
                Rank = entry.Rank,
                UserId = entry.UserId,
                Score = entry.Score,
                ProblemsSolved = entry.ProblemsSolved,
                TotalSubmissions = entry.TotalSubmissions,
                AccuracyPercent = entry.AccuracyPercent,
                BadgeTitle = entry.BadgeTitle,
                Period = entry.Period,
                LastUpdated = entry.LastUpdated
            };
            return Ok(dto);
        }

        // GET /api/leaderboard/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserRank(int userId)
        {
            if (userId <= 0)
                return BadRequest(ValidationMessages.InvalidUserId);

            var entry = await Task.Run(() => _repo.GetByUserId(userId));
            if (entry == null)
                return NotFound(ErrorMessages.LeaderboardEntryNotFound);

            var dto = new LeaderboardDto
            {
                Rank = entry.Rank,
                UserId = entry.UserId,
                Score = entry.Score,
                ProblemsSolved = entry.ProblemsSolved,
                TotalSubmissions = entry.TotalSubmissions,
                AccuracyPercent = entry.AccuracyPercent,
                BadgeTitle = entry.BadgeTitle,
                Period = entry.Period,
                LastUpdated = entry.LastUpdated
            };
            return Ok(dto);
        }

        // POST /api/leaderboard/recalculate — Admin only
        [HttpPost("recalculate")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> RecalculateRanks([FromQuery] string period = "AllTime")
        {
            if (!LeaderboardPeriodExtensions.IsValid(period))
                return BadRequest($"{ErrorMessages.InvalidPeriod} Valid values: {string.Join(", ", LeaderboardPeriodExtensions.GetAllPeriods())}");

            var periodEnum = Enum.Parse<LeaderboardPeriod>(period, true);
            await Task.Run(() => _repo.RecalculateRanks(periodEnum));
            return Ok(new { message = $"Ranks recalculated for {period} period." });
        }
    }
}




