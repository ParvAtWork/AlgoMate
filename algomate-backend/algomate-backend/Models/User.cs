namespace AlgoMateBackend.Models
{
    public class User
    {
        public int    Id               { get; set; }
        public string Username         { get; set; } = string.Empty;
        public string Email            { get; set; } = string.Empty;
        public string SupabaseUid      { get; set; } = string.Empty;
        public string Role             { get; set; } = "Student";
        public int    Rating           { get; set; } = 0;
        public int    ProblemsSolved   { get; set; } = 0;
        public int    TotalSubmissions { get; set; } = 0;
        public string? AvatarUrl       { get; set; }
        public string? Bio             { get; set; }          // ← NEW
        public int    Streak           { get; set; } = 0;    // ← NEW
        public bool   IsPremium        { get; set; } = false;
        public DateTime CreatedAt      { get; set; } = DateTime.UtcNow;
        public DateTime LastLoginAt    { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Submission>   Submissions        { get; set; } = new List<Submission>();
        public ICollection<Leaderboard>  LeaderboardEntries { get; set; } = new List<Leaderboard>();
    }
}