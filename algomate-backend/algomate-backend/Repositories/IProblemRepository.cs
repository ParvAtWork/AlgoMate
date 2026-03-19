using AlgoMateBackend.Models;

namespace AlgoMateBackend.Repositories
{
    public interface IProblemRepository
    {
        // Basic — jo already hai
        IEnumerable<Problem> GetAllProblems();
        Problem? GetProblemById(int id);
        void AddProblem(Problem problem);

        // YE ADD KARO
        IEnumerable<Problem> GetByTopic(string topic);           // Arrays/Trees filter
        IEnumerable<Problem> GetByDifficulty(string difficulty); // Easy/Medium/Hard filter
        IEnumerable<Problem> GetByTopicAndDifficulty(string topic, string difficulty);
        IEnumerable<Problem> GetActiveProblems();                // sirf visible problems
        IEnumerable<TestCase> GetTestCases(int problemId);       // test cases fetch
        void UpdateProblem(Problem problem);                     // edit problem
        void DeleteProblem(int id);                              // remove problem
        void IncrementSubmissionCount(int problemId);            // submission count update
        void IncrementAcceptedCount(int problemId);              // accepted count update
        int GetTotalProblems();                                  // stats ke liye
    }
}