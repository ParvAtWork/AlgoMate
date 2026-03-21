using AlgoMateBackend.Models;

namespace AlgoMateBackend.Repositories
{
    public interface IProblemRepository
    {
        // ── Problems ─────────────────────────────────────────────
        IEnumerable<Problem>  GetAllProblems();
        Problem?              GetProblemById(int id);
        IEnumerable<Problem>  GetByTopic(string topic);
        IEnumerable<Problem>  GetByDifficulty(string difficulty);
        IEnumerable<Problem>  GetByTopicAndDifficulty(string topic, string difficulty);
        IEnumerable<Problem>  GetActiveProblems();
        void                  AddProblem(Problem problem);
        void                  UpdateProblem(Problem problem);
        void                  DeleteProblem(int id);
        void                  IncrementSubmissionCount(int problemId);
        void                  IncrementAcceptedCount(int problemId);
        int                   GetTotalProblems();

        // ── TestCases ─────────────────────────────────────────────
        IEnumerable<TestCase> GetTestCases(int problemId);
        TestCase?             GetTestCaseById(int id);
        void                  AddTestCase(TestCase testCase);
        void                  UpdateTestCase(TestCase testCase);
        void                  DeleteTestCase(int testCaseId);
        void                  DeleteAllTestCases(int problemId);
    }
}