namespace AlgoMateBackend.Constants
{
    /// <summary>
    /// Application-wide constants used across services and controllers.
    /// Centralizes magic numbers and configuration values.
    /// </summary>
    public static class AppConstants
    {
        // =============================================
        // CODE SUBMISSION LIMITS
        // =============================================

        /// <summary>Maximum allowed code length in characters (50KB)</summary>
        public const int MaxCodeLength = 50000;

        /// <summary>Maximum number of test cases per problem</summary>
        public const int MaxTestCasesPerProblem = 100;

        /// <summary>Default time limit for code execution in milliseconds</summary>
        public const int DefaultTimeLimitMs = 2000;

        /// <summary>Default memory limit for code execution in megabytes</summary>
        public const int DefaultMemoryLimitMb = 256;

        /// <summary>Default maximum score for a problem</summary>
        public const int DefaultMaxScore = 100;

        // =============================================
        // LEADERBOARD LIMITS
        // =============================================

        /// <summary>Default number of top rankers to return</summary>
        public const int DefaultLeaderboardCount = 20;

        /// <summary>Maximum number of rankers that can be returned</summary>
        public const int MaxLeaderboardCount = 100;

        // =============================================
        // PAGINATION
        // =============================================

        /// <summary>Default page size for paginated results</summary>
        public const int DefaultPageSize = 20;

        /// <summary>Maximum page size for paginated results</summary>
        public const int MaxPageSize = 100;

        // =============================================
        // USER RATING
        // =============================================

        /// <summary>Minimum rating required to become a Problem Contributor</summary>
        public const int ContributorMinRating = 2000;

        /// <summary>Default rating for new users</summary>
        public const int DefaultUserRating = 0;

        // =============================================
        // JUDGE0 POLLING
        // =============================================

        /// <summary>Maximum number of polling attempts for Judge0 result</summary>
        public const int Judge0MaxPollingAttempts = 10;

        /// <summary>Delay between Judge0 polling attempts in milliseconds</summary>
        public const int Judge0PollingDelayMs = 1000;

        // =============================================
        // CORS
        // =============================================

        /// <summary>Default frontend origin for development</summary>
        public const string DefaultFrontendOrigin = "http://localhost:3000";

        /// <summary>CORS policy name</summary>
        public const string CorsPolicyName = "FrontendPolicy";
    }
}