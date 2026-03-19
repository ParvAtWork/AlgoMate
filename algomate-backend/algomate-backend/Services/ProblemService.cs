using AlgoMateBackend.Models;
using AlgoMateBackend.Repositories;

namespace AlgoMateBackend.Services
{
    // =============================================
    // INTERFACE
    // =============================================
    public interface IProblemService
    {
        Task<IEnumerable<Problem>> GetAllProblemsAsync();
        Task<Problem?> GetProblemByIdAsync(int id);
        Task<IEnumerable<Problem>> GetByTopicAsync(string topic);
        Task<IEnumerable<Problem>> GetByDifficultyAsync(string difficulty);
        Task<IEnumerable<Problem>> GetByTopicAndDifficultyAsync(string topic, string difficulty);
        Task<Problem> AddProblemAsync(Problem problem);
        Task UpdateProblemAsync(Problem problem);
        Task DeleteProblemAsync(int id);
        Task<ProblemStats> GetProblemStatsAsync();
    }

    // Stats DTO
    public class ProblemStats
    {
        public int TotalProblems { get; set; }
        public int EasyCount { get; set; }
        public int MediumCount { get; set; }
        public int HardCount { get; set; }
        public Dictionary<string, int> TopicWiseCount { get; set; } = new();
    }

    // =============================================
    // PROBLEM SERVICE IMPLEMENTATION
    // =============================================
    public class ProblemService : IProblemService
    {
        private readonly IProblemRepository _repo;

        public ProblemService(IProblemRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<Problem>> GetAllProblemsAsync() =>
            await Task.Run(() => _repo.GetActiveProblems());

        public async Task<Problem?> GetProblemByIdAsync(int id) =>
            await Task.Run(() => _repo.GetProblemById(id));

        public async Task<IEnumerable<Problem>> GetByTopicAsync(string topic) =>
            await Task.Run(() => _repo.GetByTopic(topic));

        public async Task<IEnumerable<Problem>> GetByDifficultyAsync(string difficulty) =>
            await Task.Run(() => _repo.GetByDifficulty(difficulty));

        public async Task<IEnumerable<Problem>> GetByTopicAndDifficultyAsync(
            string topic, string difficulty) =>
            await Task.Run(() => _repo.GetByTopicAndDifficulty(topic, difficulty));

        public async Task<Problem> AddProblemAsync(Problem problem)
        {
            problem.CreatedAt = DateTime.UtcNow;
            problem.IsActive = true;
            await Task.Run(() => _repo.AddProblem(problem));
            return problem;
        }

        public async Task UpdateProblemAsync(Problem problem) =>
            await Task.Run(() => _repo.UpdateProblem(problem));

        public async Task DeleteProblemAsync(int id) =>
            await Task.Run(() => _repo.DeleteProblem(id));

        public async Task<ProblemStats> GetProblemStatsAsync()
        {
            var problems = await Task.Run(() => _repo.GetActiveProblems().ToList());

            return new ProblemStats
            {
                TotalProblems = problems.Count,
                EasyCount = problems.Count(p => p.Difficulty == "Easy"),
                MediumCount = problems.Count(p => p.Difficulty == "Medium"),
                HardCount = problems.Count(p => p.Difficulty == "Hard"),
                TopicWiseCount = problems
                    .GroupBy(p => p.Topic)
                    .ToDictionary(g => g.Key, g => g.Count())
            };
        }
    }
}