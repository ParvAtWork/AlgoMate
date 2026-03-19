namespace AlgoMateBackend.DTOs
{
    // Frontend ko leaderboard data bhejne ke liye
    public class LeaderboardDto
    {
        public int Rank { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public int Score { get; set; }
        public int ProblemsSolved { get; set; }
        public int TotalSubmissions { get; set; }
        public double AccuracyPercent { get; set; }
        public string? BadgeTitle { get; set; }
        public string Period { get; set; } = "AllTime";
        public DateTime LastUpdated { get; set; }
    }

    // Top rankers response
    public class LeaderboardResponseDto
    {
        public string Period { get; set; } = string.Empty;
        public int TotalEntries { get; set; }
        public IEnumerable<LeaderboardDto> Rankings { get; set; }
            = Enumerable.Empty<LeaderboardDto>();
    }
}