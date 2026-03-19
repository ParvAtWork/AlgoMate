namespace AlgoMateBackend.Exceptions
{
    /// <summary>
    /// Thrown when RapidAPI or Judge0 rate limit is exceeded.
    /// Maps to HTTP 429 Too Many Requests response.
    /// </summary>
    /// <example>
    /// throw new RateLimitException();
    /// throw new RateLimitException("Judge0 RapidAPI");
    /// throw new RateLimitException("Judge0 RapidAPI", 60);
    /// </example>
    public class RateLimitException : Exception
    {
        /// <summary>
        /// Number of seconds to wait before retrying the request.
        /// Null if retry time is not specified by the service.
        /// </summary>
        public int? RetryAfterSeconds { get; }

        /// <summary>
        /// Name of the service that returned the rate limit error.
        /// e.g. "Judge0 RapidAPI", "Supabase"
        /// </summary>
        public string? ServiceName { get; }

        /// <summary>
        /// Thrown when no specific service or retry info is available
        /// </summary>
        public RateLimitException()
            : base("Rate limit exceeded. Please try again later.") { }

        /// <summary>
        /// Thrown when specific service name is available
        /// </summary>
        /// <param name="serviceName">Name of the service that rate limited the request</param>
        public RateLimitException(string serviceName)
            : base($"Rate limit exceeded for {serviceName}. Please try again later.")
        {
            ServiceName = serviceName;
        }

        /// <summary>
        /// Thrown when both service name and retry time are available
        /// </summary>
        /// <param name="serviceName">Name of the service that rate limited the request</param>
        /// <param name="retryAfterSeconds">Number of seconds to wait before retrying</param>
        public RateLimitException(string serviceName, int retryAfterSeconds)
            : base($"Rate limit exceeded for {serviceName}. Retry after {retryAfterSeconds} seconds.")
        {
            ServiceName = serviceName;
            RetryAfterSeconds = retryAfterSeconds;
        }
    }
}