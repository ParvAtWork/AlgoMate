using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using AlgoMateBackend.Models;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.Enums;
using AlgoMateBackend.Constants; // ← ADDED

namespace AlgoMateBackend.Services
{
    public interface ICompilerService
    {
        Task<Submission> SubmitCodeAsync(int userId, int problemId, string code, int languageId);
        Task<Submission> GetSubmissionResultAsync(string judge0Token);
    }

    public class Judge0SubmissionRequest
    {
        [JsonPropertyName("source_code")]
        public string SourceCode { get; set; } = string.Empty;

        [JsonPropertyName("language_id")]
        public int LanguageId { get; set; }

        [JsonPropertyName("stdin")]
        public string? Stdin { get; set; }

        [JsonPropertyName("expected_output")]
        public string? ExpectedOutput { get; set; }
    }

    public class Judge0SubmissionResponse
    {
        [JsonPropertyName("token")]
        public string? Token { get; set; }
    }

    public class Judge0ResultResponse
    {
        [JsonPropertyName("stdout")]
        public string? Stdout { get; set; }

        [JsonPropertyName("stderr")]
        public string? Stderr { get; set; }

        [JsonPropertyName("compile_output")]
        public string? CompileOutput { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("time")]
        public string? Time { get; set; }

        [JsonPropertyName("memory")]
        public double? Memory { get; set; }

        [JsonPropertyName("status")]
        public Judge0Status? Status { get; set; }
    }

