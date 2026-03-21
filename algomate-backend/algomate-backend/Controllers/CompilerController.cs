using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoMateBackend.Services;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.DTOs;
using AlgoMateBackend.Enums;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Extensions;
using AlgoMateBackend.Validators;
using System.Text.RegularExpressions;

namespace AlgoMateBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CompilerController : ControllerBase
    {
        private readonly ICompilerService _compilerService;
        private readonly IUserRepository  _userRepo;

        public CompilerController(
            ICompilerService compilerService,
            IUserRepository  userRepo)
        {
            _compilerService = compilerService;
            _userRepo        = userRepo;
        }

        // =============================================
        // POST /api/compiler/submit
        // =============================================
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitCode([FromBody] SubmitCodeDTO request)
        {
            var validation = SubmissionValidator.Validate(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors);

            var supabaseUid = User.GetSupabaseUid();
            if (string.IsNullOrEmpty(supabaseUid))
                return Unauthorized(ErrorMessages.InvalidToken);

            var user = await Task.Run(() => _userRepo.GetBySupabaseUid(supabaseUid));
            if (user == null)
                return NotFound(ErrorMessages.UserNotRegistered);

            var submission = await _compilerService.SubmitCodeAsync(
                user.Id, request.ProblemId, request.Code, request.LanguageId);

            return Ok(new
            {
                message      = "Code submitted successfully.",
                submissionId = submission.Id,
                judge0Token  = submission.Judge0Token,
                status       = SubmissionStatusExtensions.FromJudge0Id(0).ToDisplayString()
            });
        }

        // =============================================
        // GET /api/compiler/result/{token}
        // =============================================
        [HttpGet("result/{token}")]
        public async Task<IActionResult> GetResult(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest(ErrorMessages.Judge0TokenNotFound);

            var submission = await _compilerService.GetSubmissionResultAsync(token);

            // ── Line-wise error parse ─────────────────────────────
            var errorText  = submission.CompileError ?? submission.RuntimeError ?? "";
            var errorLines = ParseErrorLines(errorText, submission.LanguageId);

            var dto = new SubmissionDto
            {
                Id              = submission.Id,
                UserId          = submission.UserId,
                ProblemId       = submission.ProblemId,
                Language        = submission.Language,
                Status          = submission.Status,
                Output          = submission.Output,
                ErrorMessage    = submission.ErrorMessage,
                ExecutionTimeMs = submission.ExecutionTimeMs,
                MemoryUsedMb    = submission.MemoryUsedMb,
                Score           = submission.Score,
                TestCasesPassed = submission.TestCasesPassed,
                TotalTestCases  = submission.TotalTestCases,
                IsSuccessful    = submission.IsSuccessful,
                SubmittedAt     = submission.SubmittedAt,

                // ── LeetCode style fields ─────────────────────────
                TestInput      = submission.TestInput,
                ExpectedOutput = submission.ExpectedOutput,
                ActualOutput   = submission.ActualOutput,
                CompileError   = submission.CompileError,
                RuntimeError   = submission.RuntimeError,
                ErrorLines     = errorLines,
            };

            return Ok(dto);
        }

        // =============================================
        // GET /api/compiler/languages
        // =============================================
        [HttpGet("languages")]
        [AllowAnonymous]
        public IActionResult GetSupportedLanguages()
        {
            var languages = ProgrammingLanguageExtensions.GetAllLanguages();
            return Ok(languages);
        }

        // =============================================
        // PRIVATE — Error line parser
        // =============================================
        private static List<ErrorLineDto> ParseErrorLines(string errorText, int languageId)
        {
            var lines = new List<ErrorLineDto>();
            if (string.IsNullOrWhiteSpace(errorText)) return lines;

            foreach (var line in errorText.Split('\n', StringSplitOptions.RemoveEmptyEntries))
            {
                // ── C++ / C — file.cpp:10:5: error: message ──────
                if (languageId is 54 or 50)
                {
                    var m = Regex.Match(line,
                        @"[^:]+:(\d+):(\d+):\s*(error|warning|note):\s*(.+)");
                    if (m.Success)
                    {
                        lines.Add(new ErrorLineDto
                        {
                            Line    = int.Parse(m.Groups[1].Value),
                            Column  = int.Parse(m.Groups[2].Value),
                            Type    = m.Groups[3].Value,
                            Message = m.Groups[4].Value.Trim(),
                        });
                        continue;
                    }
                }

                // ── Java — Main.java:10: error: message ───────────
                if (languageId == 62)
                {
                    var m = Regex.Match(line,
                        @"[^:]+\.java:(\d+):\s*(error|warning):\s*(.+)");
                    if (m.Success)
                    {
                        lines.Add(new ErrorLineDto
                        {
                            Line    = int.Parse(m.Groups[1].Value),
                            Type    = m.Groups[2].Value,
                            Message = m.Groups[3].Value.Trim(),
                        });
                        continue;
                    }
                }

                // ── Python — line 10 ──────────────────────────────
                if (languageId == 71)
                {
                    var m = Regex.Match(line, @"line (\d+)");
                    if (m.Success)
                    {
                        lines.Add(new ErrorLineDto
                        {
                            Line    = int.Parse(m.Groups[1].Value),
                            Type    = "error",
                            Message = line.Trim(),
                        });
                        continue;
                    }
                }

                // ── JavaScript — :10 ─────────────────────────────
                if (languageId == 63)
                {
                    var m = Regex.Match(line, @":(\d+)$");
                    if (m.Success)
                    {
                        lines.Add(new ErrorLineDto
                        {
                            Line    = int.Parse(m.Groups[1].Value),
                            Type    = "error",
                            Message = line.Trim(),
                        });
                        continue;
                    }
                }

                // ── C# — (10,5): error CS1002: message ───────────
                if (languageId == 51)
                {
                    var m = Regex.Match(line,
                        @"\((\d+),(\d+)\):\s*(error|warning)\s*(CS\d+)?:\s*(.+)");
                    if (m.Success)
                    {
                        lines.Add(new ErrorLineDto
                        {
                            Line    = int.Parse(m.Groups[1].Value),
                            Column  = int.Parse(m.Groups[2].Value),
                            Type    = m.Groups[3].Value,
                            Code    = m.Groups[4].Value,
                            Message = m.Groups[5].Value.Trim(),
                        });
                        continue;
                    }
                }

                // ── Generic fallback ──────────────────────────────
                if (line.Contains("error", StringComparison.OrdinalIgnoreCase))
                {
                    lines.Add(new ErrorLineDto
                    {
                        Line    = 0,
                        Type    = "error",
                        Message = line.Trim(),
                    });
                }
            }

            return lines;
        }
    }
}

