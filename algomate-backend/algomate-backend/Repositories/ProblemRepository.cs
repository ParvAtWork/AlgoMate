using AlgoMateBackend.Data;
using AlgoMateBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AlgoMateBackend.Repositories
{
    public class ProblemRepository : IProblemRepository
    {
        private readonly AlgoMateDbContext _context;

        public ProblemRepository(AlgoMateDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Problem> GetAllProblems() =>
            _context.Problems.ToList();

        public Problem? GetProblemById(int id) =>
            _context.Problems
                .Include(p => p.TestCases)  // test cases bhi load karo
                .FirstOrDefault(p => p.Id == id);

        public IEnumerable<Problem> GetByTopic(string topic) =>
            _context.Problems
                .Where(p => p.Topic == topic && p.IsActive)
                .ToList();

        public IEnumerable<Problem> GetByDifficulty(string difficulty) =>
            _context.Problems
                .Where(p => p.Difficulty == difficulty && p.IsActive)
                .ToList();

        public IEnumerable<Problem> GetByTopicAndDifficulty(string topic, string difficulty) =>
            _context.Problems
                .Where(p => p.Topic == topic &&
                            p.Difficulty == difficulty &&
                            p.IsActive)
                .ToList();

        public IEnumerable<Problem> GetActiveProblems() =>
            _context.Problems
                .Where(p => p.IsActive)
                .ToList();

        public IEnumerable<TestCase> GetTestCases(int problemId) =>
            _context.TestCases
                .Where(t => t.ProblemId == problemId)
                .ToList();

        public void AddProblem(Problem problem)
        {
            _context.Problems.Add(problem);
            _context.SaveChanges();
        }

        public void UpdateProblem(Problem problem)
        {
            _context.Problems.Update(problem);
            _context.SaveChanges();
        }

        public void DeleteProblem(int id)
        {
            var problem = _context.Problems.Find(id);
            if (problem != null)
            {
                problem.IsActive = false; // soft delete
                _context.SaveChanges();
            }
        }

        public void IncrementSubmissionCount(int problemId)
        {
            var problem = _context.Problems.Find(problemId);
            if (problem != null)
            {
                problem.TotalSubmissions++;
                _context.SaveChanges();
            }
        }

        public void IncrementAcceptedCount(int problemId)
        {
            var problem = _context.Problems.Find(problemId);
            if (problem != null)
            {
                problem.AcceptedSubmissions++;
                _context.SaveChanges();
            }
        }

        public int GetTotalProblems() =>
            _context.Problems.Count(p => p.IsActive);
    }
}