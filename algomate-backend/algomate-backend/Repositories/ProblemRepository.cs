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

        // ── Problems ─────────────────────────────────────────────

        public IEnumerable<Problem> GetAllProblems() =>
            _context.Problems.Where(p => p.IsActive).ToList();

        public Problem? GetProblemById(int id) =>
            _context.Problems
                .Include(p => p.TestCases)
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
            if (problem == null) return;
            problem.IsActive = false;
            _context.SaveChanges();
        }

        public void IncrementSubmissionCount(int problemId)
        {
            var problem = _context.Problems.Find(problemId);
            if (problem == null) return;
            problem.TotalSubmissions++;
            _context.SaveChanges();
        }

        public void IncrementAcceptedCount(int problemId)
        {
            var problem = _context.Problems.Find(problemId);
            if (problem == null) return;
            problem.AcceptedSubmissions++;
            _context.SaveChanges();
        }

        public int GetTotalProblems() =>
            _context.Problems.Count(p => p.IsActive);

        // ── TestCases ─────────────────────────────────────────────

        public IEnumerable<TestCase> GetTestCases(int problemId) =>
            _context.TestCases
                .Where(t => t.ProblemId == problemId)
                .OrderBy(t => t.Id)
                .ToList();

        public TestCase? GetTestCaseById(int id) =>
            _context.TestCases.Find(id);

        public void AddTestCase(TestCase testCase)
        {
            _context.TestCases.Add(testCase);
            _context.SaveChanges();
        }

        public void UpdateTestCase(TestCase testCase)
        {
            _context.TestCases.Update(testCase);
            _context.SaveChanges();
        }

        public void DeleteTestCase(int testCaseId)
        {
            var tc = _context.TestCases.Find(testCaseId);
            if (tc == null) return;
            _context.TestCases.Remove(tc);
            _context.SaveChanges();
        }

        public void DeleteAllTestCases(int problemId)
        {
            var testCases = _context.TestCases
                .Where(t => t.ProblemId == problemId)
                .ToList();
            if (!testCases.Any()) return;
            _context.TestCases.RemoveRange(testCases);
            _context.SaveChanges();
        }
    }
}