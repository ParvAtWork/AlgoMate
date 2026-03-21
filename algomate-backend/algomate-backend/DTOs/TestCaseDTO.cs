namespace AlgoMateBackend.DTOs
{
    // ── Frontend se test case receive karne ke liye ──────────────
    public class TestCaseDTO
    {
        public int Id { get; set; }
        public string Input { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public bool IsHidden { get; set; } = true;
        public int Points { get; set; } = 10;
    }

    // ── Frontend ko test case bhejne ke liye ─────────────────────
    public class TestCaseResponseDTO
    {
        public int Id { get; set; }
        public int ProblemId { get; set; }
        public string Input { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public bool IsHidden { get; set; }
        public int Points { get; set; }
    }
}