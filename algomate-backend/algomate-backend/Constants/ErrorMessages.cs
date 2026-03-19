namespace AlgoMateBackend.Constants
{
    /// <summary>
    /// Centralized error messages used across the application.
    /// Ensures consistent error responses throughout the API.
    /// </summary>
    public static class ErrorMessages
    {
        // =============================================
        // GENERAL
        // =============================================

        /// <summary>Generic not found message</summary>
        public const string NotFound = "Resource not found.";

        /// <summary>Generic unauthorized message</summary>
        public const string Unauthorized = "You are not authorized to perform this action.";

        /// <summary>Generic internal server error message</summary>
        public const string InternalServerError = "An unexpected error occurred. Please try again.";

        /// <summary>Generic bad request message</summary>
        public const string BadRequest = "Invalid request. Please check your input.";

        // =============================================
        // AUTH
        // =============================================

        /// <summary>Invalid or expired JWT token</summary>
        public const string InvalidToken = "Invalid or expired token.";

        /// <summary>Token not found in request</summary>
        public const string TokenNotFound = "Authorization token is required.";

        /// <summary>User not registered in the system</summary>
        public const string UserNotRegistered = "User not found. Please register first.";

        // =============================================
        // USER
        // =============================================

        /// <summary>User not found by ID</summary>
        public const string UserNotFound = "User with the specified ID was not found.";

        /// <summary>Duplicate email address</summary>
        public const string DuplicateEmail = "A user with this email already exists.";

        /// <summary>Duplicate username</summary>
        public const string DuplicateUsername = "This username is already taken.";

        /// <summary>Invalid role specified</summary>
        public const string InvalidRole = "Invalid role. Must be Student or Admin.";

        // =============================================
        // PROBLEM
        // =============================================

        /// <summary>Problem not found by ID</summary>
        public const string ProblemNotFound = "Problem with the specified ID was not found.";

        /// <summary>Problem title is required</summary>
        public const string ProblemTitleRequired = "Problem title is required.";

        /// <summary>Problem topic is required</summary>
        public const string ProblemTopicRequired = "Problem topic is required.";

        /// <summary>Invalid difficulty level</summary>
        public const string InvalidDifficulty = "Difficulty must be Easy, Medium, or Hard.";

        /// <summary>No test cases found for problem</summary>
        public const string NoTestCasesFound = "No test cases found for this problem.";

        // =============================================
        // COMPILER / JUDGE0
        // =============================================

        /// <summary>Invalid programming language ID</summary>
        public const string InvalidLanguageId = "Invalid language ID. Please use a supported language.";

        /// <summary>Code cannot be empty</summary>
        public const string CodeEmpty = "Code cannot be empty.";

        /// <summary>Judge0 submission failed</summary>
        public const string Judge0SubmissionFailed = "Code submission failed. Please try again.";

        /// <summary>Judge0 result fetch failed</summary>
        public const string Judge0ResultFailed = "Failed to fetch result from Judge0.";

        /// <summary>Judge0 result timeout</summary>
        public const string Judge0Timeout = "Judge0 result timeout. Please try again later.";

        /// <summary>Judge0 token not found</summary>
        public const string Judge0TokenNotFound = "Submission token not found.";

        // =============================================
        // SUBMISSION
        // =============================================

        /// <summary>Submission not found by ID</summary>
        public const string SubmissionNotFound = "Submission with the specified ID was not found.";

        /// <summary>Unauthorized submission access</summary>
        public const string SubmissionUnauthorized = "You are not authorized to view this submission.";

        // =============================================
        // LEADERBOARD
        // =============================================

        /// <summary>Invalid leaderboard period</summary>
        public const string InvalidPeriod = "Period must be Weekly, Monthly, or AllTime.";

        /// <summary>No leaderboard entry found</summary>
        public const string LeaderboardEntryNotFound = "No leaderboard entry found. Solve some problems first!";

        // =============================================
        // RATE LIMIT
        // =============================================

        /// <summary>RapidAPI rate limit exceeded</summary>
        public const string RateLimitExceeded = "Rate limit exceeded. Please try again later.";

        /// <summary>Judge0 RapidAPI rate limit exceeded</summary>
        public const string Judge0RateLimitExceeded = "Judge0 rate limit exceeded. Please try again in a few minutes.";
    }
}