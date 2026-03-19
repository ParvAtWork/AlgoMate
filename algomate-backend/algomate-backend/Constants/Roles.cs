namespace AlgoMateBackend.Constants
{
    /// <summary>
    /// Defines all user roles used across the application.
    /// Used in [Authorize(Roles = "...")] attributes and role validation.
    /// </summary>
    public static class Roles
    {
        /// <summary>Default role assigned to all new users</summary>
        public const string Student = "Student";

        /// <summary>
        /// Full access to all endpoints including user management,
        /// problem management, and leaderboard recalculation
        /// </summary>
        public const string Admin = "Admin";

        /// <summary>
        /// Users with rating >= 2000 who can submit problems for review.
        /// Problems are reviewed before being added to the problem set.
        /// </summary>
        public const string Contributor = "Contributor";

        /// <summary>
        /// Returns all valid roles as an array
        /// </summary>
        public static readonly string[] AllRoles = { Student, Admin, Contributor };

        /// <summary>
        /// Validates if a given role string is valid
        /// </summary>
        /// <param name="role">Role string to validate</param>
        /// <returns>True if valid, false otherwise</returns>
        public static bool IsValid(string role) =>
            AllRoles.Contains(role, StringComparer.OrdinalIgnoreCase);
    }
}