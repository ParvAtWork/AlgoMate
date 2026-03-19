namespace AlgoMateBackend.Exceptions
{
    /// <summary>
    /// Thrown when a duplicate resource already exists in the database.
    /// Maps to HTTP 409 Conflict response.
    /// </summary>
    /// <example>
    /// throw new DuplicateException("Username", "ParvMaheshwari");
    /// throw new DuplicateException("Email", "maheshwariparv4@gmail.com");
    /// throw new DuplicateException("User with this email already exists.");
    /// </example>
    public class DuplicateException : Exception
    {
        /// <summary>
        /// Name of the resource that already exists
        /// e.g. "Username", "Email", "Problem"
        /// </summary>
        public string ResourceName { get; }

        /// <summary>
        /// Value of the resource that caused the conflict
        /// e.g. "ParvMaheshwari", "maheshwariparv4@gmail.com"
        /// </summary>
        public object ResourceValue { get; }

        /// <summary>
        /// Thrown when specific resource name and value are available
        /// </summary>
        /// <param name="resourceName">Name of the duplicate resource</param>
        /// <param name="resourceValue">Value of the duplicate resource</param>
        public DuplicateException(string resourceName, object resourceValue)
            : base($"{resourceName} '{resourceValue}' already exists.")
        {
            ResourceName = resourceName;
            ResourceValue = resourceValue;
        }

        /// <summary>
        /// Thrown with a custom message when specific resource info is not available
        /// </summary>
        /// <param name="message">Custom error message</param>
        public DuplicateException(string message)
            : base(message)
        {
            ResourceName = string.Empty;
            ResourceValue = string.Empty;
        }
    }
}