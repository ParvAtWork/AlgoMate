namespace AlgoMateBackend.Configuration
{
    /// <summary>
    /// Strongly typed configuration for Judge0 CE compiler integration via RapidAPI.
    /// Bound from appsettings.json "Compiler" section.
    /// Sensitive values (ApiKey) must be stored in user secrets.
    /// </summary>
    /// <example>
    /// // appsettings.json:
    /// "Compiler": {
    ///   "BaseUrl": "https://judge0-ce.p.rapidapi.com",
    ///   "ApiKey": "SEE_USER_SECRETS",
    ///   "ApiHost": "judge0-ce.p.rapidapi.com"
    /// }
    /// </example>
    public class CompilerSettings
    {
        /// <summary>
        /// Configuration section name in appsettings.json
        /// </summary>
        public const string SectionName = "Compiler";

        /// <summary>
        /// Judge0 CE base URL via RapidAPI.
        /// Default: https://judge0-ce.p.rapidapi.com
        /// </summary>
        public string BaseUrl { get; set; } = "https://judge0-ce.p.rapidapi.com";

        /// <summary>
        /// RapidAPI key for Judge0 CE authentication.
        /// Found in: RapidAPI Dashboard → Judge0 CE → Security.
        /// Must be stored in user secrets — never in appsettings.json.
        /// </summary>
        public string ApiKey { get; set; } = string.Empty;

        /// <summary>
        /// RapidAPI host header value for Judge0 CE.
        /// Default: judge0-ce.p.rapidapi.com
        /// </summary>
        public string ApiHost { get; set; } = "judge0-ce.p.rapidapi.com";

        /// <summary>
        /// Maximum number of polling attempts for Judge0 result.
        /// Default: 10 attempts
        /// </summary>
        public int MaxPollingAttempts { get; set; } = 10;

        /// <summary>
        /// Delay between Judge0 polling attempts in milliseconds.
        /// Default: 1000ms (1 second)
        /// </summary>
        public int PollingDelayMs { get; set; } = 1000;

        /// <summary>
        /// Validates that all required compiler settings are present
        /// </summary>
        /// <exception cref="InvalidOperationException">
        /// Thrown when required settings are missing
        /// </exception>
        public void Validate()
        {
            if (string.IsNullOrWhiteSpace(BaseUrl))
                throw new InvalidOperationException(
                    "Compiler BaseUrl is missing. Set it in appsettings.json.");

            if (string.IsNullOrWhiteSpace(ApiKey))
                throw new InvalidOperationException(
                    "Compiler ApiKey is missing. Set it via user secrets: " +
                    "dotnet user-secrets set \"Compiler:ApiKey\" \"your-api-key\"");

            if (string.IsNullOrWhiteSpace(ApiHost))
                throw new InvalidOperationException(
                    "Compiler ApiHost is missing. Set it in appsettings.json.");
        }
    }
}