using AlgoMateBackend.Models;

namespace AlgoMateBackend.Repositories
{
    public interface IUserRepository
    {
        // Basic — jo already hai
        IEnumerable<User> GetAllUsers();
        User? GetUserById(int id);
        User? GetByEmail(string email);
        void AddUser(User user);

        // YE ADD KARO
        User? GetBySupabaseUid(string supabaseUid);     // Supabase auth se match karne ke liye
        bool UserExists(string email);                   // duplicate check
        void UpdateUser(User user);                      // profile update
        void DeleteUser(int id);                         // account delete
        int GetTotalUsers();                             // admin dashboard
        IEnumerable<User> GetTopUsersByRating(int count); // leaderboard ke liye
    }
}