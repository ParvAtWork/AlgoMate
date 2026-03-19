using System.Text.RegularExpressions;
using AlgoMateBackend.Constants;
using AlgoMateBackend.DTOs;

namespace AlgoMateBackend.Validators
{
    /// <summary>
    /// Validates signup requests from AuthController.
    /// Ensures username meets platform requirements.
    /// </summary>
    public static class SignupRequestValidator
    {
        /// <summary>
        /// Regex pattern for valid username — alphanumeric and underscore only
        /// </summary>
        private static readonly Regex UsernamePattern =
            new(@"^[a-zA-Z0-9_]+$", RegexOptions.Compiled);

        /// <summary>
        /// Validates a SignupRequest
        /// </summary>
        /// <param name="request">Signup request to validate</param>
        /// <returns>ValidationResult with errors if invalid</returns>
        /// <example>
        /// var result = SignupRequestValidator.Validate(request);
        /// if (!result.IsValid)
        ///     return BadRequest(result.Errors);
        /// </example>
        public static ValidationResult Validate(SignupRequest request)
        {
            var result = new ValidationResult();

            // =============================================
            // Username validation
            // =============================================
            if (string.IsNullOrWhiteSpace(request.Username))
                result.AddError(ValidationMessages.UsernameRequired);
            else if (request.Username.Length > 50)
                result.AddError(ValidationMessages.UsernameTooLong);
            else if (request.Username.Length < 3)
                result.AddError("Username must be at least 3 characters.");
            else if (!UsernamePattern.IsMatch(request.Username))
                result.AddError("Username can only contain letters, numbers and underscores.");

            return result;
        }
    }
}