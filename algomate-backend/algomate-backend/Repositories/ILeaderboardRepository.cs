using AlgoMateBackend.Models;
using AlgoMateBackend.Enums; // ← ADDED

namespace AlgoMateBackend.Repositories
{
    public interface ILeaderboardRepository
    {
        // Basic
        IEnumerable<Leaderboard> GetAllLeaderboards();
        Leaderboard? GetLeaderboardById(int id);
        void AddLeaderboard(Leaderboard leaderboard);

        // ← EDITED — string period → LeaderboardPeriod enum
        IEnumerable<Leaderboard> GetByPeriod(LeaderboardPeriod period);
        Leaderboard? GetByUserId(int userId);
        IEnumerable<Leaderboard> GetTopRankers(int count);
        void UpdateLeaderboard(Leaderboard leaderboard);
        // ← EDITED — string period → LeaderboardPeriod enum
        void RecalculateRanks(LeaderboardPeriod period);
    }
}



// using AlgoMateBackend.Models;
//
// namespace AlgoMateBackend.Repositories
// {
//     public interface ILeaderboardRepository
//     {
//         // Basic — jo already hai
//         IEnumerable<Leaderboard> GetAllLeaderboards();
//         Leaderboard? GetLeaderboardById(int id);
//         void AddLeaderboard(Leaderboard leaderboard);
//
//         // YE ADD KARO
//         IEnumerable<Leaderboard> GetByPeriod(string period);        // Weekly/Monthly/AllTime
//         Leaderboard? GetByUserId(int userId);                        // user rank fetch
//         IEnumerable<Leaderboard> GetTopRankers(int count);          // top N users
//         void UpdateLeaderboard(Leaderboard leaderboard);             // score update
//         void RecalculateRanks(string period);                        // ranks update karo
//     }
// }