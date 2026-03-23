using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using AlgoMateBackend.Models;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.Enums;
using AlgoMateBackend.Constants;

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
            _submissionRepo    = submissionRepo;
            _problemRepo       = problemRepo;
        }

        // =============================================
        // STEP 1 — Submit code to Judge0
        // =============================================
        public async Task<Submission> SubmitCodeAsync(
            int userId, int problemId, string code, int languageId)
        {
            if (!ProgrammingLanguageExtensions.IsValid(languageId))
                throw new ArgumentException(ValidationMessages.InvalidLanguageId);

            var problem = _problemRepo.GetProblemById(problemId);
            if (problem == null)
                throw new Exception(ErrorMessages.ProblemNotFound);

            var testCases = _problemRepo.GetTestCases(problemId).ToList();
            if (!testCases.Any())
                throw new Exception(ErrorMessages.NoTestCasesFound);

            // ── Auto wrap code with imports + template ────────────
            var wrappedCode = WrapCodeForLanguage(code, languageId);

            var submission = new Submission
            {
                UserId         = userId,
                ProblemId      = problemId,
                Code           = code,           // original code save karo
                LanguageId     = languageId,
                Language       = ((ProgrammingLanguage)languageId).ToDisplayString(),
                Status         = SubmissionStatus.Pending.ToDisplayString(),
                TotalTestCases = testCases.Count,
                SubmittedAt    = DateTime.UtcNow
            };

            _submissionRepo.AddSubmission(submission);
            _problemRepo.IncrementSubmissionCount(problemId);

            var firstTestCase = testCases.First();

            var judge0Request = new Judge0SubmissionRequest
            {
                SourceCode     = EncodeBase64(wrappedCode),   // wrapped code Judge0 ko
                LanguageId     = languageId,
                Stdin          = EncodeBase64(firstTestCase.Input),
                ExpectedOutput = EncodeBase64(firstTestCase.ExpectedOutput)
            };

            var token = await SubmitToJudge0Async(judge0Request);

            submission.Judge0Token = token;
            submission.Status      = SubmissionStatus.Processing.ToDisplayString();
            _submissionRepo.UpdateSubmission(submission);

            return submission;
        }

        // =============================================
        // STEP 2 — Get result from Judge0
        // =============================================
        public async Task<Submission> GetSubmissionResultAsync(string judge0Token)
        {
            var submission = _submissionRepo.GetByJudge0Token(judge0Token)
                ?? throw new Exception(ErrorMessages.Judge0TokenNotFound);

            var testCases     = _problemRepo.GetTestCases(submission.ProblemId).ToList();
            var firstTestCase = testCases.FirstOrDefault();

            var result = await GetResultFromJudge0Async(judge0Token)
                ?? throw new Exception(ErrorMessages.Judge0ResultFailed);

            var statusId     = result.Status?.Id ?? 0;
            var mappedStatus = SubmissionStatusExtensions.FromJudge0Id(statusId);

            if (!mappedStatus.IsTerminal())
            {
                submission.Status = SubmissionStatus.Processing.ToDisplayString();
                _submissionRepo.UpdateSubmission(submission);
                return submission;
            }

            // ── Basic fields ──────────────────────────────────────
            submission.Status       = mappedStatus.ToDisplayString();
            submission.Output       = DecodeBase64(result.Stdout);
            submission.ActualOutput = DecodeBase64(result.Stdout)?.Trim();
            submission.TestInput    = firstTestCase?.Input;

            // ── Wrong Answer ──────────────────────────────────────
            if (mappedStatus == SubmissionStatus.WrongAnswer)
                submission.ExpectedOutput = firstTestCase?.ExpectedOutput?.Trim();

            // ── Error parsing ─────────────────────────────────────
            var compileOutput = DecodeBase64(result.CompileOutput);
            var stderrOutput  = DecodeBase64(result.Stderr);

            if (!string.IsNullOrWhiteSpace(compileOutput))
            {
                submission.CompileError = compileOutput;
                submission.ErrorMessage = compileOutput;
            }
            else if (!string.IsNullOrWhiteSpace(stderrOutput))
            {
                submission.RuntimeError = stderrOutput;
                submission.ErrorMessage = stderrOutput;
            }

            // ── Time & Memory ─────────────────────────────────────
            submission.ExecutionTimeMs = double.TryParse(
                result.Time,
                System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture,
                out var timeValue) ? timeValue * 1000 : 0;

            submission.MemoryUsedMb = (result.Memory ?? 0) / 1024;
            submission.IsSuccessful = mappedStatus.IsSuccessful();

            if (submission.IsSuccessful)
            {
                var acceptedProblem        = _problemRepo.GetProblemById(submission.ProblemId);
                submission.Score           = acceptedProblem?.MaxScore ?? AppConstants.DefaultMaxScore;
                submission.TestCasesPassed = submission.TotalTestCases;
                _problemRepo.IncrementAcceptedCount(submission.ProblemId);
            }

            _submissionRepo.UpdateSubmission(submission);
            return submission;
        }

        // =============================================
        // LANGUAGE WRAPPER — User-friendly templates
        // =============================================
        private string WrapCodeForLanguage(string code, int languageId)
        {
            var lang = (ProgrammingLanguage)languageId;

            switch (lang)
            {
                // ── C++ ──────────────────────────────────────────
                case ProgrammingLanguage.CPP:
                {
                    var hasInclude = code.Contains("#include");
                    var hasMain    = code.Contains("int main(");

                    // Already complete — return as is
                    if (hasInclude && hasMain) return code;

                    var sb = new StringBuilder();

                    // Add headers if missing
                    if (!hasInclude)
                    {
                        sb.AppendLine("#include <bits/stdc++.h>");
                        sb.AppendLine("using namespace std;");
                        sb.AppendLine();
                    }

                    // Has solution but no main — wrap
                    if (!hasMain)
                    {
                        sb.AppendLine(code);
                        sb.AppendLine();
                        sb.AppendLine("int main() {");
                        sb.AppendLine("    ios_base::sync_with_stdio(false);");
                        sb.AppendLine("    cin.tie(NULL);");
                        sb.AppendLine("    Solution sol;");
                        sb.AppendLine("    sol.solve();");
                        sb.AppendLine("    return 0;");
                        sb.AppendLine("}");
                        return sb.ToString();
                    }

                    sb.Append(code);
                    return sb.ToString();
                }

                // ── C ────────────────────────────────────────────
                case ProgrammingLanguage.C:
                {
                    var hasInclude = code.Contains("#include");
                    var hasMain    = code.Contains("int main(");

                    if (hasInclude && hasMain) return code;

                    var sb = new StringBuilder();

                    if (!hasInclude)
                    {
                        sb.AppendLine("#include <stdio.h>");
                        sb.AppendLine("#include <stdlib.h>");
                        sb.AppendLine("#include <string.h>");
                        sb.AppendLine("#include <math.h>");
                        sb.AppendLine();
                    }

                    if (!hasMain)
                    {
                        sb.AppendLine(code);
                        sb.AppendLine();
                        sb.AppendLine("int main() {");
                        sb.AppendLine("    // TODO: call your function and print result");
                        sb.AppendLine("    return 0;");
                        sb.AppendLine("}");
                        return sb.ToString();
                    }

                    sb.Append(code);
                    return sb.ToString();
                }

                // ── Java ─────────────────────────────────────────
                case ProgrammingLanguage.Java:
                {
                    var hasUtilImport = code.Contains("import java.util");
                    var hasIoImport   = code.Contains("import java.io");
                    var hasMainClass  = code.Contains("public class Main") ||
                                        code.Contains("class Main");
                    var hasSolution   = code.Contains("class Solution");

                    // Already complete
                    if (hasMainClass && hasUtilImport && hasIoImport) return code;

                    var sb = new StringBuilder();

                    // Always add imports at top
                    if (!hasUtilImport) sb.AppendLine("import java.util.*;");
                    if (!hasIoImport)   sb.AppendLine("import java.io.*;");
                    sb.AppendLine();

                    // Has Solution class but no Main — wrap with Main
                    if (hasSolution && !hasMainClass)
                    {
                        sb.AppendLine("public class Main {");
                        sb.AppendLine("    public static void main(String[] args) throws Exception {");
                        sb.AppendLine("        Scanner sc = new Scanner(System.in);");
                        sb.AppendLine("        Solution sol = new Solution();");
                        sb.AppendLine("        // Input read karke sol methods call karo");
                        sb.AppendLine("    }");
                        sb.AppendLine("}");
                        sb.AppendLine();
                        sb.AppendLine(code);
                        return sb.ToString();
                    }

                    // No class at all — raw logic hai, Main mein wrap karo
                    if (!hasMainClass && !hasSolution)
                    {
                        sb.AppendLine("public class Main {");
                        sb.AppendLine("    public static void main(String[] args) throws Exception {");
                        sb.AppendLine("        Scanner sc = new Scanner(System.in);");
                        sb.AppendLine(code);
                        sb.AppendLine("    }");
                        sb.AppendLine("}");
                        return sb.ToString();
                    }

                    // Has Main — just add imports
                    sb.Append(code);
                    return sb.ToString();
                }

                // ── Python ───────────────────────────────────────
                case ProgrammingLanguage.Python:
                {
                    var hasSysImport   = code.Contains("import sys");
                    var hasInputRedirect = code.Contains("input = sys.stdin");

                    // Already has sys setup
                    if (hasSysImport && hasInputRedirect) return code;

                    var sb = new StringBuilder();

                    if (!hasSysImport)
                    {
                        sb.AppendLine("import sys");
                        sb.AppendLine("import os");
                        sb.AppendLine("from collections import defaultdict, Counter, deque");
                        sb.AppendLine("from heapq import heappush, heappop");
                        sb.AppendLine("from itertools import combinations, permutations");
                        sb.AppendLine("import math");
                        sb.AppendLine();
                    }

                    if (!hasInputRedirect)
                        sb.AppendLine("input = sys.stdin.readline");

                    sb.AppendLine();
                    sb.Append(code);
                    return sb.ToString();
                }

                // ── JavaScript ───────────────────────────────────
                case ProgrammingLanguage.JavaScript:
                {
                    var hasReadline = code.Contains("readline") ||
                                      code.Contains("require(") ||
                                      code.Contains("process.stdin");

                    // Already has input setup
                    if (hasReadline) return code;

                    var sb = new StringBuilder();
                    sb.AppendLine("const readline = require('readline');");
                    sb.AppendLine("const rl = readline.createInterface({");
                    sb.AppendLine("    input: process.stdin,");
                    sb.AppendLine("    output: process.stdout,");
                    sb.AppendLine("    terminal: false");
                    sb.AppendLine("});");
                    sb.AppendLine("const lines = [];");
                    sb.AppendLine("rl.on('line', (line) => lines.push(line.trim()));");
                    sb.AppendLine("rl.on('close', () => {");
                    sb.AppendLine("    let idx = 0;");
                    sb.AppendLine("    const input = () => lines[idx++];");
                    sb.AppendLine();
                    sb.AppendLine(code);
                    sb.AppendLine("});");
                    return sb.ToString();
                }

                // ── C# ───────────────────────────────────────────
                case ProgrammingLanguage.CSharp:
                {
                    var hasUsing     = code.Contains("using System");
                    var hasNamespace = code.Contains("namespace") ||
                                       code.Contains("class Solution") ||
                                       code.Contains("class Program");
                    var hasMain      = code.Contains("static void Main") ||
                                       code.Contains("static async Task Main");

                    // Already complete
                    if (hasUsing && hasMain) return code;

                    var sb = new StringBuilder();

                    if (!hasUsing)
                    {
                        sb.AppendLine("using System;");
                        sb.AppendLine("using System.Collections.Generic;");
                        sb.AppendLine("using System.Linq;");
                        sb.AppendLine("using System.Text;");
                        sb.AppendLine("using System.IO;");
                        sb.AppendLine();
                    }

                    // Solution class but no Main
                    if (code.Contains("class Solution") && !hasMain)
                    {
                        sb.AppendLine("public class Program {");
                        sb.AppendLine("    static void Main(string[] args) {");
                        sb.AppendLine("        var sol = new Solution();");
                        sb.AppendLine("        // Input read karke sol methods call karo");
                        sb.AppendLine("    }");
                        sb.AppendLine("}");
                        sb.AppendLine();
                        sb.Append(code);
                        return sb.ToString();
                    }

                    // No class — raw logic
                    if (!hasNamespace && !hasMain)
                    {
                        sb.AppendLine("public class Program {");
                        sb.AppendLine("    static void Main(string[] args) {");
                        sb.AppendLine(code);
                        sb.AppendLine("    }");
                        sb.AppendLine("}");
                        return sb.ToString();
                    }

                    sb.Append(code);
                    return sb.ToString();
                }

                // ── Go ───────────────────────────────────────────
                case ProgrammingLanguage.Go:
                {
                    var hasPackage = code.Contains("package main");
                    var hasFmtImport = code.Contains("\"fmt\"") ||
                                       code.Contains("\"bufio\"");
                    var hasMain    = code.Contains("func main()");

                    // Already complete
                    if (hasPackage && hasMain) return code;

                    var sb = new StringBuilder();

                    if (!hasPackage)
                    {
                        sb.AppendLine("package main");
                        sb.AppendLine();
                    }

                    if (!hasFmtImport)
                    {
                        sb.AppendLine("import (");
                        sb.AppendLine("    \"bufio\"");
                        sb.AppendLine("    \"fmt\"");
                        sb.AppendLine("    \"os\"");
                        sb.AppendLine("    \"strconv\"");
                        sb.AppendLine("    \"strings\"");
                        sb.AppendLine(")");
                        sb.AppendLine();
                        sb.AppendLine("var reader = bufio.NewReader(os.Stdin)");
                        sb.AppendLine("var writer = bufio.NewWriter(os.Stdout)");
                        sb.AppendLine();
                    }

                    if (!hasMain)
                    {
                        sb.AppendLine(code);
                        sb.AppendLine();
                        sb.AppendLine("func main() {");
                        sb.AppendLine("    defer writer.Flush()");
                        sb.AppendLine("    // TODO: read input and call your functions");
                        sb.AppendLine("}");
                        return sb.ToString();
                    }

                    sb.Append(code);
                    return sb.ToString();
                }

                // ── Ruby ─────────────────────────────────────────
                case ProgrammingLanguage.Ruby:
                {
                    var hasRequire = code.Contains("require");
                    var hasGets    = code.Contains("gets") ||
                                     code.Contains("STDIN") ||
                                     code.Contains("readline");

                    // Already has input setup
                    if (hasGets) return code;

                    var sb = new StringBuilder();
                    sb.AppendLine("# frozen_string_literal: true");
                    sb.AppendLine();

                    if (!hasRequire)
                    {
                        sb.AppendLine("require 'set'");
                        sb.AppendLine();
                    }

                    sb.AppendLine("input = $stdin.read.split");
                    sb.AppendLine("idx = 0");
                    sb.AppendLine("read_int = -> { input[idx].to_i.tap { idx += 1 } }");
                    sb.AppendLine("read_str = -> { input[idx].tap { idx += 1 } }");
                    sb.AppendLine();
                    sb.Append(code);
                    return sb.ToString();
                }

                default:
                    return code;
            }
        }

        // =============================================
        // PRIVATE HELPERS
        // =============================================
        private async Task<string> SubmitToJudge0Async(Judge0SubmissionRequest request)
        {
            var client  = _httpClientFactory.CreateClient("Judge0");
            var json    = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(JudgeConstants.SubmissionEndpoint, content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"{ErrorMessages.Judge0SubmissionFailed}: {error}");
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            var result       = JsonSerializer.Deserialize<Judge0SubmissionResponse>(
                responseBody,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return result?.Token ?? throw new Exception(ErrorMessages.Judge0TokenNotFound);
        }

        private async Task<Judge0ResultResponse?> GetResultFromJudge0Async(string token)
        {
            var client  = _httpClientFactory.CreateClient("Judge0");
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            for (int attempt = 0; attempt < AppConstants.Judge0MaxPollingAttempts; attempt++)
            {
                var response = await client.GetAsync(
                    string.Format(JudgeConstants.ResultEndpoint, token));

                if (!response.IsSuccessStatusCode)
                    throw new Exception(ErrorMessages.Judge0ResultFailed);

                var body   = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<Judge0ResultResponse>(body, options);

                var statusId = result?.Status?.Id ?? 0;
                var status   = SubmissionStatusExtensions.FromJudge0Id(statusId);
                if (status.IsTerminal()) return result;

                await Task.Delay(AppConstants.Judge0PollingDelayMs);
            }

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
            try   { return Encoding.UTF8.GetString(Convert.FromBase64String(text)); }
            catch { return text; }
        }
    }
}

