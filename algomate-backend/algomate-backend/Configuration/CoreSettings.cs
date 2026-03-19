namespace AlgoMateBackend.Configuration
{
    /// <summary>
    /// Strongly typed configuration for CORS (Cross-Origin Resource Sharing) settings.
    /// Bound from appsettings.json "Cors" section.
    /// Controls which frontend origins are allowed to access the API.
    /// </summary>
    /// <example>
    /// // appsettings.json:
    /// "Cors": {
    ///   "AllowedOrigins": [
    ///     "http://localhost:3000",
    ///     "http://localhost:5173",
    ///     "https://algomate.vercel.app"
    ///   ]
    /// }
    /// </example>
    public class CorsSettings
    {
        /// <summary>
        /// Configuration section name in appsettings.json
        /// </summary>
        public const string SectionName = "Cors";

        /// <summary>
        /// List of allowed frontend origins.
        /// Add production frontend URL when deploying.
        /// Default: ["http://localhost:3000"]
        /// </summary>
        public string[] AllowedOrigins { get; set; } =
        {
            "http://localhost:3000"
        };

        /// <summary>
        /// Gets the allowed origins as a read-only array.
        /// Falls back to default localhost if no origins configured.
        /// </summary>
        public string[] GetAllowedOrigins() =>
            AllowedOrigins.Length > 0
                ? AllowedOrigins
                : new[] { "http://localhost:3000" };

        /// <summary>
        /// Validates that at least one origin is configured
        /// </summary>
        /// <exception cref="InvalidOperationException">
        /// Thrown when no origins are configured
        /// </exception>
        public void Validate()
        {
            if (AllowedOrigins == null || AllowedOrigins.Length == 0)
                throw new InvalidOperationException(
                    "CORS AllowedOrigins is missing. " +
                    "Add at least one origin in appsettings.json.");
        }
    }
}