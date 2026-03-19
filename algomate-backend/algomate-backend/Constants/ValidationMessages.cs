namespace AlgoMateBackend.Constants
{
    /// <summary>
    /// Centralized validation messages used in controllers and validators.
    /// Ensures consistent validation responses throughout the API.
    /// </summary>
    public static class ValidationMessages
    {
        // =============================================
        // GENERAL
        // =============================================

        /// <summary>Required field message template</summary>
        public const string Required = "{0} is required.";

        /// <summary>Invalid ID message</summary>
        public const string InvalidId = "Invalid {0} ID.";

        /// <summary>Count range validation message</summary>
        public const string CountRange = "Count must be between 1 and {0}.";

        // =============================================
        // AUTH
        // =============================================

        /// <summary>Username is required</summary>
        public const string UsernameRequired = "Username is required.";

        /// <summary>Username max length exceeded</summary>
        public const string UsernameTooLong = "Username cannot exceed 50 characters.";

        /// <summary>Email is required</summary>
        public const string EmailRequired = "Email is required.";

        /// <summary>Invalid email format</summary>
        public const string InvalidEmail = "Invalid email format.";

        // =============================================
        // PROBLEM
        // =============================================

        /// <summary>Title is required</summary>
        public const string TitleRequired = "Problem title is required.";

        /// <summary>Topic is required</summary>
        public const string TopicRequired = "Problem topic is required.";

        /// <summary>Description is required</summary>
        public const string DescriptionRequired = "Problem description is required.";

        /// <summary>Invalid difficulty level</summary>
        public const string InvalidDifficulty = "Difficulty must be Easy, Medium, or Hard.";

        /// <summary>Both topic and difficulty required for filter</summary>
        public const string TopicAndDifficultyRequired = "Both topic and difficulty are required.";

        // =============================================
        // COMPILER
        // =============================================

        /// <summary>Code is required</summary>
        public const string CodeRequired = "Code cannot be empty.";

        /// <summary>Invalid language ID</summary>
        public const string InvalidLanguageId = "Invalid language ID. Please select a supported language.";

        /// <summary>Code exceeds maximum length</summary>
        public static readonly string CodeTooLong = $"Code cannot exceed {AppConstants.MaxCodeLength} characters.";

        // =============================================
        // LEADERBOARD
        // =============================================

        /// <summary>Invalid period message</summary>
        public const string InvalidPeriod = "Period must be Weekly, Monthly, or AllTime.";

        /// <summary>Invalid user ID</summary>
        public const string InvalidUserId = "Invalid user ID.";
    }
}