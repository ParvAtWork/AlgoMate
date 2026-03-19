namespace AlgoMateBackend.Configuration
{
    /// <summary>
    /// Strongly typed configuration for JWT authentication settings.
    /// Bound from appsettings.json "Jwt" section.
    /// </summary>
    /// <example>
    /// // appsettings.json:
    /// "Jwt": {
    ///   "Secret": "SEE_USER_SECRETS",
    ///   "Issuer": "AlgoMate",
    ///   "Audience": "AlgoMateUsers",
    ///   "ExpiryMinutes": 60
    /// }
    /// </example>
    public class JwtSettings
    {
        /// <summary>
        /// Configuration section name in appsettings.json
        /// </summary>
        public const string SectionName = "Jwt";

        /// <summary>
        /// JWT signing secret key.
        /// Must be stored in user secrets or environment variables — never in appsettings.json.
        /// </summary>
        public string Secret { get; set; } = string.Empty;

        /// <summary>
        /// JWT token issuer — typically the application name or URL.
        /// Used for token validation when ValidateIssuer is true.
        /// </summary>
        public string Issuer { get; set; } = string.Empty;

        /// <summary>
        /// JWT token audience — typically the intended recipients.
        /// Used for token validation when ValidateAudience is true.
        /// </summary>
        public string Audience { get; set; } = string.Empty;

        /// <summary>
        /// Token expiry time in minutes.
        /// Default: 60 minutes (1 hour)
        /// </summary>
        public int ExpiryMinutes { get; set; } = 60;

        /// <summary>
        /// Validates that all required JWT settings are present
        /// </summary>
        /// <exception cref="InvalidOperationException">
        /// Thrown when required settings are missing
        /// </exception>
        public void Validate()
        {
            if (string.IsNullOrWhiteSpace(Secret))
                throw new InvalidOperationException(
                    "JWT Secret is missing. Set it via user secrets: " +
                    "dotnet user-secrets set \"Jwt:Secret\" \"your-secret\"");
        }
    }
}