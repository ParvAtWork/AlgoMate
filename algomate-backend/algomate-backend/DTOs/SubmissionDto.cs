namespace AlgoMateBackend.DTOs
{
    // ── Frontend ko submission result bhejne ke liye ──────────────
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

        // ── LeetCode style detailed result ───────────────────────
        public string? TestInput { get; set; }        // failed test case input
        public string? ExpectedOutput { get; set; }   // sahi output
        public string? ActualOutput { get; set; }     // tumhara output
        public string? CompileError { get; set; }     // compile error
        public string? RuntimeError { get; set; }     // runtime error
        public List<ErrorLineDto> ErrorLines { get; set; } = new();
    }

    // ── Line-wise error detail ────────────────────────────────────
    public class ErrorLineDto
    {
        public int    Line    { get; set; }
        public int?   Column  { get; set; }
        public string Type    { get; set; } = string.Empty;   // error / warning
        public string Message { get; set; } = string.Empty;   // error description
        public string? Code   { get; set; }                   // e.g. CS1002, E0001
    }

    // ── Code submit karne ke liye ─────────────────────────────────
    public class SubmitCodeDTO
    {
        public int    ProblemId { get; set; }
        public string Code      { get; set; } = string.Empty;
        public int    LanguageId { get; set; }
    }
}



// namespace AlgoMateBackend.DTOs
// {
//     // Frontend ko submission result bhejne ke liye
//     public class SubmissionDto
//     {
//         public int Id { get; set; }
//         public int UserId { get; set; }
//         public int ProblemId { get; set; }
//         public string Language { get; set; } = string.Empty;
//         public string Status { get; set; } = string.Empty;
//         public string? Output { get; set; }
//         public string? ErrorMessage { get; set; }
//         public double ExecutionTimeMs { get; set; }
//         public double MemoryUsedMb { get; set; }
//         public int Score { get; set; }
//         public int TestCasesPassed { get; set; }
//         public int TotalTestCases { get; set; }
//         public bool IsSuccessful { get; set; }
//         public DateTime SubmittedAt { get; set; }
//
//         // Code intentionally hide kiya — security
//     }
//
//     // Code submit karne ke liye
//     public class SubmitCodeDTO
//     {
//         public int ProblemId { get; set; }
//         public string Code { get; set; } = string.Empty;
//         public int LanguageId { get; set; }
//         
//     }
// }