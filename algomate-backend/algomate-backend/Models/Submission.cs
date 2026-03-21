using System.ComponentModel.DataAnnotations;

namespace AlgoMateBackend.Models
{
    public class Submission
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ProblemId { get; set; }

        [MaxLength(50000)]
        public string Code { get; set; } = string.Empty;

        public bool IsSuccessful { get; set; }

        [MaxLength(50)]
        public string Language { get; set; } = string.Empty;

        public int LanguageId { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending";

        [MaxLength(10000)]
        public string? Output { get; set; }

        [MaxLength(10000)]
        public string? ExpectedOutput { get; set; }

        [MaxLength(10000)]
        public string? ActualOutput { get; set; }       // ← tumhara actual output

        [MaxLength(10000)]
        public string? TestInput { get; set; }          // ← test case input

        [MaxLength(5000)]
        public string? ErrorMessage { get; set; }

        [MaxLength(5000)]
        public string? CompileError { get; set; }       // ← compile error full

        [MaxLength(5000)]
        public string? RuntimeError { get; set; }       // ← runtime error full

        public double ExecutionTimeMs { get; set; }
        public double MemoryUsedMb { get; set; }
        public int Score { get; set; } = 0;
        public int TestCasesPassed { get; set; } = 0;
        public int TotalTestCases { get; set; } = 0;

        [MaxLength(100)]
        public string? Judge0Token { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? User { get; set; }
        public Problem? Problem { get; set; }
    }
}

// using System.ComponentModel.DataAnnotations;
//
// namespace AlgoMateBackend.Models
// {
//     public class Submission
//     {
//         public int Id { get; set; }
//         public int UserId { get; set; }
//         public int ProblemId { get; set; }
//
//         [MaxLength(50000)]
//         public string Code { get; set; } = string.Empty;        // 50KB enough for any code
//
//         public bool IsSuccessful { get; set; }
//
//         [MaxLength(50)]
//         public string Language { get; set; } = string.Empty;    // C++, Java, Python
//
//         public int LanguageId { get; set; }                     // Judge0 language ID
//
//         [MaxLength(50)]
//         public string Status { get; set; } = "Pending";         // Accepted/Wrong Answer/TLE etc
//
//         [MaxLength(10000)]
//         public string? Output { get; set; }                     // actual output
//
//         [MaxLength(10000)]
//         public string? ExpectedOutput { get; set; }             // expected output
//
//         [MaxLength(5000)]
//         public string? ErrorMessage { get; set; }               // compiler error if any
//
//         public double ExecutionTimeMs { get; set; }             // time taken
//         public double MemoryUsedMb { get; set; }                // memory used
//         public int Score { get; set; } = 0;                     // points earned
//         public int TestCasesPassed { get; set; } = 0;           // how many passed
//         public int TotalTestCases { get; set; } = 0;            // total test cases
//
//         [MaxLength(100)]
//         public string? Judge0Token { get; set; }                // Judge0 submission token
//
//         public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
//
//         // Navigation properties
//         public User? User { get; set; }
//         public Problem? Problem { get; set; }
//     }
// }
//
//
//
//
//
//
// // namespace AlgoMateBackend.Models
// // {
// //     public class Submission
// //     {
// //         public int Id { get; set; }
// //         public int UserId { get; set; }
// //         public int ProblemId { get; set; }
// //         public string Code { get; set; } = string.Empty;
// //         public bool IsSuccessful { get; set; }
// //         public string Language { get; set; } = string.Empty;    // C++, Java, Python
// //         public int LanguageId { get; set; }                     // Judge0 language ID
// //         public string Status { get; set; } = "Pending";         // Accepted/Wrong Answer/TLE etc
// //         public string? Output { get; set; }                     // actual output
// //         public string? ExpectedOutput { get; set; }             // expected output
// //         public string? ErrorMessage { get; set; }               // compiler error if any
// //         public double ExecutionTimeMs { get; set; }             // time taken
// //         public double MemoryUsedMb { get; set; }                // memory used
// //         public int Score { get; set; } = 0;                     // points earned
// //         public int TestCasesPassed { get; set; } = 0;           // how many passed
// //         public int TotalTestCases { get; set; } = 0;            // total test cases
// //         public string? Judge0Token { get; set; }                // Judge0 submission token
// //         public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
// //
// //         // Navigation properties
// //         public User? User { get; set; }
// //         public Problem? Problem { get; set; }
// //     }
// // }
//     