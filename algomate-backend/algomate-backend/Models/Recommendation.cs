using System.ComponentModel.DataAnnotations;

namespace AlgoMateBackend.Models
{
    public class Recommendation
    {
        public int Id { get; set; }

        public int UserId { get; set; }         // kis user ke liye
        public int ProblemId { get; set; }      // kaunsa problem recommend kiya

        [MaxLength(100)]
        public string Reason { get; set; } = string.Empty;  // "Weak in Trees", "Try Medium" etc

        public bool IsCompleted { get; set; } = false;       // kiya ya nahi
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? User { get; set; }
        public Problem? Problem { get; set; }
    }
}