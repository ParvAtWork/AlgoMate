using AlgoMateBackend.Data;
using AlgoMateBackend.Models;
using AlgoMateBackend.Enums; // ← ADDED

namespace AlgoMateBackend.Repositories
{
    public class LeaderboardRepository : ILeaderboardRepository
    {
        private readonly AlgoMateDbContext _context;

        public LeaderboardRepository(AlgoMateDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Leaderboard> GetAllLeaderboards() =>
            _context.Leaderboards.ToList();

        public Leaderboard? GetLeaderboardById(int id) =>
            _context.Leaderboards.FirstOrDefault(l => l.Id == id);

        // ← EDITED — LeaderboardPeriod enum use kiya
        public IEnumerable<Leaderboard> GetByPeriod(LeaderboardPeriod period) =>
            _context.Leaderboards
                // ← EDITED — Enum se string lo
                .Where(l => l.Period == period.ToDisplayString())
                .OrderBy(l => l.Rank)
                .ToList();

        public Leaderboard? GetByUserId(int userId) =>
            _context.Leaderboards
                .FirstOrDefault(l => l.UserId == userId);

        public IEnumerable<Leaderboard> GetTopRankers(int count) =>
            _context.Leaderboards
                .OrderBy(l => l.Rank)
                .Take(count)
                .ToList();

        public void AddLeaderboard(Leaderboard leaderboard)
        {
            _context.Leaderboards.Add(leaderboard);
            _context.SaveChanges();
        }

        public void UpdateLeaderboard(Leaderboard leaderboard)
        {
            _context.Leaderboards.Update(leaderboard);
            _context.SaveChanges();
        }

        // ← EDITED — LeaderboardPeriod enum use kiya
        public void RecalculateRanks(LeaderboardPeriod period)
        {
            var entries = _context.Leaderboards
                // ← EDITED — Enum se string lo
                .Where(l => l.Period == period.ToDisplayString())
                .OrderByDescending(l => l.Score)
                .ToList();

            for (int i = 0; i < entries.Count; i++)
            {
                entries[i].Rank = i + 1;
                entries[i].LastUpdated = DateTime.UtcNow;
            }

            _context.SaveChanges();
        }
    }
}






// using AlgoMateBackend.Data;
// using AlgoMateBackend.Models;
//
// namespace AlgoMateBackend.Repositories
// {
//     public class LeaderboardRepository : ILeaderboardRepository
//     {
//         private readonly AlgoMateDbContext _context;
//
//         public LeaderboardRepository(AlgoMateDbContext context)
//         {
//             _context = context;
//         }
//
//         public IEnumerable<Leaderboard> GetAllLeaderboards() =>
//             _context.Leaderboards.ToList();
//
//         public Leaderboard? GetLeaderboardById(int id) =>
//             _context.Leaderboards.FirstOrDefault(l => l.Id == id);
//
//         public IEnumerable<Leaderboard> GetByPeriod(string period) =>
//             _context.Leaderboards
//                 .Where(l => l.Period == period)
//                 .OrderBy(l => l.Rank)
//                 .ToList();
//
//         public Leaderboard? GetByUserId(int userId) =>
//             _context.Leaderboards
//                 .FirstOrDefault(l => l.UserId == userId);
//
//         public IEnumerable<Leaderboard> GetTopRankers(int count) =>
//             _context.Leaderboards
//                 .OrderBy(l => l.Rank)
//                 .Take(count)
//                 .ToList();
//
//         public void AddLeaderboard(Leaderboard leaderboard)
//         {
//             _context.Leaderboards.Add(leaderboard);
//             _context.SaveChanges();
//         }
//
//         public void UpdateLeaderboard(Leaderboard leaderboard)
//         {
//             _context.Leaderboards.Update(leaderboard);
//             _context.SaveChanges();
//         }
//
//         public void RecalculateRanks(string period)
//         {
//             var entries = _context.Leaderboards
//                 .Where(l => l.Period == period)
//                 .OrderByDescending(l => l.Score)
//                 .ToList();
//
//             for (int i = 0; i < entries.Count; i++)
//             {
//                 entries[i].Rank = i + 1;
//                 entries[i].LastUpdated = DateTime.UtcNow;
//             }
//
//             _context.SaveChanges();
//         }
//     }
// }