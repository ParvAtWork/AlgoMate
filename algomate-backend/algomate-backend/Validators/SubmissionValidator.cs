using AlgoMateBackend.Constants;
using AlgoMateBackend.DTOs;
using AlgoMateBackend.Enums;

namespace AlgoMateBackend.Validators
{
    /// <summary>
    /// Validates code submission requests.
    /// Used in CompilerController before submitting to Judge0.
    /// </summary>
    public static class SubmissionValidator
    {
        /// <summary>
        /// Validates a SubmitCodeDTO request
        /// </summary>
        /// <param name="request">Code submission request to validate</param>
        /// <returns>ValidationResult with errors if invalid</returns>
        /// <example>
        /// var result = SubmissionValidator.Validate(request);
        /// if (!result.IsValid)
        ///     return BadRequest(result.Errors);
        /// </example>
        public static ValidationResult Validate(SubmitCodeDTO request)
        {
            var result = new ValidationResult();

            // =============================================
            // Problem ID validation
            // =============================================
            if (request.ProblemId <= 0)
                result.AddError(string.Format(
                    ValidationMessages.InvalidId, "problem"));

            // =============================================
            // Code validation
            // =============================================
            if (string.IsNullOrWhiteSpace(request.Code))
                result.AddError(ValidationMessages.CodeRequired);
            else if (request.Code.Length > AppConstants.MaxCodeLength)
                result.AddError(ValidationMessages.CodeTooLong);

            // =============================================
            // Language ID validation — Judge0 CE supported
            // =============================================
            if (!ProgrammingLanguageExtensions.IsValid(request.LanguageId))
                result.AddError(ValidationMessages.InvalidLanguageId);

            return result;
        }

        /// <summary>
        /// Validates only the code field
        /// </summary>
        /// <param name="code">Source code to validate</param>
        /// <returns>ValidationResult with errors if invalid</returns>
        public static ValidationResult ValidateCode(string code)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(code))
                result.AddError(ValidationMessages.CodeRequired);
            else if (code.Length > AppConstants.MaxCodeLength)
                result.AddError(ValidationMessages.CodeTooLong);

            return result;
        }

        /// <summary>
        /// Validates only the language ID
        /// </summary>
        /// <param name="languageId">Judge0 language ID to validate</param>
        /// <returns>ValidationResult with errors if invalid</returns>
        public static ValidationResult ValidateLanguage(int languageId)
        {
            var result = new ValidationResult();

            if (!ProgrammingLanguageExtensions.IsValid(languageId))
                result.AddError(ValidationMessages.InvalidLanguageId);

            return result;
        }
    }
}