    public class Judge0Status
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }

    public class CompilerService : ICompilerService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ISubmissionRepository _submissionRepo;
        private readonly IProblemRepository _problemRepo;

        public CompilerService(
            IHttpClientFactory httpClientFactory,
            ISubmissionRepository submissionRepo,
            IProblemRepository problemRepo)
        {
            _httpClientFactory = httpClientFactory;
            _submissionRepo = submissionRepo;
            _problemRepo = problemRepo;
        }

        public async Task<Submission> SubmitCodeAsync(
            int userId,
            int problemId,
            string code,
            int languageId)
        {
            if (!ProgrammingLanguageExtensions.IsValid(languageId))
                // ← EDITED — ValidationMessages constant use kiya
                throw new ArgumentException(ValidationMessages.InvalidLanguageId);

            var problem = _problemRepo.GetProblemById(problemId);
            if (problem == null)
                // ← EDITED — ErrorMessages constant use kiya
                throw new Exception(ErrorMessages.ProblemNotFound);

            var testCases = _problemRepo.GetTestCases(problemId).ToList();
            if (!testCases.Any())
                // ← EDITED — ErrorMessages constant use kiya
                throw new Exception(ErrorMessages.NoTestCasesFound);

            var submission = new Submission
            {
                UserId = userId,
                ProblemId = problemId,
                Code = code,
                LanguageId = languageId,
                Language = ((ProgrammingLanguage)languageId).ToDisplayString(),
                Status = SubmissionStatus.Pending.ToDisplayString(),
                TotalTestCases = testCases.Count,
                SubmittedAt = DateTime.UtcNow
            };

            _submissionRepo.AddSubmission(submission);
            _problemRepo.IncrementSubmissionCount(problemId);

            var firstTestCase = testCases.First();

            var judge0Request = new Judge0SubmissionRequest
            {
                SourceCode = EncodeBase64(code),
                LanguageId = languageId,
                Stdin = EncodeBase64(firstTestCase.Input),
                ExpectedOutput = EncodeBase64(firstTestCase.ExpectedOutput)
            };

            var token = await SubmitToJudge0Async(judge0Request);

            submission.Judge0Token = token;
            submission.Status = SubmissionStatus.Processing.ToDisplayString();
            _submissionRepo.UpdateSubmission(submission);

            return submission;
        }

        public async Task<Submission> GetSubmissionResultAsync(string judge0Token)
        {
            var submission = _submissionRepo.GetByJudge0Token(judge0Token)
                // ← EDITED — ErrorMessages constant use kiya
                ?? throw new Exception(ErrorMessages.Judge0TokenNotFound);

            var result = await GetResultFromJudge0Async(judge0Token)
                // ← EDITED — ErrorMessages constant use kiya
                ?? throw new Exception(ErrorMessages.Judge0ResultFailed);

            var statusId = result.Status?.Id ?? 0;
            var mappedStatus = SubmissionStatusExtensions.FromJudge0Id(statusId);

            if (!mappedStatus.IsTerminal())
            {
                submission.Status = SubmissionStatus.Processing.ToDisplayString();
                _submissionRepo.UpdateSubmission(submission);
                return submission;
            }

            submission.Status = mappedStatus.ToDisplayString();
            submission.Output = DecodeBase64(result.Stdout);
            submission.ErrorMessage = DecodeBase64(result.Stderr)
                                   ?? DecodeBase64(result.CompileOutput);

            submission.ExecutionTimeMs = double.TryParse(
                result.Time,
                System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture,
                out var timeValue) ? timeValue * 1000 : 0;

            submission.MemoryUsedMb = (result.Memory ?? 0) / 1024;
            submission.IsSuccessful = mappedStatus.IsSuccessful();

            if (submission.IsSuccessful)
            {
                var acceptedProblem = _problemRepo.GetProblemById(submission.ProblemId);
                submission.Score = acceptedProblem?.MaxScore ?? AppConstants.DefaultMaxScore;
                submission.TestCasesPassed = submission.TotalTestCases;
                _problemRepo.IncrementAcceptedCount(submission.ProblemId);
            }

            _submissionRepo.UpdateSubmission(submission);
            return submission;
        }

        private async Task<string> SubmitToJudge0Async(Judge0SubmissionRequest request)
        {
            var client = _httpClientFactory.CreateClient("Judge0");

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // ← EDITED — JudgeConstants use kiya
            var response = await client.PostAsync(
                JudgeConstants.SubmissionEndpoint,
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                // ← EDITED — ErrorMessages constant use kiya
                throw new Exception($"{ErrorMessages.Judge0SubmissionFailed}: {error}");
            }

            var responseBody = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<Judge0SubmissionResponse>(
                responseBody,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return result?.Token
                ?? throw new Exception(ErrorMessages.Judge0TokenNotFound);
        }

        private async Task<Judge0ResultResponse?> GetResultFromJudge0Async(string token)
        {
            var client = _httpClientFactory.CreateClient("Judge0");

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            // ← EDITED — AppConstants use kiya
            for (int attempt = 0; attempt < AppConstants.Judge0MaxPollingAttempts; attempt++)
            {
                // ← EDITED — JudgeConstants use kiya
                var response = await client.GetAsync(
                    string.Format(JudgeConstants.ResultEndpoint, token)
                );

                if (!response.IsSuccessStatusCode)
                    // ← EDITED — ErrorMessages constant use kiya
                    throw new Exception(ErrorMessages.Judge0ResultFailed);

                var body = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<Judge0ResultResponse>(body, options);

                var statusId = result?.Status?.Id ?? 0;
                var status = SubmissionStatusExtensions.FromJudge0Id(statusId);
                if (status.IsTerminal())
                    return result;

                // ← EDITED — AppConstants use kiya
                await Task.Delay(AppConstants.Judge0PollingDelayMs);
            }

            // ← EDITED — ErrorMessages constant use kiya
            throw new Exception(ErrorMessages.Judge0Timeout);
        }

        private string EncodeBase64(string text)
        {
            if (string.IsNullOrEmpty(text)) return string.Empty;
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(text));
        }

        private string? DecodeBase64(string? text)
        {
            if (string.IsNullOrEmpty(text)) return null;
            try
            {
                return Encoding.UTF8.GetString(Convert.FromBase64String(text));
            }
            catch
            {
                return text;
            }
        }
    }
}