// using System.Text;
// using System.Text.Json;
// using System.Text.Json.Serialization;
// using AlgoMateBackend.Models;
// using AlgoMateBackend.Repositories;
// using AlgoMateBackend.Enums;
// using AlgoMateBackend.Constants;
//
// namespace AlgoMateBackend.Services
// {
//     public interface ICompilerService
//     {
//         Task<Submission> SubmitCodeAsync(int userId, int problemId, string code, int languageId);
//         Task<Submission> GetSubmissionResultAsync(string judge0Token);
//     }
//
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
//     public class CompilerService : ICompilerService
//     {
//         private readonly IHttpClientFactory _httpClientFactory;
//         private readonly ISubmissionRepository _submissionRepo;
//         private readonly IProblemRepository _problemRepo;
//
//         public CompilerService(
//             IHttpClientFactory httpClientFactory,
//             ISubmissionRepository submissionRepo,
//             IProblemRepository problemRepo)
//         {
//             _httpClientFactory = httpClientFactory;
//             _submissionRepo    = submissionRepo;
//             _problemRepo       = problemRepo;
//         }
//
//         // =============================================
//         // STEP 1 — Submit code to Judge0
//         // =============================================
//         public async Task<Submission> SubmitCodeAsync(
//             int userId, int problemId, string code, int languageId)
//         {
//             if (!ProgrammingLanguageExtensions.IsValid(languageId))
//                 throw new ArgumentException(ValidationMessages.InvalidLanguageId);
//
//             var problem = _problemRepo.GetProblemById(problemId);
//             if (problem == null)
//                 throw new Exception(ErrorMessages.ProblemNotFound);
//
//             var testCases = _problemRepo.GetTestCases(problemId).ToList();
//             if (!testCases.Any())
//                 throw new Exception(ErrorMessages.NoTestCasesFound);
//
//             var submission = new Submission
//             {
//                 UserId         = userId,
//                 ProblemId      = problemId,
//                 Code           = code,
//                 LanguageId     = languageId,
//                 Language       = ((ProgrammingLanguage)languageId).ToDisplayString(),
//                 Status         = SubmissionStatus.Pending.ToDisplayString(),
//                 TotalTestCases = testCases.Count,
//                 SubmittedAt    = DateTime.UtcNow
//             };
//
//             _submissionRepo.AddSubmission(submission);
//             _problemRepo.IncrementSubmissionCount(problemId);
//
//             var firstTestCase = testCases.First();
//
//             var judge0Request = new Judge0SubmissionRequest
//             {
//                 SourceCode     = EncodeBase64(code),
//                 LanguageId     = languageId,
//                 Stdin          = EncodeBase64(firstTestCase.Input),
//                 ExpectedOutput = EncodeBase64(firstTestCase.ExpectedOutput)
//             };
//
//             var token = await SubmitToJudge0Async(judge0Request);
//
//             submission.Judge0Token = token;
//             submission.Status      = SubmissionStatus.Processing.ToDisplayString();
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
//                 ?? throw new Exception(ErrorMessages.Judge0TokenNotFound);
//
//             // ── Test case fetch karo ─────────────────────────────
//             var testCases     = _problemRepo.GetTestCases(submission.ProblemId).ToList();
//             var firstTestCase = testCases.FirstOrDefault();
//
//             var result = await GetResultFromJudge0Async(judge0Token)
//                 ?? throw new Exception(ErrorMessages.Judge0ResultFailed);
//
//             var statusId     = result.Status?.Id ?? 0;
//             var mappedStatus = SubmissionStatusExtensions.FromJudge0Id(statusId);
//
//             if (!mappedStatus.IsTerminal())
//             {
//                 submission.Status = SubmissionStatus.Processing.ToDisplayString();
//                 _submissionRepo.UpdateSubmission(submission);
//                 return submission;
//             }
//
//             // ── Basic fields ──────────────────────────────────────
//             submission.Status       = mappedStatus.ToDisplayString();
//             submission.Output       = DecodeBase64(result.Stdout);
//             submission.ActualOutput = DecodeBase64(result.Stdout)?.Trim();
//             submission.TestInput    = firstTestCase?.Input;
//
//             // ── Wrong Answer — expected vs actual ─────────────────
//             if (mappedStatus == SubmissionStatus.WrongAnswer)
//                 submission.ExpectedOutput = firstTestCase?.ExpectedOutput?.Trim();
//
//             // ── Error parsing ─────────────────────────────────────
//             var compileOutput = DecodeBase64(result.CompileOutput);
//             var stderrOutput  = DecodeBase64(result.Stderr);
//
//             if (!string.IsNullOrWhiteSpace(compileOutput))
//             {
//                 submission.CompileError = compileOutput;
//                 submission.ErrorMessage = compileOutput;
//             }
//             else if (!string.IsNullOrWhiteSpace(stderrOutput))
//             {
//                 submission.RuntimeError = stderrOutput;
//                 submission.ErrorMessage = stderrOutput;
//             }
//
//             // ── Time & Memory ─────────────────────────────────────
//             submission.ExecutionTimeMs = double.TryParse(
//                 result.Time,
//                 System.Globalization.NumberStyles.Any,
//                 System.Globalization.CultureInfo.InvariantCulture,
//                 out var timeValue) ? timeValue * 1000 : 0;
//
//             submission.MemoryUsedMb = (result.Memory ?? 0) / 1024;
//             submission.IsSuccessful = mappedStatus.IsSuccessful();
//
//             if (submission.IsSuccessful)
//             {
//                 var acceptedProblem        = _problemRepo.GetProblemById(submission.ProblemId);
//                 submission.Score           = acceptedProblem?.MaxScore ?? AppConstants.DefaultMaxScore;
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
//             var client  = _httpClientFactory.CreateClient("Judge0");
//             var json    = JsonSerializer.Serialize(request);
//             var content = new StringContent(json, Encoding.UTF8, "application/json");
//
//             var response = await client.PostAsync(JudgeConstants.SubmissionEndpoint, content);
//
//             if (!response.IsSuccessStatusCode)
//             {
//                 var error = await response.Content.ReadAsStringAsync();
//                 throw new Exception($"{ErrorMessages.Judge0SubmissionFailed}: {error}");
//             }
//
//             var responseBody = await response.Content.ReadAsStringAsync();
//             var result       = JsonSerializer.Deserialize<Judge0SubmissionResponse>(
//                 responseBody,
//                 new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
//
//             return result?.Token ?? throw new Exception(ErrorMessages.Judge0TokenNotFound);
//         }
//
//         private async Task<Judge0ResultResponse?> GetResultFromJudge0Async(string token)
//         {
//             var client  = _httpClientFactory.CreateClient("Judge0");
//             var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
//
//             for (int attempt = 0; attempt < AppConstants.Judge0MaxPollingAttempts; attempt++)
//             {
//                 var response = await client.GetAsync(
//                     string.Format(JudgeConstants.ResultEndpoint, token));
//
//                 if (!response.IsSuccessStatusCode)
//                     throw new Exception(ErrorMessages.Judge0ResultFailed);
//
//                 var body   = await response.Content.ReadAsStringAsync();
//                 var result = JsonSerializer.Deserialize<Judge0ResultResponse>(body, options);
//
//                 var statusId = result?.Status?.Id ?? 0;
//                 var status   = SubmissionStatusExtensions.FromJudge0Id(statusId);
//                 if (status.IsTerminal()) return result;
//
//                 await Task.Delay(AppConstants.Judge0PollingDelayMs);
//             }
//
//             throw new Exception(ErrorMessages.Judge0Timeout);
//         }
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
//             try   { return Encoding.UTF8.GetString(Convert.FromBase64String(text)); }
//             catch { return text; }
//         }
//     }
// }

