using AlgoMateBackend.Models;
using Microsoft.EntityFrameworkCore;


namespace AlgoMateBackend.Data
{
    public class AlgoMateDbContext : DbContext
    {
        public AlgoMateDbContext(DbContextOptions<AlgoMateDbContext> options)
            : base(options)
        {
        }

        // =============================================
        // DB SETS — saari tables
        // =============================================
        public DbSet<User> Users { get; set; }
        public DbSet<Problem> Problems { get; set; }
        public DbSet<Submission> Submissions { get; set; }
        public DbSet<Leaderboard> Leaderboards { get; set; }
        public DbSet<TestCase> TestCases { get; set; }
        public DbSet<Recommendation> Recommendations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // =============================================
            // USER TABLE CONFIGURATION
            // =============================================
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);

                entity.Property(u => u.Username)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(u => u.SupabaseUid)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(u => u.Role)
                    .HasMaxLength(20)
                    .HasDefaultValue("Student");

                entity.Property(u => u.CreatedAt)
                    .HasDefaultValueSql("NOW()");

                // Unique constraints — duplicate emails nahi hone chahiye
                entity.HasIndex(u => u.Email).IsUnique();
                entity.HasIndex(u => u.SupabaseUid).IsUnique();
                entity.HasIndex(u => u.Username).IsUnique();

                // Relationships
                entity.HasMany(u => u.Submissions)
                    .WithOne(s => s.User)
                    .HasForeignKey(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.LeaderboardEntries)
                    .WithOne(l => l.User)
                    .HasForeignKey(l => l.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // =============================================
            // PROBLEM TABLE CONFIGURATION
            // =============================================
            modelBuilder.Entity<Problem>(entity =>
            {
                entity.HasKey(p => p.Id);

                entity.Property(p => p.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(p => p.Difficulty)
                    .IsRequired()
                    .HasMaxLength(10)
                    .HasDefaultValue("Easy");

                entity.Property(p => p.Topic)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(p => p.IsActive)
                    .HasDefaultValue(true);

                entity.Property(p => p.TimeLimitMs)
                    .HasDefaultValue(2000);

                entity.Property(p => p.MemoryLimitMb)
                    .HasDefaultValue(256);

                entity.Property(p => p.CreatedAt)
                    .HasDefaultValueSql("NOW()");

                // Index for fast filtering
                entity.HasIndex(p => p.Topic);
                entity.HasIndex(p => p.Difficulty);
                entity.HasIndex(p => new { p.Topic, p.Difficulty }); // compound index

                // Relationships
                entity.HasMany(p => p.TestCases)
                    .WithOne(t => t.Problem)
                    .HasForeignKey(t => t.ProblemId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(p => p.Submissions)
                    .WithOne(s => s.Problem)
                    .HasForeignKey(s => s.ProblemId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // =============================================
            // SUBMISSION TABLE CONFIGURATION
            // =============================================
            modelBuilder.Entity<Submission>(entity =>
            {
                entity.HasKey(s => s.Id);

                entity.Property(s => s.Status)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasDefaultValue("Pending");

                entity.Property(s => s.Language)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(s => s.SubmittedAt)
                    .HasDefaultValueSql("NOW()");

                // Index for fast user history fetch
                entity.HasIndex(s => s.UserId);
                entity.HasIndex(s => s.ProblemId);
                entity.HasIndex(s => s.Judge0Token);
                entity.HasIndex(s => new { s.UserId, s.ProblemId }); // compound index
            });

            // =============================================
            // TESTCASE TABLE CONFIGURATION
            // =============================================
            modelBuilder.Entity<TestCase>(entity =>
            {
                entity.HasKey(t => t.Id);

                entity.Property(t => t.IsHidden)
                    .HasDefaultValue(true);

                entity.Property(t => t.Points)
                    .HasDefaultValue(10);

                entity.HasIndex(t => t.ProblemId);
            });

            // =============================================
            // LEADERBOARD TABLE CONFIGURATION
            // =============================================
            modelBuilder.Entity<Leaderboard>(entity =>
            {
                entity.HasKey(l => l.Id);

                entity.Property(l => l.Period)
                    .IsRequired()
                    .HasMaxLength(20)
                    .HasDefaultValue("AllTime");

                entity.Property(l => l.LastUpdated)
                    .HasDefaultValueSql("NOW()");

                entity.HasIndex(l => l.UserId);
                entity.HasIndex(l => l.Period);
                entity.HasIndex(l => new { l.UserId, l.Period }).IsUnique(); // ek user ek period mein ek hi entry
            });

            // =============================================
            // RECOMMENDATION TABLE CONFIGURATION
            // =============================================
            modelBuilder.Entity<Recommendation>(entity =>
            {
                entity.HasKey(r => r.Id);

                entity.Property(r => r.Reason)
                    .HasMaxLength(100);

                entity.Property(r => r.IsCompleted)
                    .HasDefaultValue(false);

                entity.Property(r => r.CreatedAt)
                    .HasDefaultValueSql("NOW()");

                entity.HasIndex(r => r.UserId);
                entity.HasIndex(r => new { r.UserId, r.ProblemId });

                // Relationships
                entity.HasOne(r => r.User)
                    .WithMany()
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Problem)
                    .WithMany()
                    .HasForeignKey(r => r.ProblemId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}