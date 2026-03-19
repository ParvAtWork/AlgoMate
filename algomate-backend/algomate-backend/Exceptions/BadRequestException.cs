namespace AlgoMateBackend.Exceptions
{
    /// <summary>
    /// Thrown when a request is invalid, malformed, or missing required fields.
    /// Maps to HTTP 400 Bad Request response.
    /// </summary>
    /// <example>
    /// throw new BadRequestException("Code cannot be empty.");
    /// throw new BadRequestException("LanguageId", "Invalid language ID provided.");
    /// throw new BadRequestException(new[] { "Title is required.", "Topic is required." });
    /// </example>
    public class BadRequestException : Exception
    {
        /// <summary>
        /// Name of the specific field that caused the bad request.
        /// Null if the error is not field-specific.
        /// e.g. "LanguageId", "Title", "Difficulty"
        /// </summary>
        public string? Field { get; }

        /// <summary>
        /// List of all error messages associated with the bad request.
        /// Contains at least one error message.
        /// </summary>
        public IEnumerable<string> Errors { get; }

        /// <summary>
        /// Thrown when a general bad request error occurs
        /// </summary>
        /// <param name="message">Error message describing what is invalid</param>
        public BadRequestException(string message)
            : base(message)
        {
            Errors = new List<string> { message };
        }

        /// <summary>
        /// Thrown when a specific field causes the bad request
        /// </summary>
        /// <param name="field">Name of the invalid field</param>
        /// <param name="message">Error message describing why the field is invalid</param>
        public BadRequestException(string field, string message)
            : base(message)
        {
            Field = field;
            Errors = new List<string> { $"{field}: {message}" };
        }

        /// <summary>
        /// Thrown when multiple fields cause bad request errors
        /// </summary>
        /// <param name="errors">List of all error messages</param>
        public BadRequestException(IEnumerable<string> errors)
            : base("One or more request errors occurred.")
        {
            Errors = errors;
        }
    }
}