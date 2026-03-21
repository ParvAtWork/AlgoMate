using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoMateBackend.Models;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.DTOs;
using AlgoMateBackend.Enums;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Validators;

namespace AlgoMateBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProblemController : ControllerBase
    {
        private readonly IProblemRepository _repo;

        public ProblemController(IProblemRepository repo)
        {
            _repo = repo;
        }

        // GET /api/problem
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllProblems()
        {
            var problems = await Task.Run(() => _repo.GetActiveProblems());
            var dto = problems.Select(p => new ProblemDTO
            {
                Id                  = p.Id,
                Title               = p.Title,
                Description         = p.Description,
                Difficulty          = p.Difficulty,
                Topic               = p.Topic,
                InputFormat         = p.InputFormat,
                OutputFormat        = p.OutputFormat,
                SampleInput         = p.SampleInput,
                SampleOutput        = p.SampleOutput,
                Constraints         = p.Constraints,
                TimeLimitMs         = p.TimeLimitMs,
                MemoryLimitMb       = p.MemoryLimitMb,
                MaxScore            = p.MaxScore,
                TotalSubmissions    = p.TotalSubmissions,
                AcceptedSubmissions = p.AcceptedSubmissions,
                ContributorName     = p.ContributorName,
                Hints               = p.Hints,  // ← ADD
            });
            return Ok(dto);
        }

        // GET /api/problem/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProblemById(int id)
        {
            if (id <= 0)
                return BadRequest(string.Format(ValidationMessages.InvalidId, "problem"));

            var problem = await Task.Run(() => _repo.GetProblemById(id));
            if (problem == null)
                return NotFound(ErrorMessages.ProblemNotFound);

            var dto = new ProblemDTO
            {
                Id                  = problem.Id,
                Title               = problem.Title,
                Description         = problem.Description,
                Difficulty          = problem.Difficulty,
                Topic               = problem.Topic,
                InputFormat         = problem.InputFormat,
                OutputFormat        = problem.OutputFormat,
                SampleInput         = problem.SampleInput,
                SampleOutput        = problem.SampleOutput,
                Constraints         = problem.Constraints,
                TimeLimitMs         = problem.TimeLimitMs,
                MemoryLimitMb       = problem.MemoryLimitMb,
                MaxScore            = problem.MaxScore,
                TotalSubmissions    = problem.TotalSubmissions,
                AcceptedSubmissions = problem.AcceptedSubmissions,
                ContributorName     = problem.ContributorName,
                Hints               = problem.Hints,  // ← ADD
            };
            return Ok(dto);
        }

        // GET /api/problem/topic/{topic}
        [HttpGet("topic/{topic}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByTopic(string topic)
        {
            if (string.IsNullOrWhiteSpace(topic))
                return BadRequest(ValidationMessages.TopicRequired);

            var problems = await Task.Run(() => _repo.GetByTopic(topic));
            var dto = problems.Select(p => new ProblemDTO
            {
                Id                  = p.Id,
                Title               = p.Title,
                Difficulty          = p.Difficulty,
                Topic               = p.Topic,
                MaxScore            = p.MaxScore,
                TotalSubmissions    = p.TotalSubmissions,
                AcceptedSubmissions = p.AcceptedSubmissions,
            });
            return Ok(dto);
        }

        // GET /api/problem/difficulty/{difficulty}
        [HttpGet("difficulty/{difficulty}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByDifficulty(string difficulty)
        {
            if (!DifficultyExtensions.IsValid(difficulty))
                return BadRequest(ValidationMessages.InvalidDifficulty);

            var problems = await Task.Run(() => _repo.GetByDifficulty(difficulty));
            var dto = problems.Select(p => new ProblemDTO
            {
                Id                  = p.Id,
                Title               = p.Title,
                Difficulty          = p.Difficulty,
                Topic               = p.Topic,
                MaxScore            = p.MaxScore,
                TotalSubmissions    = p.TotalSubmissions,
                AcceptedSubmissions = p.AcceptedSubmissions,
            });
            return Ok(dto);
        }

        // GET /api/problem/filter?topic=Arrays&difficulty=Easy
        [HttpGet("filter")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByTopicAndDifficulty(
            [FromQuery] string topic,
            [FromQuery] string difficulty)
        {
            if (string.IsNullOrWhiteSpace(topic) || string.IsNullOrWhiteSpace(difficulty))
                return BadRequest(ValidationMessages.TopicAndDifficultyRequired);

            if (!DifficultyExtensions.IsValid(difficulty))
                return BadRequest(ValidationMessages.InvalidDifficulty);

            var problems = await Task.Run(() =>
                _repo.GetByTopicAndDifficulty(topic, difficulty));
            var dto = problems.Select(p => new ProblemDTO
            {
                Id                  = p.Id,
                Title               = p.Title,
                Difficulty          = p.Difficulty,
                Topic               = p.Topic,
                MaxScore            = p.MaxScore,
                TotalSubmissions    = p.TotalSubmissions,
                AcceptedSubmissions = p.AcceptedSubmissions,
            });
            return Ok(dto);
        }

        // POST /api/problem — Admin only
        [HttpPost]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> AddProblem([FromBody] CreateProblemDTO request)
        {
            var validation = ProblemValidator.Validate(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors);

            var problem = new Problem
            {
                Title           = request.Title,
                Description     = request.Description,
                Difficulty      = request.Difficulty,
                Topic           = request.Topic,
                InputFormat     = request.InputFormat,
                OutputFormat    = request.OutputFormat,
                SampleInput     = request.SampleInput,
                SampleOutput    = request.SampleOutput,
                Constraints     = request.Constraints,
                TimeLimitMs     = request.TimeLimitMs,
                MemoryLimitMb   = request.MemoryLimitMb,
                MaxScore        = request.MaxScore,
                ContributorName = request.ContributorName,
                Hints           = request.Hints,  // ← ADD
                CreatedAt       = DateTime.UtcNow,
                IsActive        = true
            };

            await Task.Run(() => _repo.AddProblem(problem));
            return CreatedAtAction(nameof(GetProblemById),
                new { id = problem.Id }, problem);
        }

        // PUT /api/problem/{id} — Admin only
        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> UpdateProblem(
            int id, [FromBody] CreateProblemDTO request)
        {
            var existing = await Task.Run(() => _repo.GetProblemById(id));
            if (existing == null)
                return NotFound(ErrorMessages.ProblemNotFound);

            var validation = ProblemValidator.Validate(request);
            if (!validation.IsValid)
                return BadRequest(validation.Errors);

            existing.Title           = request.Title;
            existing.Description     = request.Description;
            existing.Difficulty      = request.Difficulty;
            existing.Topic           = request.Topic;
            existing.InputFormat     = request.InputFormat;
            existing.OutputFormat    = request.OutputFormat;
            existing.SampleInput     = request.SampleInput;
            existing.SampleOutput    = request.SampleOutput;
            existing.Constraints     = request.Constraints;
            existing.TimeLimitMs     = request.TimeLimitMs;
            existing.MemoryLimitMb   = request.MemoryLimitMb;
            existing.MaxScore        = request.MaxScore;
            existing.ContributorName = request.ContributorName;
            existing.Hints           = request.Hints;  // ← ADD

            await Task.Run(() => _repo.UpdateProblem(existing));
            return NoContent();
        }

        // DELETE /api/problem/{id} — Admin only
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> DeleteProblem(int id)
        {
            var existing = await Task.Run(() => _repo.GetProblemById(id));
            if (existing == null)
                return NotFound(ErrorMessages.ProblemNotFound);

            await Task.Run(() => _repo.DeleteProblem(id));
            return NoContent();
        }

        // GET /api/problem/{id}/testcases — Admin only
        [HttpGet("{id}/testcases")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetTestCases(int id)
        {
            var testCases = await Task.Run(() => _repo.GetTestCases(id));
            return Ok(testCases);
        }
    }
}

// using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.Authorization;
// using AlgoMateBackend.Models;
// using AlgoMateBackend.Repositories;
// using AlgoMateBackend.DTOs;
// using AlgoMateBackend.Enums;
// using AlgoMateBackend.Constants;
// using AlgoMateBackend.Validators; // ← ADDED
//
// namespace AlgoMateBackend.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     [Authorize]
//     public class ProblemController : ControllerBase
//     {
//         private readonly IProblemRepository _repo;
//
//         public ProblemController(IProblemRepository repo)
//         {
//             _repo = repo;
//         }
//
//         // GET /api/problem
//         [HttpGet]
//         [AllowAnonymous]
//         public async Task<IActionResult> GetAllProblems()
//         {
//             var problems = await Task.Run(() => _repo.GetActiveProblems());
//             var dto = problems.Select(p => new ProblemDTO
//             {
//                 Id = p.Id,
//                 Title = p.Title,
//                 Description = p.Description,
//                 Difficulty = p.Difficulty,
//                 Topic = p.Topic,
//                 InputFormat = p.InputFormat,
//                 OutputFormat = p.OutputFormat,
//                 SampleInput = p.SampleInput,
//                 SampleOutput = p.SampleOutput,
//                 Constraints = p.Constraints,
//                 TimeLimitMs = p.TimeLimitMs,
//                 MemoryLimitMb = p.MemoryLimitMb,
//                 MaxScore = p.MaxScore,
//                 TotalSubmissions = p.TotalSubmissions,
//                 AcceptedSubmissions = p.AcceptedSubmissions,
//                 ContributorName = p.ContributorName
//             });
//             return Ok(dto);
//         }
//
//         // GET /api/problem/{id}
//         [HttpGet("{id}")]
//         [AllowAnonymous]
//         public async Task<IActionResult> GetProblemById(int id)
//         {
//             if (id <= 0)
//                 return BadRequest(string.Format(ValidationMessages.InvalidId, "problem"));
//
//             var problem = await Task.Run(() => _repo.GetProblemById(id));
//             if (problem == null)
//                 return NotFound(ErrorMessages.ProblemNotFound);
//
//             var dto = new ProblemDTO
//             {
//                 Id = problem.Id,
//                 Title = problem.Title,
//                 Description = problem.Description,
//                 Difficulty = problem.Difficulty,
//                 Topic = problem.Topic,
//                 InputFormat = problem.InputFormat,
//                 OutputFormat = problem.OutputFormat,
//                 SampleInput = problem.SampleInput,
//                 SampleOutput = problem.SampleOutput,
//                 Constraints = problem.Constraints,
//                 TimeLimitMs = problem.TimeLimitMs,
//                 MemoryLimitMb = problem.MemoryLimitMb,
//                 MaxScore = problem.MaxScore,
//                 TotalSubmissions = problem.TotalSubmissions,
//                 AcceptedSubmissions = problem.AcceptedSubmissions,
//                 ContributorName = problem.ContributorName
//             };
//             return Ok(dto);
//         }
//
//         // GET /api/problem/topic/{topic}
//         [HttpGet("topic/{topic}")]
//         [AllowAnonymous]
//         public async Task<IActionResult> GetByTopic(string topic)
//         {
//             if (string.IsNullOrWhiteSpace(topic))
//                 return BadRequest(ValidationMessages.TopicRequired);
//
//             var problems = await Task.Run(() => _repo.GetByTopic(topic));
//             var dto = problems.Select(p => new ProblemDTO
//             {
//                 Id = p.Id,
//                 Title = p.Title,
//                 Difficulty = p.Difficulty,
//                 Topic = p.Topic,
//                 MaxScore = p.MaxScore,
//                 TotalSubmissions = p.TotalSubmissions,
//                 AcceptedSubmissions = p.AcceptedSubmissions
//             });
//             return Ok(dto);
//         }
//
//         // GET /api/problem/difficulty/{difficulty}
//         [HttpGet("difficulty/{difficulty}")]
//         [AllowAnonymous]
//         public async Task<IActionResult> GetByDifficulty(string difficulty)
//         {
//             if (!DifficultyExtensions.IsValid(difficulty))
//                 return BadRequest(ValidationMessages.InvalidDifficulty);
//
//             var problems = await Task.Run(() => _repo.GetByDifficulty(difficulty));
//             var dto = problems.Select(p => new ProblemDTO
//             {
//                 Id = p.Id,
//                 Title = p.Title,
//                 Difficulty = p.Difficulty,
//                 Topic = p.Topic,
//                 MaxScore = p.MaxScore,
//                 TotalSubmissions = p.TotalSubmissions,
//                 AcceptedSubmissions = p.AcceptedSubmissions
//             });
//             return Ok(dto);
//         }
//
//         // GET /api/problem/filter?topic=Arrays&difficulty=Easy
//         [HttpGet("filter")]
//         [AllowAnonymous]
//         public async Task<IActionResult> GetByTopicAndDifficulty(
//             [FromQuery] string topic,
//             [FromQuery] string difficulty)
//         {
//             if (string.IsNullOrWhiteSpace(topic) || string.IsNullOrWhiteSpace(difficulty))
//                 return BadRequest(ValidationMessages.TopicAndDifficultyRequired);
//
//             if (!DifficultyExtensions.IsValid(difficulty))
//                 return BadRequest(ValidationMessages.InvalidDifficulty);
//
//             var problems = await Task.Run(() =>
//                 _repo.GetByTopicAndDifficulty(topic, difficulty));
//             var dto = problems.Select(p => new ProblemDTO
//             {
//                 Id = p.Id,
//                 Title = p.Title,
//                 Difficulty = p.Difficulty,
//                 Topic = p.Topic,
//                 MaxScore = p.MaxScore,
//                 TotalSubmissions = p.TotalSubmissions,
//                 AcceptedSubmissions = p.AcceptedSubmissions
//             });
//             return Ok(dto);
//         }
//
//         // POST /api/problem — Admin only
//         [HttpPost]
//         [Authorize(Roles = Roles.Admin)]
//         public async Task<IActionResult> AddProblem([FromBody] CreateProblemDTO request)
//         {
//             // ← EDITED — ProblemValidator use kiya
//             var validation = ProblemValidator.Validate(request);
//             if (!validation.IsValid)
//                 return BadRequest(validation.Errors);
//
//             var problem = new Problem
//             {
//                 Title = request.Title,
//                 Description = request.Description,
//                 Difficulty = request.Difficulty,
//                 Topic = request.Topic,
//                 InputFormat = request.InputFormat,
//                 OutputFormat = request.OutputFormat,
//                 SampleInput = request.SampleInput,
//                 SampleOutput = request.SampleOutput,
//                 Constraints = request.Constraints,
//                 TimeLimitMs = request.TimeLimitMs,
//                 MemoryLimitMb = request.MemoryLimitMb,
//                 MaxScore = request.MaxScore,
//                 ContributorName = request.ContributorName,
//                 CreatedAt = DateTime.UtcNow,
//                 IsActive = true
//             };
//
//             await Task.Run(() => _repo.AddProblem(problem));
//             return CreatedAtAction(nameof(GetProblemById),
//                 new { id = problem.Id }, problem);
//         }
//
//         // PUT /api/problem/{id} — Admin only
//         [HttpPut("{id}")]
//         [Authorize(Roles = Roles.Admin)]
//         public async Task<IActionResult> UpdateProblem(
//             int id, [FromBody] CreateProblemDTO request)
//         {
//             var existing = await Task.Run(() => _repo.GetProblemById(id));
//             if (existing == null)
//                 return NotFound(ErrorMessages.ProblemNotFound);
//
//             // ← EDITED — ProblemValidator use kiya
//             var validation = ProblemValidator.Validate(request);
//             if (!validation.IsValid)
//                 return BadRequest(validation.Errors);
//
//             existing.Title = request.Title;
//             existing.Description = request.Description;
//             existing.Difficulty = request.Difficulty;
//             existing.Topic = request.Topic;
//             existing.InputFormat = request.InputFormat;
//             existing.OutputFormat = request.OutputFormat;
//             existing.SampleInput = request.SampleInput;
//             existing.SampleOutput = request.SampleOutput;
//             existing.Constraints = request.Constraints;
//             existing.TimeLimitMs = request.TimeLimitMs;
//             existing.MemoryLimitMb = request.MemoryLimitMb;
//             existing.MaxScore = request.MaxScore;
//             existing.ContributorName = request.ContributorName;
//
//             await Task.Run(() => _repo.UpdateProblem(existing));
//             return NoContent();
//         }
//
//         // DELETE /api/problem/{id} — Admin only
//         [HttpDelete("{id}")]
//         [Authorize(Roles = Roles.Admin)]
//         public async Task<IActionResult> DeleteProblem(int id)
//         {
//             var existing = await Task.Run(() => _repo.GetProblemById(id));
//             if (existing == null)
//                 return NotFound(ErrorMessages.ProblemNotFound);
//
//             await Task.Run(() => _repo.DeleteProblem(id));
//             return NoContent();
//         }
//
//         // GET /api/problem/{id}/testcases — Admin only
//         [HttpGet("{id}/testcases")]
//         [Authorize(Roles = Roles.Admin)]
//         public async Task<IActionResult> GetTestCases(int id)
//         {
//             var testCases = await Task.Run(() => _repo.GetTestCases(id));
//             return Ok(testCases);
//         }
//     }
// }
//
//
