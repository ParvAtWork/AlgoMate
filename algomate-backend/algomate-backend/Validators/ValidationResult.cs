namespace AlgoMateBackend.Validators
{
    /// <summary>
    /// Represents the result of a validation operation.
    /// Contains success status and list of validation errors.
    /// </summary>
    public class ValidationResult
    {
        /// <summary>
        /// Indicates whether validation passed successfully
        /// </summary>
        public bool IsValid => !Errors.Any();

        /// <summary>
        /// List of validation error messages.
        /// Empty if validation passed.
        /// </summary>
        public List<string> Errors { get; } = new();

        /// <summary>
        /// Adds a validation error message
        /// </summary>
        /// <param name="error">Error message to add</param>
        public void AddError(string error) => Errors.Add(error);

        /// <summary>
        /// Creates a successful validation result
        /// </summary>
        public static ValidationResult Success() => new();

        /// <summary>
        /// Creates a failed validation result with a single error
        /// </summary>
        /// <param name="error">Error message</param>
        public static ValidationResult Failure(string error)
        {
            var result = new ValidationResult();
            result.AddError(error);
            return result;
        }

        /// <summary>
        /// Creates a failed validation result with multiple errors
        /// </summary>
        /// <param name="errors">List of error messages</param>
        public static ValidationResult Failure(IEnumerable<string> errors)
        {
            var result = new ValidationResult();
            foreach (var error in errors)
                result.AddError(error);
            return result;
        }
    }
}