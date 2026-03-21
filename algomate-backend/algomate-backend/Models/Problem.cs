namespace AlgoMateBackend.Models
{
    public class Problem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Easy";
        public string Topic { get; set; } = string.Empty;
        public string InputFormat { get; set; } = string.Empty;
        public string OutputFormat { get; set; } = string.Empty;
        public string SampleInput { get; set; } = string.Empty;
        public string SampleOutput { get; set; } = string.Empty;
        public string Constraints { get; set; } = string.Empty;
        public int TimeLimitMs { get; set; } = 2000;
        public int MemoryLimitMb { get; set; } = 256;
        public int MaxScore { get; set; } = 100;
        public int TotalSubmissions { get; set; } = 0;
        public int AcceptedSubmissions { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public string? ContributorName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ← Hints — newline separated
        public string? Hints { get; set; }

        // Navigation properties
        public ICollection<TestCase>   TestCases   { get; set; } = new List<TestCase>();
        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}