// using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.Authorization;
// using AlgoMateBackend.Services;
// using AlgoMateBackend.Repositories;
// using AlgoMateBackend.DTOs;
// using AlgoMateBackend.Enums;
// using AlgoMateBackend.Constants;
// using AlgoMateBackend.Extensions;
// using AlgoMateBackend.Validators; // ← ADDED
//
// namespace AlgoMateBackend.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     [Authorize]
//     public class CompilerController : ControllerBase
//     {
//         private readonly ICompilerService _compilerService;
//         private readonly IUserRepository _userRepo;
//
//         public CompilerController(
//             ICompilerService compilerService,
//             IUserRepository userRepo)
//         {
//             _compilerService = compilerService;
//             _userRepo = userRepo;
//         }
//
//         // POST /api/compiler/submit
//         [HttpPost("submit")]
//         public async Task<IActionResult> SubmitCode([FromBody] SubmitCodeDTO request)
//         {
//             // ← EDITED — SubmissionValidator use kiya
//             var validation = SubmissionValidator.Validate(request);
//             if (!validation.IsValid)
//                 return BadRequest(validation.Errors);
//
//             var supabaseUid = User.GetSupabaseUid();
//
//             if (string.IsNullOrEmpty(supabaseUid))
//                 return Unauthorized(ErrorMessages.InvalidToken);
//
//             var user = await Task.Run(() => _userRepo.GetBySupabaseUid(supabaseUid));
//             if (user == null)
//                 return NotFound(ErrorMessages.UserNotRegistered);
//
//             var submission = await _compilerService.SubmitCodeAsync(
//                 user.Id,
//                 request.ProblemId,
//                 request.Code,
//                 request.LanguageId
//             );
//
//             return Ok(new
//             {
//                 message = "Code submitted successfully.",
//                 submissionId = submission.Id,
//                 judge0Token = submission.Judge0Token,
//                 status = SubmissionStatusExtensions
//                     .FromJudge0Id(0).ToDisplayString()
//             });
//         }
//
//         // GET /api/compiler/result/{token}
//         [HttpGet("result/{token}")]
//         public async Task<IActionResult> GetResult(string token)
//         {
//             if (string.IsNullOrWhiteSpace(token))
//                 return BadRequest(ErrorMessages.Judge0TokenNotFound);
//
//             var submission = await _compilerService.GetSubmissionResultAsync(token);
//
//             var dto = new SubmissionDto
//             {
//                 Id = submission.Id,
//                 UserId = submission.UserId,
//                 ProblemId = submission.ProblemId,
//                 Language = submission.Language,
//                 Status = submission.Status,
//                 Output = submission.Output,
//                 ErrorMessage = submission.ErrorMessage,
//                 ExecutionTimeMs = submission.ExecutionTimeMs,
//                 MemoryUsedMb = submission.MemoryUsedMb,
//                 Score = submission.Score,
//                 TestCasesPassed = submission.TestCasesPassed,
//                 TotalTestCases = submission.TotalTestCases,
//                 IsSuccessful = submission.IsSuccessful,
//                 SubmittedAt = submission.SubmittedAt
//             };
//             return Ok(dto);
//         }
//
//         // GET /api/compiler/languages
//         [HttpGet("languages")]
//         [AllowAnonymous]
//         public IActionResult GetSupportedLanguages()
//         {
//             var languages = ProgrammingLanguageExtensions.GetAllLanguages();
//             return Ok(languages);
//         }
//     }
// }
//
