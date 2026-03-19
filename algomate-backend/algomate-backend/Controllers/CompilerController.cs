using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoMateBackend.Services;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.DTOs;
using AlgoMateBackend.Enums;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Extensions;
using AlgoMateBackend.Validators; // ← ADDED

namespace AlgoMateBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CompilerController : ControllerBase
    {
        private readonly ICompilerService _compilerService;
        private readonly IUserRepository _userRepo;

        public CompilerController(
            ICompilerService compilerService,
            IUserRepository userRepo)
        {
            _compilerService = compilerService;
            _userRepo = userRepo;
        }

        // POST /api/compiler/submit
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitCode([FromBody] SubmitCodeDTO request)
        {
            // ← EDITED — SubmissionValidator use kiya
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
                user.Id,
                request.ProblemId,
                request.Code,
                request.LanguageId
            );

            return Ok(new
            {
                message = "Code submitted successfully.",
                submissionId = submission.Id,
                judge0Token = submission.Judge0Token,
                status = SubmissionStatusExtensions
                    .FromJudge0Id(0).ToDisplayString()
            });
        }

        // GET /api/compiler/result/{token}
        [HttpGet("result/{token}")]
        public async Task<IActionResult> GetResult(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest(ErrorMessages.Judge0TokenNotFound);

            var submission = await _compilerService.GetSubmissionResultAsync(token);

            var dto = new SubmissionDto
            {
                Id = submission.Id,
                UserId = submission.UserId,
                ProblemId = submission.ProblemId,
                Language = submission.Language,
                Status = submission.Status,
                Output = submission.Output,
                ErrorMessage = submission.ErrorMessage,
                ExecutionTimeMs = submission.ExecutionTimeMs,
                MemoryUsedMb = submission.MemoryUsedMb,
                Score = submission.Score,
                TestCasesPassed = submission.TestCasesPassed,
                TotalTestCases = submission.TotalTestCases,
                IsSuccessful = submission.IsSuccessful,
                SubmittedAt = submission.SubmittedAt
            };
            return Ok(dto);
        }

        // GET /api/compiler/languages
        [HttpGet("languages")]
        [AllowAnonymous]
        public IActionResult GetSupportedLanguages()
        {
            var languages = ProgrammingLanguageExtensions.GetAllLanguages();
            return Ok(languages);
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
// using AlgoMateBackend.Extensions; // ← ADDED
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
//             if (!ModelState.IsValid)
//                 return BadRequest(ModelState);
//
//             if (string.IsNullOrWhiteSpace(request.Code))
//                 return BadRequest(ValidationMessages.CodeRequired);
//
//             if (!ProgrammingLanguageExtensions.IsValid(request.LanguageId))
//                 return BadRequest(ValidationMessages.InvalidLanguageId);
//
//             // ← EDITED — Extension method use kiya
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

// using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.Authorization;
// using AlgoMateBackend.Services;
// using AlgoMateBackend.Repositories;
// using AlgoMateBackend.DTOs;
// using AlgoMateBackend.Enums;
// using AlgoMateBackend.Constants; // ← ADDED
// using System.Security.Claims;
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
//             if (!ModelState.IsValid)
//                 return BadRequest(ModelState);
//
//             if (string.IsNullOrWhiteSpace(request.Code))
//                 // ← EDITED — ValidationMessages constant use kiya
//                 return BadRequest(ValidationMessages.CodeRequired);
//
//             if (!ProgrammingLanguageExtensions.IsValid(request.LanguageId))
//                 // ← EDITED — ValidationMessages constant use kiya
//                 return BadRequest(ValidationMessages.InvalidLanguageId);
//
//             var supabaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
//                            ?? User.FindFirst("sub")?.Value;
//
//             if (string.IsNullOrEmpty(supabaseUid))
//                 // ← EDITED — ErrorMessages constant use kiya
//                 return Unauthorized(ErrorMessages.InvalidToken);
//
//             var user = await Task.Run(() => _userRepo.GetBySupabaseUid(supabaseUid));
//             if (user == null)
//                 // ← EDITED — ErrorMessages constant use kiya
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
//                 // ← EDITED — ErrorMessages constant use kiya
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
//
//
//
//
