using AlgoMateBackend.Data;
using AlgoMateBackend.Models;

namespace AlgoMateBackend.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AlgoMateDbContext _context;

        public UserRepository(AlgoMateDbContext context)
        {
            _context = context;
        }

        public IEnumerable<User> GetAllUsers() =>
            _context.Users.ToList();

        public User? GetUserById(int id) =>
            _context.Users.FirstOrDefault(u => u.Id == id);

        public User? GetByEmail(string email) =>
            _context.Users.FirstOrDefault(u => u.Email == email);

        public User? GetBySupabaseUid(string supabaseUid) =>
            _context.Users.FirstOrDefault(u => u.SupabaseUid == supabaseUid);

        public bool UserExists(string email) =>
            _context.Users.Any(u => u.Email == email);

        public void AddUser(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
        }

        public void UpdateUser(User user)
        {
            _context.Users.Update(user);
            _context.SaveChanges();
        }

        public void DeleteUser(int id)
        {
            var user = _context.Users.Find(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                _context.SaveChanges();
            }
        }

        public int GetTotalUsers() =>
            _context.Users.Count();

        public IEnumerable<User> GetTopUsersByRating(int count) =>
            _context.Users
                .OrderByDescending(u => u.Rating)
                .Take(count)
                .ToList();

        public User? GetById(int id) =>
            _context.Users.Find(id);
    }
}