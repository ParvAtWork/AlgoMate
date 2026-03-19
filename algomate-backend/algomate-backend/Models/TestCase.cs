using System.ComponentModel.DataAnnotations;

namespace AlgoMateBackend.Models
{
    public class TestCase
    {
        public int Id { get; set; }

        public int ProblemId { get; set; }

        [MaxLength(10000)]
        public string Input { get; set; } = string.Empty;

        [MaxLength(10000)]
        public string ExpectedOutput { get; set; } = string.Empty;

        public bool IsHidden { get; set; } = true;   // hidden = students ko nahi dikhega
        public int Points { get; set; } = 10;         // is test case ke points

        // Navigation property
        public Problem? Problem { get; set; }
    }
}