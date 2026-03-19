namespace AlgoMateBackend.Models
{
    public class Problem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Easy"; // Easy/Medium/Hard

        // YE ADD KARO
        public string Topic { get; set; } = string.Empty;  // Arrays/Trees/Graphs etc
        public string InputFormat { get; set; } = string.Empty;
        public string OutputFormat { get; set; } = string.Empty;
        public string SampleInput { get; set; } = string.Empty;
        public string SampleOutput { get; set; } = string.Empty;
        public string Constraints { get; set; } = string.Empty; // e.g. 1 <= n <= 10^5
        public int TimeLimitMs { get; set; } = 2000;            // time limit in ms
        public int MemoryLimitMb { get; set; } = 256;           // memory limit
        public int MaxScore { get; set; } = 100;                // points for solving
        public int TotalSubmissions { get; set; } = 0;          // how many tried
        public int AcceptedSubmissions { get; set; } = 0;       // how many solved
        public bool IsActive { get; set; } = true;              // visible or hidden
        public string? ContributorName { get; set; }            // problem creator
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<TestCase> TestCases { get; set; } = new List<TestCase>();
        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}