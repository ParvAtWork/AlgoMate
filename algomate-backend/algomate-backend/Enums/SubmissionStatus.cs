namespace AlgoMateBackend.Enums
{
    /// <summary>
    /// Submission status — maps to Judge0 status IDs
    /// </summary>
    public enum SubmissionStatus
    {
        Pending = 0,
        InQueue = 1,
        Processing = 2,
        Accepted = 3,
        WrongAnswer = 4,
        TimeLimitExceeded = 5,
        CompilationError = 6,
        RuntimeError = 7,
        InternalError = 13,
        ExecFormatError = 14
    }

    /// <summary>
    /// Extension methods for SubmissionStatus enum
    /// </summary>
    public static class SubmissionStatusExtensions
    {
        public static string ToDisplayString(this SubmissionStatus status) => status switch
        {
            SubmissionStatus.Pending => "Pending",
            SubmissionStatus.InQueue => "In Queue",
            SubmissionStatus.Processing => "Processing",
            SubmissionStatus.Accepted => "Accepted",
            SubmissionStatus.WrongAnswer => "Wrong Answer",
            SubmissionStatus.TimeLimitExceeded => "Time Limit Exceeded",
            SubmissionStatus.CompilationError => "Compilation Error",
            SubmissionStatus.RuntimeError => "Runtime Error",
            SubmissionStatus.InternalError => "Internal Error",
            SubmissionStatus.ExecFormatError => "Execution Format Error",
            _ => "Unknown"
        };

        public static bool IsTerminal(this SubmissionStatus status) =>
            status != SubmissionStatus.Pending &&
            status != SubmissionStatus.InQueue &&
            status != SubmissionStatus.Processing;

        public static bool IsSuccessful(this SubmissionStatus status) =>
            status == SubmissionStatus.Accepted;

        public static SubmissionStatus FromJudge0Id(int id) => id switch
        {
            1 => SubmissionStatus.InQueue,
            2 => SubmissionStatus.Processing,
            3 => SubmissionStatus.Accepted,
            4 => SubmissionStatus.WrongAnswer,
            5 => SubmissionStatus.TimeLimitExceeded,
            6 => SubmissionStatus.CompilationError,
            >= 7 and <= 12 => SubmissionStatus.RuntimeError,
            13 => SubmissionStatus.InternalError,
            14 => SubmissionStatus.ExecFormatError,
            _ => SubmissionStatus.Pending
        };
    }
}