using AlgoMateBackend.Data;
using AlgoMateBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AlgoMateBackend.Repositories
{
    public class SubmissionRepository : ISubmissionRepository
    {
        private readonly AlgoMateDbContext _context;

        public SubmissionRepository(AlgoMateDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Submission> GetAllSubmissions() =>
            _context.Submissions.ToList();

        public Submission? GetSubmissionById(int id) =>
            _context.Submissions.FirstOrDefault(s => s.Id == id);

        public IEnumerable<Submission> GetByUserId(int userId) =>
            _context.Submissions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.SubmittedAt)
                .ToList();

        public IEnumerable<Submission> GetByProblemId(int problemId) =>
            _context.Submissions
                .Where(s => s.ProblemId == problemId)
                .OrderByDescending(s => s.SubmittedAt)
                .ToList();

        public IEnumerable<Submission> GetByUserAndProblem(int userId, int problemId) =>
            _context.Submissions
                .Where(s => s.UserId == userId && s.ProblemId == problemId)
                .OrderByDescending(s => s.SubmittedAt)
                .ToList();

        public Submission? GetByJudge0Token(string token) =>
            _context.Submissions
                .FirstOrDefault(s => s.Judge0Token == token);

        public IEnumerable<Submission> GetRecentSubmissions(int count) =>
            _context.Submissions
                .OrderByDescending(s => s.SubmittedAt)
                .Take(count)
                .ToList();

        public bool HasUserSolvedProblem(int userId, int problemId) =>
            _context.Submissions
                .Any(s => s.UserId == userId &&
                          s.ProblemId == problemId &&
                          s.Status == "Accepted");

        public void AddSubmission(Submission submission)
        {
            _context.Submissions.Add(submission);
            _context.SaveChanges();
        }

        public void UpdateSubmission(Submission submission)
        {
            _context.Submissions.Update(submission);
            _context.SaveChanges();
        }

        public int GetTotalSubmissions() =>
            _context.Submissions.Count();

        public int GetAcceptedSubmissions() =>
            _context.Submissions.Count(s => s.Status == "Accepted");
    }
}