// using System.Text;
// using System.Text.Json;
// using System.Text.Json.Serialization;
// using AlgoMateBackend.Models;
// using AlgoMateBackend.Repositories;
// using AlgoMateBackend.Enums; // ← ADDED
//
// namespace AlgoMateBackend.Services
// {
//     // =============================================
//     // INTERFACE
//     // =============================================
//     public interface ICompilerService
//     {
//         Task<Submission> SubmitCodeAsync(int userId, int problemId, string code, int languageId);
//         Task<Submission> GetSubmissionResultAsync(string judge0Token);
//     }
//
//     // =============================================
//     // Judge0 DTOs
//     // =============================================
//     public class Judge0SubmissionRequest
//     {
//         [JsonPropertyName("source_code")]
//         public string SourceCode { get; set; } = string.Empty;
//
//         [JsonPropertyName("language_id")]
//         public int LanguageId { get; set; }
//
//         [JsonPropertyName("stdin")]
//         public string? Stdin { get; set; }
//
//         [JsonPropertyName("expected_output")]
//         public string? ExpectedOutput { get; set; }
//     }
//
//     public class Judge0SubmissionResponse
//     {
//         [JsonPropertyName("token")]
//         public string? Token { get; set; }
//     }
//
//     public class Judge0ResultResponse
//     {
//         [JsonPropertyName("stdout")]
//         public string? Stdout { get; set; }
//
//         [JsonPropertyName("stderr")]
//         public string? Stderr { get; set; }
//
//         [JsonPropertyName("compile_output")]
//         public string? CompileOutput { get; set; }
//
//         [JsonPropertyName("message")]
//         public string? Message { get; set; }
//
//         // FIX — Judge0 "1.234" string bhejta hai, double nahi
//         [JsonPropertyName("time")]
//         public string? Time { get; set; }
//
//         [JsonPropertyName("memory")]
//         public double? Memory { get; set; }
//
//         [JsonPropertyName("status")]
//         public Judge0Status? Status { get; set; }
//     }
//
//     public class Judge0Status
//     {
//         [JsonPropertyName("id")]
//         public int Id { get; set; }
//
//         [JsonPropertyName("description")]
//         public string? Description { get; set; }
//     }
//
//     // =============================================
//     // COMPILER SERVICE IMPLEMENTATION
//     // =============================================
//     public class CompilerService : ICompilerService
//     {
//         private readonly IHttpClientFactory _httpClientFactory;
//         private readonly ISubmissionRepository _submissionRepo;
//         private readonly IProblemRepository _problemRepo;
//
//         // ← EDITED — Constants hata diye, Enum use karega
//         public CompilerService(
//             IHttpClientFactory httpClientFactory,
//             ISubmissionRepository submissionRepo,
//             IProblemRepository problemRepo)
//         {
//             _httpClientFactory = httpClientFactory;
//             _submissionRepo = submissionRepo;
//             _problemRepo = problemRepo;
//         }
//
//         // =============================================
//         // STEP 1 — Submit code to Judge0
//         // =============================================
//         public async Task<Submission> SubmitCodeAsync(
//             int userId,
//             int problemId,
//             string code,
//             int languageId)
//         {
//             // ← ADDED — Language validate karo
//             if (!ProgrammingLanguageExtensions.IsValid(languageId))
//                 throw new ArgumentException($"Invalid language ID: {languageId}");
//
//             var problem = _problemRepo.GetProblemById(problemId);
//             if (problem == null)
//                 throw new Exception($"Problem {problemId} not found.");
//
//             var testCases = _problemRepo.GetTestCases(problemId).ToList();
//             if (!testCases.Any())
//                 throw new Exception("No test cases found for this problem.");
//
//             var submission = new Submission
//             {
//                 UserId = userId,
//                 ProblemId = problemId,
//                 Code = code,
//                 LanguageId = languageId,
//                 // ← EDITED — Enum se language name lo
//                 Language = ((ProgrammingLanguage)languageId).ToDisplayString(),
//                 // ← EDITED — Enum se status string lo
//                 Status = SubmissionStatus.Pending.ToDisplayString(),
//                 TotalTestCases = testCases.Count,
//                 SubmittedAt = DateTime.UtcNow
//             };
//
//             _submissionRepo.AddSubmission(submission);
//             _problemRepo.IncrementSubmissionCount(problemId);
//
//             var firstTestCase = testCases.First();
//
//             var judge0Request = new Judge0SubmissionRequest
//             {
//                 SourceCode = EncodeBase64(code),
//                 LanguageId = languageId,
//                 Stdin = EncodeBase64(firstTestCase.Input),
//                 ExpectedOutput = EncodeBase64(firstTestCase.ExpectedOutput)
//             };
//
//             var token = await SubmitToJudge0Async(judge0Request);
//
//             submission.Judge0Token = token;
//             // ← EDITED — Enum se status string lo
//             submission.Status = SubmissionStatus.Processing.ToDisplayString();
//             _submissionRepo.UpdateSubmission(submission);
//
//             return submission;
//         }
//
//         // =============================================
//         // STEP 2 — Get result from Judge0
//         // =============================================
//         public async Task<Submission> GetSubmissionResultAsync(string judge0Token)
//         {
//             var submission = _submissionRepo.GetByJudge0Token(judge0Token)
//                 ?? throw new Exception($"Submission with token {judge0Token} not found.");
//
//             var result = await GetResultFromJudge0Async(judge0Token)
//                 ?? throw new Exception("Failed to get result from Judge0.");
//
//             var statusId = result.Status?.Id ?? 0;
//
//             // ← EDITED — Enum se check karo
//             var mappedStatus = SubmissionStatusExtensions.FromJudge0Id(statusId);
//
//             if (!mappedStatus.IsTerminal())
//             {
//                 submission.Status = SubmissionStatus.Processing.ToDisplayString();
//                 _submissionRepo.UpdateSubmission(submission);
//                 return submission;
//             }
//
//             // ← EDITED — Enum se status string lo
//             submission.Status = mappedStatus.ToDisplayString();
//             submission.Output = DecodeBase64(result.Stdout);
//             submission.ErrorMessage = DecodeBase64(result.Stderr)
//                                    ?? DecodeBase64(result.CompileOutput);
//
//             // FIX — Time string se double mein convert karo
//             submission.ExecutionTimeMs = double.TryParse(
//                 result.Time,
//                 System.Globalization.NumberStyles.Any,
//                 System.Globalization.CultureInfo.InvariantCulture,
//                 out var timeValue) ? timeValue * 1000 : 0;
//
//             submission.MemoryUsedMb = (result.Memory ?? 0) / 1024;
//             // ← EDITED — Enum se check karo
//             submission.IsSuccessful = mappedStatus.IsSuccessful();
//
//             if (submission.IsSuccessful)
//             {
//                 var acceptedProblem = _problemRepo.GetProblemById(submission.ProblemId);
//                 submission.Score = acceptedProblem?.MaxScore ?? 100;
//                 submission.TestCasesPassed = submission.TotalTestCases;
//                 _problemRepo.IncrementAcceptedCount(submission.ProblemId);
//             }
//
//             _submissionRepo.UpdateSubmission(submission);
//             return submission;
//         }
//
//         // =============================================
//         // PRIVATE HELPERS
//         // =============================================
//         private async Task<string> SubmitToJudge0Async(Judge0SubmissionRequest request)
//         {
//             var client = _httpClientFactory.CreateClient("Judge0");
//
//             var json = JsonSerializer.Serialize(request);
//             var content = new StringContent(json, Encoding.UTF8, "application/json");
//
//             var response = await client.PostAsync(
//                 "submissions?base64_encoded=true&fields=token",
//                 content
//             );
//
//             if (!response.IsSuccessStatusCode)
//             {
//                 var error = await response.Content.ReadAsStringAsync();
//                 throw new Exception($"Judge0 submission failed: {error}");
//             }
//
//             var responseBody = await response.Content.ReadAsStringAsync();
//
//             var result = JsonSerializer.Deserialize<Judge0SubmissionResponse>(
//                 responseBody,
//                 new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
//
//             return result?.Token
//                 ?? throw new Exception("Judge0 did not return a token.");
//         }
//
//         private async Task<Judge0ResultResponse?> GetResultFromJudge0Async(string token)
//         {
//             var client = _httpClientFactory.CreateClient("Judge0");
//
//             var options = new JsonSerializerOptions
//             {
//                 PropertyNameCaseInsensitive = true
//             };
//
//             for (int attempt = 0; attempt < 10; attempt++)
//             {
//                 var response = await client.GetAsync(
//                     $"submissions/{token}?base64_encoded=true&fields=stdout,stderr,compile_output,message,time,memory,status"
//                 );
//
//                 if (!response.IsSuccessStatusCode)
//                     throw new Exception("Failed to fetch result from Judge0.");
//
//                 var body = await response.Content.ReadAsStringAsync();
//                 var result = JsonSerializer.Deserialize<Judge0ResultResponse>(body, options);
//
//                 var statusId = result?.Status?.Id ?? 0;
//
//                 // ← EDITED — Enum se check karo
//                 var status = SubmissionStatusExtensions.FromJudge0Id(statusId);
//                 if (status.IsTerminal())
//                     return result;
//
//                 await Task.Delay(1000);
//             }
//
//             throw new Exception("Judge0 result timeout — try again later.");
//         }
//
//         // ← EDITED — MapJudge0Status aur GetLanguageName methods hata diye
//         // Enums use kar rahe hain ab
//
//         private string EncodeBase64(string text)
//         {
//             if (string.IsNullOrEmpty(text)) return string.Empty;
//             return Convert.ToBase64String(Encoding.UTF8.GetBytes(text));
//         }
//
//         private string? DecodeBase64(string? text)
//         {
//             if (string.IsNullOrEmpty(text)) return null;
//             try
//             {
//                 return Encoding.UTF8.GetString(Convert.FromBase64String(text));
//             }
//             catch
//             {
//                 return text;
//             }
//         }
//     }
// }
//
//
