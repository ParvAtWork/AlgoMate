using System.ComponentModel.DataAnnotations;

namespace AlgoMateBackend.DTOs
{
    public class SignupRequest
    {
        [Required]
        [MaxLength(50)]
        public string Username { get; init; } = string.Empty;

       
    }
}