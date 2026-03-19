using AlgoMateBackend.Models;
using AlgoMateBackend.Repositories;

namespace AlgoMateBackend.Services
{
    // =============================================
    // INTERFACE
    // =============================================
    public interface IRecommendationService
    {
        Task<IEnumerable<Problem>> GetRecommendationsAsync(int userId);
        Task GenerateRecommendationsAsync(int userId);
    }

    // =============================================
    // RECOMMENDATION SERVICE IMPLEMENTATION
    // =============================================
    public class RecommendationService : IRecommendationService
    {
        private readonly IUserRepository _userRepo;
        private readonly IProblemRepository _problemRepo;
        private readonly ISubmissionRepository _submissionRepo;

        public RecommendationService(
            IUserRepository userRepo,
            IProblemRepository problemRepo,
            ISubmissionRepository submissionRepo)
        {
            _userRepo = userRepo;
            _problemRepo = problemRepo;
            _submissionRepo = submissionRepo;
        }

        // =============================================
        // User ke liye recommendations fetch karo
        // =============================================
        public async Task<IEnumerable<Problem>> GetRecommendationsAsync(int userId)
        {
            var user = await Task.Run(() => _userRepo.GetUserById(userId));
            if (user == null)
                return Enumerable.Empty<Problem>();

            // User ka level determine karo rating se
            var difficulty = user.Rating switch
            {
                < 100 => "Easy",
                < 500 => "Medium",
                _ => "Hard"
            };

            // User ke solved problems
            var solvedProblemIds = await Task.Run(() =>
                _submissionRepo.GetByUserId(userId)
                    .Where(s => s.Status == "Accepted")
                    .Select(s => s.ProblemId)
                    .Distinct()
                    .ToList()
            );

            // Unsolved problems recommend karo
            var recommended = await Task.Run(() =>
                _problemRepo.GetByDifficulty(difficulty)
                    .Where(p => !solvedProblemIds.Contains(p.Id))
                    .Take(5)
                    .ToList()
            );

            // Agar recommended problems kam hain
            // toh easy problems bhi add karo
            if (recommended.Count < 3)
            {
                var easyProblems = await Task.Run(() =>
                    _problemRepo.GetByDifficulty("Easy")
                        .Where(p => !solvedProblemIds.Contains(p.Id))
                        .Take(3)
                        .ToList()
                );
                recommended.AddRange(easyProblems);
            }

            return recommended.Distinct().Take(5);
        }

        // =============================================
        // User ke weak topics find karke recommend karo
        // =============================================
        public async Task GenerateRecommendationsAsync(int userId)
        {
            // User ki submissions dekho
            var submissions = await Task.Run(() =>
                _submissionRepo.GetByUserId(userId).ToList());

            if (!submissions.Any()) return;

            // Failed submissions ke topics find karo
            var failedProblemIds = submissions
                .Where(s => s.Status != "Accepted")
                .Select(s => s.ProblemId)
                .Distinct()
                .ToList();

            // Weak topics identify karo
            var weakTopics = new List<string>();
            foreach (var problemId in failedProblemIds)
            {
                var problem = await Task.Run(() =>
                    _problemRepo.GetProblemById(problemId));
                if (problem != null && !weakTopics.Contains(problem.Topic))
                    weakTopics.Add(problem.Topic);
            }

            // Weak topics ke easy problems recommend karo
            foreach (var topic in weakTopics.Take(3))
            {
                await Task.Run(() =>
                    _problemRepo.GetByTopicAndDifficulty(topic, "Easy")
                        .Take(2)
                        .ToList()
                );
            }
        }
    }
}