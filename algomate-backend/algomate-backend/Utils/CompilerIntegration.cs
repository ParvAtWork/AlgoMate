namespace AlgoMateBackend.Utils
{
    // Judge0 Language IDs aur helper methods
    public static class CompilerIntegration
    {
        // Judge0 Language ID mapping
        public static readonly Dictionary<string, int> LanguageIds = new()
        {
            { "cpp", 54 },
            { "java", 62 },
            { "python", 71 },
            { "javascript", 63 },
            { "csharp", 51 },
            { "go", 60 },
            { "ruby", 72 }
        };

        // Language ID se name get karo
        public static string GetLanguageName(int languageId) => languageId switch
        {
            54 => "C++",
            62 => "Java",
            71 => "Python",
            63 => "JavaScript",
            51 => "C#",
            60 => "Go",
            72 => "Ruby",
            _ => "Unknown"
        };

        // Language valid hai ya nahi
        public static bool IsValidLanguageId(int languageId) =>
            LanguageIds.ContainsValue(languageId);

        // Code size valid hai ya nahi — 50KB limit
        public static bool IsCodeSizeValid(string code) =>
            System.Text.Encoding.UTF8.GetByteCount(code) <= 50000;

        // Base64 encode
        public static string EncodeBase64(string text)
        {
            if (string.IsNullOrEmpty(text)) return string.Empty;
            return Convert.ToBase64String(
                System.Text.Encoding.UTF8.GetBytes(text));
        }

        // Base64 decode
        public static string? DecodeBase64(string? text)
        {
            if (string.IsNullOrEmpty(text)) return null;
            try
            {
                return System.Text.Encoding.UTF8.GetString(
                    Convert.FromBase64String(text));
            }
            catch
            {
                return text;
            }
        }

        // Judge0 status ID se readable string
        public static string MapStatusToString(int statusId) => statusId switch
        {
            1 => "In Queue",
            2 => "Processing",
            3 => "Accepted",
            4 => "Wrong Answer",
            5 => "Time Limit Exceeded",
            6 => "Compile Error",
            7 or 8 or 9 or 10 or 11 or 12 => "Runtime Error",
            13 => "Internal Error",
            14 => "Execution Format Error",
            _ => "Unknown"
        };

        // Status successful hai ya nahi
        public static bool IsSuccessfulStatus(int statusId) =>
            statusId == 3; // Only "Accepted"
    }
}