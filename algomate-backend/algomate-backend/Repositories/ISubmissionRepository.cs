using AlgoMateBackend.Models;

namespace AlgoMateBackend.Repositories
{
    public interface ISubmissionRepository
    {
        // Basic — jo already hai
        IEnumerable<Submission> GetAllSubmissions();
        Submission? GetSubmissionById(int id);
        void AddSubmission(Submission submission);

        // YE ADD KARO
        IEnumerable<Submission> GetByUserId(int userId);             // user history
        IEnumerable<Submission> GetByProblemId(int problemId);       // problem submissions
        IEnumerable<Submission> GetByUserAndProblem(int userId, int problemId); // specific
        Submission? GetByJudge0Token(string token);                  // Judge0 result fetch
        IEnumerable<Submission> GetRecentSubmissions(int count);     // dashboard
        bool HasUserSolvedProblem(int userId, int problemId);        // progress check
        void UpdateSubmission(Submission submission);                 // status update after Judge0
        int GetTotalSubmissions();                                   // stats
        int GetAcceptedSubmissions();                                // accepted count
    }
}