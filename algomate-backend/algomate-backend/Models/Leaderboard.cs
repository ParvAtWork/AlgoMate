using AlgoMateBackend.Data;
namespace AlgoMateBackend.Models

{
    public class Leaderboard
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Score { get; set; }
        public int Rank { get; set; }                           // current rank
        public int ProblemsSolved { get; set; } = 0;           // problems solved
        public int TotalSubmissions { get; set; } = 0;         // total attempts
        public double AccuracyPercent { get; set; } = 0.0;     // accuracy %
        public string? BadgeTitle { get; set; }                 // "Beginner"/"Expert" etc
        public string Period { get; set; } = "AllTime";        // AllTime/Weekly/Monthly
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User? User { get; set; }
    }
}