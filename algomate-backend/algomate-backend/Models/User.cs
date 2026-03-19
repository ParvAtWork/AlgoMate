namespace AlgoMateBackend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // PASSWORD HASH HATAO — Supabase auth handle karta hai ye
        // public string PasswordHash { get; set; } — REMOVE KARO

        // YE ADD KARO
        public string SupabaseUid { get; set; } = string.Empty; // Supabase user ID
        public string Role { get; set; } = "Student";           // Student / Admin
        public int Rating { get; set; } = 0;                    // competitive rating
        public int ProblemsSolved { get; set; } = 0;            // total solved
        public int TotalSubmissions { get; set; } = 0;          // total attempts
        public string? AvatarUrl { get; set; }                  // profile picture
        public bool IsPremium { get; set; } = false;            // premium access
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;

        // Navigation properties — EF Core relationships
        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
        public ICollection<Leaderboard> LeaderboardEntries { get; set; } = new List<Leaderboard>();
    }
}