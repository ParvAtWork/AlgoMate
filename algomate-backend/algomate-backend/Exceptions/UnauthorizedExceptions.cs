namespace AlgoMateBackend.Exceptions
{
    /// <summary>
    /// Thrown when a user is not authorized to perform an action.
    /// Maps to HTTP 401 Unauthorized response.
    /// </summary>
    /// <example>
    /// throw new UnauthorizedException();
    /// throw new UnauthorizedException("Invalid or expired token.");
    /// throw new UnauthorizedException("af0d5ae8", "DeleteProblem");
    /// </example>
    public class UnauthorizedException : Exception
    {
        /// <summary>
        /// Supabase UID of the unauthorized user
        /// </summary>
        public string? UserId { get; }

        /// <summary>
        /// Action that was attempted without proper authorization
        /// </summary>
        public string? Action { get; }

        /// <summary>
        /// Thrown when no specific user or action info is available
        /// </summary>
        public UnauthorizedException()
            : base("You are not authorized to perform this action.") { }

        /// <summary>
        /// Thrown with a custom message
        /// </summary>
        /// <param name="message">Custom error message</param>
        public UnauthorizedException(string message)
            : base(message) { }

        /// <summary>
        /// Thrown when specific user and action info is available
        /// </summary>
        /// <param name="userId">Supabase UID of the user</param>
        /// <param name="action">Action that was attempted</param>
        public UnauthorizedException(string userId, string action)
            : base($"User '{userId}' is not authorized to perform '{action}'.")
        {
            UserId = userId;
            Action = action;
        }
    }
}