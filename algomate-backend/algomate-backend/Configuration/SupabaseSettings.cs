namespace AlgoMateBackend.Configuration
{
    /// <summary>
    /// Strongly typed configuration for Supabase integration settings.
    /// Bound from appsettings.json "Supabase" section.
    /// Sensitive values (AnonKey, ServiceRoleKey, JwtSecret) must be
    /// stored in user secrets or environment variables.
    /// </summary>
    /// <example>
    /// // appsettings.json:
    /// "Supabase": {
    ///   "Url": "https://your-project.supabase.co",
    ///   "AnonKey": "SEE_USER_SECRETS",
    ///   "ServiceRoleKey": "SEE_USER_SECRETS",
    ///   "JwtSecret": "SEE_USER_SECRETS",
    ///   "ProjectRef": "your-project-ref"
    /// }
    /// </example>
    public class SupabaseSettings
    {
        /// <summary>
        /// Configuration section name in appsettings.json
        /// </summary>
        public const string SectionName = "Supabase";

        /// <summary>
        /// Supabase project URL.
        /// Format: https://your-project-ref.supabase.co
        /// </summary>
        public string Url { get; set; } = string.Empty;

        /// <summary>
        /// Supabase anonymous/public key.
        /// Safe to use in frontend — limited permissions.
        /// Must be stored in user secrets.
        /// </summary>
        public string AnonKey { get; set; } = string.Empty;

        /// <summary>
        /// Supabase service role key.
        /// Has full database access — never expose to frontend.
        /// Must be stored in user secrets.
        /// </summary>
        public string ServiceRoleKey { get; set; } = string.Empty;

        /// <summary>
        /// Supabase JWT signing secret.
        /// Used to validate JWT tokens issued by Supabase Auth.
        /// Found in: Supabase Dashboard → Settings → JWT Keys → Legacy JWT Secret.
        /// Must be stored in user secrets.
        /// </summary>
        public string JwtSecret { get; set; } = string.Empty;

        /// <summary>
        /// Supabase project reference ID.
        /// Found in the Supabase project URL.
        /// e.g. "duogcgfndvbaysdpckmn" from duogcgfndvbaysdpckmn.supabase.co
        /// </summary>
        public string ProjectRef { get; set; } = string.Empty;

        /// <summary>
        /// Supabase Auth endpoint URL
        /// </summary>
        public string AuthUrl => $"{Url}/auth/v1";

        /// <summary>
        /// Supabase JWKS endpoint URL for token validation
        /// </summary>
        public string JwksUrl => $"{Url}/auth/v1/.well-known/jwks.json";

        /// <summary>
        /// Validates that all required Supabase settings are present
        /// </summary>
        /// <exception cref="InvalidOperationException">
        /// Thrown when required settings are missing
        /// </exception>
        public void Validate()
        {
            if (string.IsNullOrWhiteSpace(Url))
                throw new InvalidOperationException(
                    "Supabase URL is missing. Set it in appsettings.json.");

            if (string.IsNullOrWhiteSpace(JwtSecret))
                throw new InvalidOperationException(
                    "Supabase JwtSecret is missing. Set it via user secrets: " +
                    "dotnet user-secrets set \"Supabase:JwtSecret\" \"your-secret\"");

            if (string.IsNullOrWhiteSpace(ProjectRef))
                throw new InvalidOperationException(
                    "Supabase ProjectRef is missing. Set it in appsettings.json.");
        }
    }
}