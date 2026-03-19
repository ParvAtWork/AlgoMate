namespace AlgoMateBackend.Exceptions
{
    /// <summary>
    /// Thrown when compiler or Judge0 RapidAPI integration fails.
    /// Maps to HTTP 502 Bad Gateway response.
    /// </summary>
    /// <example>
    /// throw new CompilerException("Judge0 submission failed.");
    /// throw new CompilerException("Invalid token.", "abc123-judge0-token");
    /// throw new CompilerException("Rate limit exceeded.", 429);
    /// throw new CompilerException("Timeout occurred.", innerException);
    /// </example>
    public class CompilerException : Exception
    {
        /// <summary>
        /// Judge0 submission token associated with the failed compilation
        /// </summary>
        public string? Judge0Token { get; }

        /// <summary>
        /// HTTP status code returned by Judge0 RapidAPI
        /// </summary>
        public int? StatusCode { get; }

        /// <summary>
        /// Thrown when a general compiler error occurs
        /// </summary>
        /// <param name="message">Error message describing what went wrong</param>
        public CompilerException(string message)
            : base(message) { }

        /// <summary>
        /// Thrown when compiler error is associated with a specific Judge0 token
        /// </summary>
        /// <param name="message">Error message describing what went wrong</param>
        /// <param name="judge0Token">Judge0 submission token</param>
        public CompilerException(string message, string judge0Token)
            : base(message)
        {
            Judge0Token = judge0Token;
        }

        /// <summary>
        /// Thrown when compiler error includes an HTTP status code from Judge0
        /// </summary>
        /// <param name="message">Error message describing what went wrong</param>
        /// <param name="statusCode">HTTP status code from Judge0 RapidAPI</param>
        public CompilerException(string message, int statusCode)
            : base(message)
        {
            StatusCode = statusCode;
        }

        /// <summary>
        /// Thrown when compiler error wraps an inner exception
        /// </summary>
        /// <param name="message">Error message describing what went wrong</param>
        /// <param name="innerException">Original exception that caused this error</param>
        public CompilerException(string message, Exception innerException)
            : base(message, innerException) { }
    }
}