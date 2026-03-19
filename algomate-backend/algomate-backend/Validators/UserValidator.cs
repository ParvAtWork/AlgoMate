using System.Text.RegularExpressions;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Models;

namespace AlgoMateBackend.Validators
{
    /// <summary>
    /// Validates user registration and profile update requests.
    /// Used in UserController and AuthController.
    /// </summary>
    public static class UserValidator
    {
        /// <summary>
        /// Regex pattern for valid username — alphanumeric and underscore only
        /// </summary>
        private static readonly Regex UsernamePattern =
            new(@"^[a-zA-Z0-9_]+$", RegexOptions.Compiled);

        /// <summary>
        /// Regex pattern for valid email format
        /// </summary>
        private static readonly Regex EmailPattern =
            new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

        /// <summary>
        /// Validates a User model for registration
        /// </summary>
        /// <param name="user">User model to validate</param>
        /// <returns>ValidationResult with errors if invalid</returns>
        /// <example>
        /// var result = UserValidator.ValidateRegistration(user);
        /// if (!result.IsValid)
        ///     return BadRequest(result.Errors);
        /// </example>
        public static ValidationResult ValidateRegistration(User user)
        {
            var result = new ValidationResult();

            // =============================================
            // Username validation
            // =============================================
            if (string.IsNullOrWhiteSpace(user.Username))
                result.AddError(ValidationMessages.UsernameRequired);
            else if (user.Username.Length > 50)
                result.AddError(ValidationMessages.UsernameTooLong);
            else if (!UsernamePattern.IsMatch(user.Username))
                result.AddError("Username can only contain letters, numbers and underscores.");

            // =============================================
            // Email validation
            // =============================================
            if (string.IsNullOrWhiteSpace(user.Email))
                result.AddError(ValidationMessages.EmailRequired);
            else if (!EmailPattern.IsMatch(user.Email))
                result.AddError(ValidationMessages.InvalidEmail);
            else if (user.Email.Length > 100)
                result.AddError("Email cannot exceed 100 characters.");

            return result;
        }

        /// <summary>
        /// Validates a user profile update request
        /// </summary>
        /// <param name="username">New username to validate</param>
        /// <returns>ValidationResult with errors if invalid</returns>
        public static ValidationResult ValidateProfileUpdate(string username)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(username))
                result.AddError(ValidationMessages.UsernameRequired);
            else if (username.Length > 50)
                result.AddError(ValidationMessages.UsernameTooLong);
            else if (!UsernamePattern.IsMatch(username))
                result.AddError("Username can only contain letters, numbers and underscores.");

            return result;
        }

        /// <summary>
        /// Validates only the username field
        /// </summary>
        /// <param name="username">Username to validate</param>
        /// <returns>ValidationResult with errors if invalid</returns>
        public static ValidationResult ValidateUsername(string username)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(username))
                result.AddError(ValidationMessages.UsernameRequired);
            else if (username.Length > 50)
                result.AddError(ValidationMessages.UsernameTooLong);
            else if (!UsernamePattern.IsMatch(username))
                result.AddError("Username can only contain letters, numbers and underscores.");

            return result;
        }

        /// <summary>
        /// Validates only the email field
        /// </summary>
        /// <param name="email">Email to validate</param>
        /// <returns>ValidationResult with errors if invalid</returns>
        public static ValidationResult ValidateEmail(string email)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(email))
                result.AddError(ValidationMessages.EmailRequired);
            else if (!EmailPattern.IsMatch(email))
                result.AddError(ValidationMessages.InvalidEmail);
            else if (email.Length > 100)
                result.AddError("Email cannot exceed 100 characters.");

            return result;
        }
    }
}