// using System.Text;
// using System.Text.Json;
// using System.Text.Json.Serialization;
// using AlgoMateBackend.Models;
// using AlgoMateBackend.Repositories;
// using AlgoMateBackend.Enums;
// using AlgoMateBackend.Constants; // ← ADDED
//
// namespace AlgoMateBackend.Services
// {
//     public interface ICompilerService
//     {
//         Task<Submission> SubmitCodeAsync(int userId, int problemId, string code, int languageId);
//         Task<Submission> GetSubmissionResultAsync(string judge0Token);
//     }
//
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
//     public class CompilerService : ICompilerService
//     {
//         private readonly IHttpClientFactory _httpClientFactory;
//         private readonly ISubmissionRepository _submissionRepo;
//         private readonly IProblemRepository _problemRepo;
//
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
//         public async Task<Submission> SubmitCodeAsync(
//             int userId,
//             int problemId,
//             string code,
//             int languageId)
//         {
//             if (!ProgrammingLanguageExtensions.IsValid(languageId))
//                 // ← EDITED — ValidationMessages constant use kiya
//                 throw new ArgumentException(ValidationMessages.InvalidLanguageId);
//
//             var problem = _problemRepo.GetProblemById(problemId);
//             if (problem == null)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 throw new Exception(ErrorMessages.ProblemNotFound);
//
//             var testCases = _problemRepo.GetTestCases(problemId).ToList();
//             if (!testCases.Any())
//                 // ← EDITED — ErrorMessages constant use kiya
//                 throw new Exception(ErrorMessages.NoTestCasesFound);
//
//             var submission = new Submission
//             {
//                 UserId = userId,
//                 ProblemId = problemId,
//                 Code = code,
//                 LanguageId = languageId,
//                 Language = ((ProgrammingLanguage)languageId).ToDisplayString(),
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
//             submission.Status = SubmissionStatus.Processing.ToDisplayString();
//             _submissionRepo.UpdateSubmission(submission);
//
//             return submission;
//         }
//
//         public async Task<Submission> GetSubmissionResultAsync(string judge0Token)
//         {
//             var submission = _submissionRepo.GetByJudge0Token(judge0Token)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 ?? throw new Exception(ErrorMessages.Judge0TokenNotFound);
//
//             var result = await GetResultFromJudge0Async(judge0Token)
//                 // ← EDITED — ErrorMessages constant use kiya
//                 ?? throw new Exception(ErrorMessages.Judge0ResultFailed);
//
//             var statusId = result.Status?.Id ?? 0;
//             var mappedStatus = SubmissionStatusExtensions.FromJudge0Id(statusId);
//
//             if (!mappedStatus.IsTerminal())
//             {
//                 submission.Status = SubmissionStatus.Processing.ToDisplayString();
//                 _submissionRepo.UpdateSubmission(submission);
//                 return submission;
//             }
//
//             submission.Status = mappedStatus.ToDisplayString();
//             submission.Output = DecodeBase64(result.Stdout);
//             submission.ErrorMessage = DecodeBase64(result.Stderr)
//                                    ?? DecodeBase64(result.CompileOutput);
//
//             submission.ExecutionTimeMs = double.TryParse(
//                 result.Time,
//                 System.Globalization.NumberStyles.Any,
//                 System.Globalization.CultureInfo.InvariantCulture,
//                 out var timeValue) ? timeValue * 1000 : 0;
//
//             submission.MemoryUsedMb = (result.Memory ?? 0) / 1024;
//             submission.IsSuccessful = mappedStatus.IsSuccessful();
//
//             if (submission.IsSuccessful)
//             {
//                 var acceptedProblem = _problemRepo.GetProblemById(submission.ProblemId);
//                 submission.Score = acceptedProblem?.MaxScore ?? AppConstants.DefaultMaxScore;
//                 submission.TestCasesPassed = submission.TotalTestCases;
//                 _problemRepo.IncrementAcceptedCount(submission.ProblemId);
//             }
//
//             _submissionRepo.UpdateSubmission(submission);
//             return submission;
//         }
//
//         private async Task<string> SubmitToJudge0Async(Judge0SubmissionRequest request)
//         {
//             var client = _httpClientFactory.CreateClient("Judge0");
//
//             var json = JsonSerializer.Serialize(request);
//             var content = new StringContent(json, Encoding.UTF8, "application/json");
//
//             // ← EDITED — JudgeConstants use kiya
//             var response = await client.PostAsync(
//                 JudgeConstants.SubmissionEndpoint,
//                 content
//             );
//
//             if (!response.IsSuccessStatusCode)
//             {
//                 var error = await response.Content.ReadAsStringAsync();
//                 // ← EDITED — ErrorMessages constant use kiya
//                 throw new Exception($"{ErrorMessages.Judge0SubmissionFailed}: {error}");
//             }
//
//             var responseBody = await response.Content.ReadAsStringAsync();
//
//             var result = JsonSerializer.Deserialize<Judge0SubmissionResponse>(
//                 responseBody,
//                 new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
//
//             return result?.Token
//                 ?? throw new Exception(ErrorMessages.Judge0TokenNotFound);
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
//             // ← EDITED — AppConstants use kiya
//             for (int attempt = 0; attempt < AppConstants.Judge0MaxPollingAttempts; attempt++)
//             {
//                 // ← EDITED — JudgeConstants use kiya
//                 var response = await client.GetAsync(
//                     string.Format(JudgeConstants.ResultEndpoint, token)
//                 );
//
//                 if (!response.IsSuccessStatusCode)
//                     // ← EDITED — ErrorMessages constant use kiya
//                     throw new Exception(ErrorMessages.Judge0ResultFailed);
//
//                 var body = await response.Content.ReadAsStringAsync();
//                 var result = JsonSerializer.Deserialize<Judge0ResultResponse>(body, options);
//
//                 var statusId = result?.Status?.Id ?? 0;
//                 var status = SubmissionStatusExtensions.FromJudge0Id(statusId);
//                 if (status.IsTerminal())
//                     return result;
//
//                 // ← EDITED — AppConstants use kiya
//                 await Task.Delay(AppConstants.Judge0PollingDelayMs);
//             }
//
//             // ← EDITED — ErrorMessages constant use kiya
//             throw new Exception(ErrorMessages.Judge0Timeout);
//         }
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
// // using System.Text;
// // using System.Text.Json;
// // using System.Text.Json.Serialization;
// // using AlgoMateBackend.Models;
// // using AlgoMateBackend.Repositories;
// // using AlgoMateBackend.Enums; // ← ADDED
// //
// // namespace AlgoMateBackend.Services
// // {
// //     // =============================================
// //     // INTERFACE
// //     // =============================================
// //     public interface ICompilerService
// //     {
// //         Task<Submission> SubmitCodeAsync(int userId, int problemId, string code, int languageId);
// //         Task<Submission> GetSubmissionResultAsync(string judge0Token);
// //     }
// //
// //     // =============================================
// //     // Judge0 DTOs
// //     // =============================================
// //     public class Judge0SubmissionRequest
// //     {
// //         [JsonPropertyName("source_code")]
// //         public string SourceCode { get; set; } = string.Empty;
// //
// //         [JsonPropertyName("language_id")]
// //         public int LanguageId { get; set; }
// //
// //         [JsonPropertyName("stdin")]
// //         public string? Stdin { get; set; }
// //
// //         [JsonPropertyName("expected_output")]
// //         public string? ExpectedOutput { get; set; }
// //     }
// //
// //     public class Judge0SubmissionResponse
// //     {
// //         [JsonPropertyName("token")]
// //         public string? Token { get; set; }
// //     }
// //
// //     public class Judge0ResultResponse
// //     {
// //         [JsonPropertyName("stdout")]
// //         public string? Stdout { get; set; }
// //
// //         [JsonPropertyName("stderr")]
// //         public string? Stderr { get; set; }
// //
// //         [JsonPropertyName("compile_output")]
// //         public string? CompileOutput { get; set; }
// //
// //         [JsonPropertyName("message")]
// //         public string? Message { get; set; }
// //
// //         // FIX — Judge0 "1.234" string bhejta hai, double nahi
// //         [JsonPropertyName("time")]
// //         public string? Time { get; set; }
// //
// //         [JsonPropertyName("memory")]
// //         public double? Memory { get; set; }
// //
// //         [JsonPropertyName("status")]
// //         public Judge0Status? Status { get; set; }
// //     }
// //
// //     public class Judge0Status
// //     {
// //         [JsonPropertyName("id")]
// //         public int Id { get; set; }
// //
// //         [JsonPropertyName("description")]
// //         public string? Description { get; set; }
// //     }
// //
// //     // =============================================
// //     // COMPILER SERVICE IMPLEMENTATION
// //     // =============================================
// //     public class CompilerService : ICompilerService
// //     {
// //         private readonly IHttpClientFactory _httpClientFactory;
// //         private readonly ISubmissionRepository _submissionRepo;
// //         private readonly IProblemRepository _problemRepo;
// //
// //         // ← EDITED — Constants hata diye, Enum use karega
// //         public CompilerService(
// //             IHttpClientFactory httpClientFactory,
// //             ISubmissionRepository submissionRepo,
// //             IProblemRepository problemRepo)
// //         {
// //             _httpClientFactory = httpClientFactory;
// //             _submissionRepo = submissionRepo;
// //             _problemRepo = problemRepo;
// //         }
// //
// //         // =============================================
// //         // STEP 1 — Submit code to Judge0
// //         // =============================================
// //         public async Task<Submission> SubmitCodeAsync(
// //             int userId,
// //             int problemId,
// //             string code,
// //             int languageId)
// //         {
// //             // ← ADDED — Language validate karo
// //             if (!ProgrammingLanguageExtensions.IsValid(languageId))
// //                 throw new ArgumentException($"Invalid language ID: {languageId}");
// //
// //             var problem = _problemRepo.GetProblemById(problemId);
// //             if (problem == null)
// //                 throw new Exception($"Problem {problemId} not found.");
// //
// //             var testCases = _problemRepo.GetTestCases(problemId).ToList();
// //             if (!testCases.Any())
// //                 throw new Exception("No test cases found for this problem.");
// //
// //             var submission = new Submission
// //             {
// //                 UserId = userId,
// //                 ProblemId = problemId,
// //                 Code = code,
// //                 LanguageId = languageId,
// //                 // ← EDITED — Enum se language name lo
// //                 Language = ((ProgrammingLanguage)languageId).ToDisplayString(),
// //                 // ← EDITED — Enum se status string lo
// //                 Status = SubmissionStatus.Pending.ToDisplayString(),
// //                 TotalTestCases = testCases.Count,
// //                 SubmittedAt = DateTime.UtcNow
// //             };
// //
// //             _submissionRepo.AddSubmission(submission);
// //             _problemRepo.IncrementSubmissionCount(problemId);
// //
// //             var firstTestCase = testCases.First();
// //
// //             var judge0Request = new Judge0SubmissionRequest
// //             {
// //                 SourceCode = EncodeBase64(code),
// //                 LanguageId = languageId,
// //                 Stdin = EncodeBase64(firstTestCase.Input),
// //                 ExpectedOutput = EncodeBase64(firstTestCase.ExpectedOutput)
// //             };
// //
// //             var token = await SubmitToJudge0Async(judge0Request);
// //
// //             submission.Judge0Token = token;
// //             // ← EDITED — Enum se status string lo
// //             submission.Status = SubmissionStatus.Processing.ToDisplayString();
// //             _submissionRepo.UpdateSubmission(submission);
// //
// //             return submission;
// //         }
// //
// //         // =============================================
// //         // STEP 2 — Get result from Judge0
// //         // =============================================
// //         public async Task<Submission> GetSubmissionResultAsync(string judge0Token)
// //         {
// //             var submission = _submissionRepo.GetByJudge0Token(judge0Token)
// //                 ?? throw new Exception($"Submission with token {judge0Token} not found.");
// //
// //             var result = await GetResultFromJudge0Async(judge0Token)
// //                 ?? throw new Exception("Failed to get result from Judge0.");
// //
// //             var statusId = result.Status?.Id ?? 0;
// //
// //             // ← EDITED — Enum se check karo
// //             var mappedStatus = SubmissionStatusExtensions.FromJudge0Id(statusId);
// //
// //             if (!mappedStatus.IsTerminal())
// //             {
// //                 submission.Status = SubmissionStatus.Processing.ToDisplayString();
// //                 _submissionRepo.UpdateSubmission(submission);
// //                 return submission;
// //             }
// //
// //             // ← EDITED — Enum se status string lo
// //             submission.Status = mappedStatus.ToDisplayString();
// //             submission.Output = DecodeBase64(result.Stdout);
// //             submission.ErrorMessage = DecodeBase64(result.Stderr)
// //                                    ?? DecodeBase64(result.CompileOutput);
// //
// //             // FIX — Time string se double mein convert karo
// //             submission.ExecutionTimeMs = double.TryParse(
// //                 result.Time,
// //                 System.Globalization.NumberStyles.Any,
// //                 System.Globalization.CultureInfo.InvariantCulture,
// //                 out var timeValue) ? timeValue * 1000 : 0;
// //
// //             submission.MemoryUsedMb = (result.Memory ?? 0) / 1024;
// //             // ← EDITED — Enum se check karo
// //             submission.IsSuccessful = mappedStatus.IsSuccessful();
// //
// //             if (submission.IsSuccessful)
// //             {
// //                 var acceptedProblem = _problemRepo.GetProblemById(submission.ProblemId);
// //                 submission.Score = acceptedProblem?.MaxScore ?? 100;
// //                 submission.TestCasesPassed = submission.TotalTestCases;
// //                 _problemRepo.IncrementAcceptedCount(submission.ProblemId);
// //             }
// //
// //             _submissionRepo.UpdateSubmission(submission);
// //             return submission;
// //         }
// //
// //         // =============================================
// //         // PRIVATE HELPERS
// //         // =============================================
// //         private async Task<string> SubmitToJudge0Async(Judge0SubmissionRequest request)
// //         {
// //             var client = _httpClientFactory.CreateClient("Judge0");
// //
// //             var json = JsonSerializer.Serialize(request);
// //             var content = new StringContent(json, Encoding.UTF8, "application/json");
// //
// //             var response = await client.PostAsync(
// //                 "submissions?base64_encoded=true&fields=token",
// //                 content
// //             );
// //
// //             if (!response.IsSuccessStatusCode)
// //             {
// //                 var error = await response.Content.ReadAsStringAsync();
// //                 throw new Exception($"Judge0 submission failed: {error}");
// //             }
// //
// //             var responseBody = await response.Content.ReadAsStringAsync();
// //
// //             var result = JsonSerializer.Deserialize<Judge0SubmissionResponse>(
// //                 responseBody,
// //                 new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
// //
// //             return result?.Token
// //                 ?? throw new Exception("Judge0 did not return a token.");
// //         }
// //
// //         private async Task<Judge0ResultResponse?> GetResultFromJudge0Async(string token)
// //         {
// //             var client = _httpClientFactory.CreateClient("Judge0");
// //
// //             var options = new JsonSerializerOptions
// //             {
// //                 PropertyNameCaseInsensitive = true
// //             };
// //
// //             for (int attempt = 0; attempt < 10; attempt++)
// //             {
// //                 var response = await client.GetAsync(
// //                     $"submissions/{token}?base64_encoded=true&fields=stdout,stderr,compile_output,message,time,memory,status"
// //                 );
// //
// //                 if (!response.IsSuccessStatusCode)
// //                     throw new Exception("Failed to fetch result from Judge0.");
// //
// //                 var body = await response.Content.ReadAsStringAsync();
// //                 var result = JsonSerializer.Deserialize<Judge0ResultResponse>(body, options);
// //
// //                 var statusId = result?.Status?.Id ?? 0;
// //
// //                 // ← EDITED — Enum se check karo
// //                 var status = SubmissionStatusExtensions.FromJudge0Id(statusId);
// //                 if (status.IsTerminal())
// //                     return result;
// //
// //                 await Task.Delay(1000);
// //             }
// //
// //             throw new Exception("Judge0 result timeout — try again later.");
// //         }
// //
// //         // ← EDITED — MapJudge0Status aur GetLanguageName methods hata diye
// //         // Enums use kar rahe hain ab
// //
// //         private string EncodeBase64(string text)
// //         {
// //             if (string.IsNullOrEmpty(text)) return string.Empty;
// //             return Convert.ToBase64String(Encoding.UTF8.GetBytes(text));
// //         }
// //
// //         private string? DecodeBase64(string? text)
// //         {
// //             if (string.IsNullOrEmpty(text)) return null;
// //             try
// //             {
// //                 return Encoding.UTF8.GetString(Convert.FromBase64String(text));
// //             }
// //             catch
// //             {
// //                 return text;
// //             }
// //         }
// //     }
// // }
// //
// //
