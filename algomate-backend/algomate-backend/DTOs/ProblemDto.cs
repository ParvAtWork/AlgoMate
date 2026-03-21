namespace AlgoMateBackend.DTOs
{
    // ── Frontend ko problem data bhejne ke liye ──────────────────
    public class ProblemDTO
    {
        public int    Id              { get; set; }
        public string Title           { get; set; } = string.Empty;
        public string Description     { get; set; } = string.Empty;
        public string Difficulty      { get; set; } = string.Empty;
        public string Topic           { get; set; } = string.Empty;
        public string InputFormat     { get; set; } = string.Empty;
        public string OutputFormat    { get; set; } = string.Empty;
        public string SampleInput     { get; set; } = string.Empty;
        public string SampleOutput    { get; set; } = string.Empty;
        public string Constraints     { get; set; } = string.Empty;
        public int    TimeLimitMs     { get; set; }
        public int    MemoryLimitMb   { get; set; }
        public int    MaxScore        { get; set; }
        public int    TotalSubmissions   { get; set; }
        public int    AcceptedSubmissions { get; set; }
        public string? ContributorName { get; set; }
        public string? Hints           { get; set; }  // ← newline separated

        public double AcceptanceRate => TotalSubmissions > 0
            ? Math.Round((double)AcceptedSubmissions / TotalSubmissions * 100, 2)
            : 0;
    }

    // ── Admin problem add/edit ke liye ───────────────────────────
    public class CreateProblemDTO
    {
        public string Title           { get; set; } = string.Empty;
        public string Description     { get; set; } = string.Empty;
        public string Difficulty      { get; set; } = "Easy";
        public string Topic           { get; set; } = string.Empty;
        public string InputFormat     { get; set; } = string.Empty;
        public string OutputFormat    { get; set; } = string.Empty;
        public string SampleInput     { get; set; } = string.Empty;
        public string SampleOutput    { get; set; } = string.Empty;
        public string Constraints     { get; set; } = string.Empty;
        public int    TimeLimitMs     { get; set; } = 2000;
        public int    MemoryLimitMb   { get; set; } = 256;
        public int    MaxScore        { get; set; } = 100;
        public string? ContributorName { get; set; }
        public string? Hints           { get; set; }  // ← newline separated
        public List<TestCaseDTO> TestCases { get; set; } = new();
    }
}