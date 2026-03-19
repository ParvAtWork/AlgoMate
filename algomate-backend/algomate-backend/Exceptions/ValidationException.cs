namespace AlgoMateBackend.Exceptions
{
    /// <summary>
    /// Thrown when input validation fails.
    /// Maps to HTTP 400 Bad Request response.
    /// </summary>
    /// <example>
    /// throw new ValidationException("Title is required.");
    /// throw new ValidationException(new[] { "Title is required.", "Difficulty is invalid." });
    /// </example>
    public class ValidationException : Exception
    {
        /// <summary>
        /// List of all validation errors that occurred
        /// </summary>
        public IEnumerable<string> Errors { get; }

        /// <summary>
        /// Thrown when a single validation error occurs
        /// </summary>
        /// <param name="message">Validation error message</param>
        public ValidationException(string message)
            : base(message)
        {
            Errors = new List<string> { message };
        }

        /// <summary>
        /// Thrown when multiple validation errors occur
        /// </summary>
        /// <param name="errors">List of all validation error messages</param>
        public ValidationException(IEnumerable<string> errors)
            : base("One or more validation errors occurred.")
        {
            Errors = errors;
        }
    }
}