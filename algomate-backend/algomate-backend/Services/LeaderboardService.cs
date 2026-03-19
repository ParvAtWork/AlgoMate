using AlgoMateBackend.Models;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.Enums; // ← ADDED

namespace AlgoMateBackend.Services
{
    // =============================================
    // INTERFACE
    // =============================================
    public interface ILeaderboardService
    {
        Task<IEnumerable<Leaderboard>> GetTopRankersAsync(int count);
        // ← EDITED — string period → LeaderboardPeriod enum
        Task<IEnumerable<Leaderboard>> GetByPeriodAsync(LeaderboardPeriod period);
        Task<Leaderboard?> GetUserRankAsync(int userId);
        Task UpdateUserScoreAsync(int userId, int scoreToAdd, int problemsSolvedToAdd);
        // ← EDITED — string period → LeaderboardPeriod enum
        Task RecalculateAllRanksAsync(LeaderboardPeriod period);
    }

    // =============================================
    // LEADERBOARD SERVICE IMPLEMENTATION
    // =============================================
    public class LeaderboardService : ILeaderboardService
    {
        private readonly ILeaderboardRepository _repo;
        private readonly IUserRepository _userRepo;

        public LeaderboardService(
            ILeaderboardRepository repo,
            IUserRepository userRepo)
        {
            _repo = repo;
            _userRepo = userRepo;
        }

        public async Task<IEnumerable<Leaderboard>> GetTopRankersAsync(int count) =>
            await Task.Run(() => _repo.GetTopRankers(count));

        // ← EDITED — LeaderboardPeriod enum use kiya
        public async Task<IEnumerable<Leaderboard>> GetByPeriodAsync(LeaderboardPeriod period) =>
            await Task.Run(() => _repo.GetByPeriod(period));

        public async Task<Leaderboard?> GetUserRankAsync(int userId) =>
            await Task.Run(() => _repo.GetByUserId(userId));

        // =============================================
        // Submission accept hone ke baad score update
        // =============================================
        public async Task UpdateUserScoreAsync(
            int userId,
            int scoreToAdd,
            int problemsSolvedToAdd)
        {
            var entry = await Task.Run(() => _repo.GetByUserId(userId));

            if (entry == null)
            {
                // Pehli baar — naya entry banao
                entry = new Leaderboard
                {
                    UserId = userId,
                    Score = scoreToAdd,
                    ProblemsSolved = problemsSolvedToAdd,
                    TotalSubmissions = 1,
                    // ← EDITED — Enum se period string lo
                    Period = LeaderboardPeriod.AllTime.ToDisplayString(),
                    LastUpdated = DateTime.UtcNow
                };
                await Task.Run(() => _repo.AddLeaderboard(entry));
            }
            else
            {
                // Existing entry update karo
                entry.Score += scoreToAdd;
                entry.ProblemsSolved += problemsSolvedToAdd;
                entry.TotalSubmissions++;
                entry.AccuracyPercent = entry.TotalSubmissions > 0
                    ? Math.Round((double)entry.ProblemsSolved / entry.TotalSubmissions * 100, 2)
                    : 0;
                entry.LastUpdated = DateTime.UtcNow;
                await Task.Run(() => _repo.UpdateLeaderboard(entry));
            }

            // User model bhi update karo
            var user = await Task.Run(() => _userRepo.GetUserById(userId));
            if (user != null)
            {
                user.ProblemsSolved += problemsSolvedToAdd;
                user.TotalSubmissions++;
                user.Rating += scoreToAdd;
                await Task.Run(() => _userRepo.UpdateUser(user));
            }

            // ← EDITED — Enum use kiya
            await RecalculateAllRanksAsync(LeaderboardPeriod.AllTime);
        }

        // ← EDITED — LeaderboardPeriod enum use kiya
        public async Task RecalculateAllRanksAsync(LeaderboardPeriod period) =>
            await Task.Run(() => _repo.RecalculateRanks(period));
    }
}




// using AlgoMateBackend.Models;
// using AlgoMateBackend.Repositories;
//
// namespace AlgoMateBackend.Services
// {
//     // =============================================
//     // INTERFACE
//     // =============================================
//     public interface ILeaderboardService
//     {
//         Task<IEnumerable<Leaderboard>> GetTopRankersAsync(int count);
//         Task<IEnumerable<Leaderboard>> GetByPeriodAsync(string period);
//         Task<Leaderboard?> GetUserRankAsync(int userId);
//         Task UpdateUserScoreAsync(int userId, int scoreToAdd, int problemsSolvedToAdd);
//         Task RecalculateAllRanksAsync(string period);
//     }
//
//     // =============================================
//     // LEADERBOARD SERVICE IMPLEMENTATION
//     // =============================================
//     public class LeaderboardService : ILeaderboardService
//     {
//         private readonly ILeaderboardRepository _repo;
//         private readonly IUserRepository _userRepo;
//
//         public LeaderboardService(
//             ILeaderboardRepository repo,
//             IUserRepository userRepo)
//         {
//             _repo = repo;
//             _userRepo = userRepo;
//         }
//
//         public async Task<IEnumerable<Leaderboard>> GetTopRankersAsync(int count) =>
//             await Task.Run(() => _repo.GetTopRankers(count));
//
//         public async Task<IEnumerable<Leaderboard>> GetByPeriodAsync(string period) =>
//             await Task.Run(() => _repo.GetByPeriod(period));
//
//         public async Task<Leaderboard?> GetUserRankAsync(int userId) =>
//             await Task.Run(() => _repo.GetByUserId(userId));
//
//         // =============================================
//         // Submission accept hone ke baad score update
//         // =============================================
//         public async Task UpdateUserScoreAsync(
//             int userId,
//             int scoreToAdd,
//             int problemsSolvedToAdd)
//         {
//             var entry = await Task.Run(() => _repo.GetByUserId(userId));
//
//             if (entry == null)
//             {
//                 // Pehli baar — naya entry banao
//                 entry = new Leaderboard
//                 {
//                     UserId = userId,
//                     Score = scoreToAdd,
//                     ProblemsSolved = problemsSolvedToAdd,
//                     TotalSubmissions = 1,
//                     Period = "AllTime",
//                     LastUpdated = DateTime.UtcNow
//                 };
//                 await Task.Run(() => _repo.AddLeaderboard(entry));
//             }
//             else
//             {
//                 // Existing entry update karo
//                 entry.Score += scoreToAdd;
//                 entry.ProblemsSolved += problemsSolvedToAdd;
//                 entry.TotalSubmissions++;
//                 entry.AccuracyPercent = entry.TotalSubmissions > 0
//                     ? Math.Round((double)entry.ProblemsSolved / entry.TotalSubmissions * 100, 2)
//                     : 0;
//                 entry.LastUpdated = DateTime.UtcNow;
//                 await Task.Run(() => _repo.UpdateLeaderboard(entry));
//             }
//
//             // User model bhi update karo
//             var user = await Task.Run(() => _userRepo.GetUserById(userId));
//             if (user != null)
//             {
//                 user.ProblemsSolved += problemsSolvedToAdd;
//                 user.TotalSubmissions++;
//                 user.Rating += scoreToAdd;
//                 await Task.Run(() => _userRepo.UpdateUser(user));
//             }
//
//             // Ranks recalculate karo
//             await RecalculateAllRanksAsync("AllTime");
//         }
//
//         public async Task RecalculateAllRanksAsync(string period) =>
//             await Task.Run(() => _repo.RecalculateRanks(period));
//     }
// }