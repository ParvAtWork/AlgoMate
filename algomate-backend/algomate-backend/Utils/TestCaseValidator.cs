using AlgoMateBackend.Models;

namespace AlgoMateBackend.Utils
{
    // Test case validation aur comparison helper
    public static class TestCaseValidator
    {
        // Actual output expected output se match karta hai?
        public static bool ValidateOutput(
            string? actualOutput,
            string expectedOutput)
        {
            if (actualOutput == null) return false;

            // Whitespace normalize karke compare karo
            var actual = NormalizeOutput(actualOutput);
            var expected = NormalizeOutput(expectedOutput);

            return actual == expected;
        }

        // Saare test cases validate karo
        public static TestCaseResult ValidateAllTestCases(
            IEnumerable<TestCase> testCases,
            IEnumerable<string> actualOutputs)
        {
            var testCaseList = testCases.ToList();
            var outputList = actualOutputs.ToList();

            int passed = 0;
            int total = testCaseList.Count;

            for (int i = 0; i < Math.Min(total, outputList.Count); i++)
            {
                if (ValidateOutput(outputList[i], testCaseList[i].ExpectedOutput))
                    passed++;
            }

            return new TestCaseResult
            {
                TotalTestCases = total,
                TestCasesPassed = passed,
                IsAllPassed = passed == total
            };
        }

        // Code empty toh nahi hai?
        public static bool IsCodeValid(string? code)
        {
            if (string.IsNullOrWhiteSpace(code)) return false;
            if (code.Length < 5) return false;
            return true;
        }

        // Test case input/output valid hai?
        public static bool IsTestCaseValid(TestCase testCase)
        {
            if (testCase == null) return false;
            if (testCase.ProblemId <= 0) return false;
            if (string.IsNullOrWhiteSpace(testCase.ExpectedOutput)) return false;
            return true;
        }

        // Whitespace normalize karo comparison ke liye
        private static string NormalizeOutput(string output)
        {
            return output
                .Trim()
                .Replace("\r\n", "\n")  // Windows line endings
                .Replace("\r", "\n")    // Mac line endings
                .TrimEnd('\n');         // Trailing newline
        }
    }

    // Test case validation result
    public class TestCaseResult
    {
        public int TotalTestCases { get; set; }
        public int TestCasesPassed { get; set; }
        public bool IsAllPassed { get; set; }

        public double PassPercentage => TotalTestCases > 0
            ? Math.Round((double)TestCasesPassed / TotalTestCases * 100, 2)
            : 0;
    }
}