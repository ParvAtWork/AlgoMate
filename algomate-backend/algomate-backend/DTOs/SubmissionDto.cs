namespace AlgoMateBackend.DTOs
{
    // Frontend ko submission result bhejne ke liye
    public class SubmissionDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ProblemId { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Output { get; set; }
        public string? ErrorMessage { get; set; }
        public double ExecutionTimeMs { get; set; }
        public double MemoryUsedMb { get; set; }
        public int Score { get; set; }
        public int TestCasesPassed { get; set; }
        public int TotalTestCases { get; set; }
        public bool IsSuccessful { get; set; }
        public DateTime SubmittedAt { get; set; }

        // Code intentionally hide kiya — security
    }

    // Code submit karne ke liye
    public class SubmitCodeDTO
    {
        public int ProblemId { get; set; }
        public string Code { get; set; } = string.Empty;
        public int LanguageId { get; set; }
        
    }
}