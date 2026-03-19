using AlgoMateBackend.Constants;
using AlgoMateBackend.DTOs;
using AlgoMateBackend.Enums;

namespace AlgoMateBackend.Validators
{
    /// <summary>
    /// Validates problem creation and update requests.
    /// Used in ProblemController and AdminController.
    /// </summary>
    public static class ProblemValidator
    {
        /// <summary>
        /// Validates a CreateProblemDTO request
        /// </summary>
        /// <param name="request">Problem creation request to validate</param>
        /// <returns>ValidationResult with errors if invalid</returns>
        /// <example>
        /// var result = ProblemValidator.Validate(request);
        /// if (!result.IsValid)
        ///     return BadRequest(result.Errors);
        /// </example>
        public static ValidationResult Validate(CreateProblemDTO request)
        {
            var result = new ValidationResult();

            // =============================================
            // Title validation
            // =============================================
            if (string.IsNullOrWhiteSpace(request.Title))
                result.AddError(ValidationMessages.TitleRequired);
            else if (request.Title.Length > 200)
                result.AddError("Title cannot exceed 200 characters.");

            // =============================================
            // Description validation
            // =============================================
            if (string.IsNullOrWhiteSpace(request.Description))
                result.AddError(ValidationMessages.DescriptionRequired);

            // =============================================
            // Difficulty validation
            // =============================================
            if (string.IsNullOrWhiteSpace(request.Difficulty))
                result.AddError(ValidationMessages.InvalidDifficulty);
            else if (!DifficultyExtensions.IsValid(request.Difficulty))
                result.AddError(ValidationMessages.InvalidDifficulty);

            // =============================================
            // Topic validation
            // =============================================
            if (string.IsNullOrWhiteSpace(request.Topic))
                result.AddError(ValidationMessages.TopicRequired);
            else if (request.Topic.Length > 50)
                result.AddError("Topic cannot exceed 50 characters.");

            // =============================================
            // Time limit validation
            // =============================================
            if (request.TimeLimitMs <= 0)
                result.AddError("Time limit must be greater than 0.");
            else if (request.TimeLimitMs > 10000)
                result.AddError("Time limit cannot exceed 10000ms.");

            // =============================================
            // Memory limit validation
            // =============================================
            if (request.MemoryLimitMb <= 0)
                result.AddError("Memory limit must be greater than 0.");
            else if (request.MemoryLimitMb > 512)
                result.AddError("Memory limit cannot exceed 512MB.");

            // =============================================
            // Max score validation
            // =============================================
            if (request.MaxScore <= 0)
                result.AddError("Max score must be greater than 0.");
            else if (request.MaxScore > 1000)
                result.AddError("Max score cannot exceed 1000.");

            // =============================================
            // Input/Output format validation
            // =============================================
            if (string.IsNullOrWhiteSpace(request.InputFormat))
                result.AddError("Input format is required.");

            if (string.IsNullOrWhiteSpace(request.OutputFormat))
                result.AddError("Output format is required.");

            // =============================================
            // Sample input/output validation
            // =============================================
            if (string.IsNullOrWhiteSpace(request.SampleInput))
                result.AddError("Sample input is required.");

            if (string.IsNullOrWhiteSpace(request.SampleOutput))
                result.AddError("Sample output is required.");

            return result;
        }

        /// <summary>
        /// Validates only the core fields — used for quick validation
        /// </summary>
        /// <param name="request">Problem creation request to validate</param>
        /// <returns>ValidationResult with errors if invalid</returns>
        public static ValidationResult ValidateCore(CreateProblemDTO request)
        {
            var result = new ValidationResult();

            if (string.IsNullOrWhiteSpace(request.Title))
                result.AddError(ValidationMessages.TitleRequired);

            if (string.IsNullOrWhiteSpace(request.Topic))
                result.AddError(ValidationMessages.TopicRequired);

            if (!DifficultyExtensions.IsValid(request.Difficulty))
                result.AddError(ValidationMessages.InvalidDifficulty);

            return result;
        }
    }
}