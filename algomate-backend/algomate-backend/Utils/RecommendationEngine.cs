using AlgoMateBackend.Models;

namespace AlgoMateBackend.Utils
{
    // Recommendation logic helper
    public static class RecommendationEngine
    {
        // User ka level rating se determine karo
        public static string GetUserLevel(int rating) => rating switch
        {
            < 100 => "Beginner",
            < 300 => "Easy",
            < 700 => "Medium",
            _ => "Hard"
        };

        // User ka badge determine karo
        public static string GetUserBadge(int problemsSolved) => problemsSolved switch
        {
            < 5 => "Newbie",
            < 20 => "Beginner",
            < 50 => "Intermediate",
            < 100 => "Advanced",
            < 200 => "Expert",
            _ => "Master"
        };

        // Weak topics find karo failed submissions se
        public static IEnumerable<string> GetWeakTopics(
            IEnumerable<Submission> submissions,
            IEnumerable<Problem> problems)
        {
            var submissionList = submissions.ToList();
            var problemList = problems.ToList();

            // Failed submission ke problem IDs
            var failedProblemIds = submissionList
                .Where(s => s.Status != "Accepted")
                .Select(s => s.ProblemId)
                .Distinct()
                .ToList();

            // Solved problem IDs
            var solvedProblemIds = submissionList
                .Where(s => s.Status == "Accepted")
                .Select(s => s.ProblemId)
                .Distinct()
                .ToList();

            // Failed but not solved = weak topics
            var weakProblemIds = failedProblemIds
                .Except(solvedProblemIds)
                .ToList();

            return problemList
                .Where(p => weakProblemIds.Contains(p.Id))
                .Select(p => p.Topic)
                .Distinct()
                .ToList();
        }

        // Problems filter karo — already solved wale hata do
        public static IEnumerable<Problem> FilterUnsolvedProblems(
            IEnumerable<Problem> problems,
            IEnumerable<Submission> submissions)
        {
            var solvedProblemIds = submissions
                .Where(s => s.Status == "Accepted")
                .Select(s => s.ProblemId)
                .Distinct()
                .ToHashSet();

            return problems
                .Where(p => !solvedProblemIds.Contains(p.Id))
                .ToList();
        }

        // Score calculate karo difficulty ke hisaab se
        public static int CalculateScore(string difficulty, double executionTimeMs) =>
            difficulty switch
            {
                "Easy" => executionTimeMs < 500 ? 100 : 80,
                "Medium" => executionTimeMs < 1000 ? 200 : 150,
                "Hard" => executionTimeMs < 2000 ? 300 : 250,
                _ => 50
            };

        // Accuracy percent calculate karo
        public static double CalculateAccuracy(
            int totalSubmissions,
            int acceptedSubmissions)
        {
            if (totalSubmissions == 0) return 0;
            return Math.Round(
                (double)acceptedSubmissions / totalSubmissions * 100, 2);
        }
    }
}