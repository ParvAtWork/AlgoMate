namespace AlgoMateBackend.Constants
{
    /// <summary>
    /// Constants related to Judge0 CE API integration via RapidAPI.
    /// Maps Judge0 status IDs and configuration values.
    /// </summary>
    public static class JudgeConstants
    {
        // =============================================
        // JUDGE0 API CONFIGURATION
        // =============================================

        /// <summary>Judge0 CE base URL via RapidAPI</summary>
        public const string BaseUrl = "https://judge0-ce.p.rapidapi.com";

        /// <summary>RapidAPI host header value for Judge0 CE</summary>
        public const string ApiHost = "judge0-ce.p.rapidapi.com";

        /// <summary>Judge0 submission endpoint</summary>
        public const string SubmissionEndpoint = "submissions?base64_encoded=true&fields=token";

        /// <summary>Judge0 result endpoint template — {0} = token</summary>
        public const string ResultEndpoint = "submissions/{0}?base64_encoded=true&fields=stdout,stderr,compile_output,message,time,memory,status";

        // =============================================
        // JUDGE0 STATUS IDs
        // Maps directly to SubmissionStatus enum values
        // =============================================

        /// <summary>Submission is in queue</summary>
        public const int StatusInQueue = 1;

        /// <summary>Submission is being processed</summary>
        public const int StatusProcessing = 2;

        /// <summary>Submission accepted — all test cases passed</summary>
        public const int StatusAccepted = 3;

        /// <summary>Wrong answer — output does not match expected</summary>
        public const int StatusWrongAnswer = 4;

        /// <summary>Time limit exceeded</summary>
        public const int StatusTimeLimitExceeded = 5;

        /// <summary>Compilation error</summary>
        public const int StatusCompilationError = 6;

        /// <summary>Runtime error — SIGSEGV</summary>
        public const int StatusRuntimeErrorSIGSEGV = 7;

        /// <summary>Runtime error — SIGXFSZ</summary>
        public const int StatusRuntimeErrorSIGXFSZ = 8;

        /// <summary>Runtime error — SIGFPE</summary>
        public const int StatusRuntimeErrorSIGFPE = 9;

        /// <summary>Runtime error — SIGABRT</summary>
        public const int StatusRuntimeErrorSIGABRT = 10;

        /// <summary>Runtime error — NZEC</summary>
        public const int StatusRuntimeErrorNZEC = 11;

        /// <summary>Runtime error — Other</summary>
        public const int StatusRuntimeErrorOther = 12;

        /// <summary>Internal error on Judge0 side</summary>
        public const int StatusInternalError = 13;

        /// <summary>Execution format error</summary>
        public const int StatusExecFormatError = 14;

        // =============================================
        // JUDGE0 LANGUAGE IDs
        // Maps directly to ProgrammingLanguage enum values
        // =============================================

        /// <summary>C language ID</summary>
        public const int LanguageC = 50;

        /// <summary>C++ language ID</summary>
        public const int LanguageCPP = 54;

        /// <summary>C# language ID</summary>
        public const int LanguageCSharp = 51;

        /// <summary>Java language ID</summary>
        public const int LanguageJava = 62;

        /// <summary>Python language ID</summary>
        public const int LanguagePython = 71;

        /// <summary>JavaScript language ID</summary>
        public const int LanguageJavaScript = 63;

        /// <summary>Go language ID</summary>
        public const int LanguageGo = 60;

        /// <summary>Ruby language ID</summary>
        public const int LanguageRuby = 72;
    }
}
    