namespace AlgoMateBackend.Enums
{
    /// <summary>
    /// Supported programming languages — values map to Judge0 language IDs
    /// </summary>
    public enum ProgrammingLanguage
    {
        C = 50,
        CPP = 54,
        CSharp = 51,
        Java = 62,
        Python = 71,
        JavaScript = 63,
        Go = 60,
        Ruby = 72
    }

    /// <summary>
    /// Extension methods for ProgrammingLanguage enum
    /// </summary>
    public static class ProgrammingLanguageExtensions
    {
        public static string ToDisplayString(this ProgrammingLanguage language) => language switch
        {
            ProgrammingLanguage.C => "C (GCC 9.2.0)",
            ProgrammingLanguage.CPP => "C++ (GCC 9.2.0)",
            ProgrammingLanguage.CSharp => "C# (Mono 6.6.0)",
            ProgrammingLanguage.Java => "Java (OpenJDK 13)",
            ProgrammingLanguage.Python => "Python (3.8.1)",
            ProgrammingLanguage.JavaScript => "JavaScript (Node.js 12.14.0)",
            ProgrammingLanguage.Go => "Go (1.13.5)",
            ProgrammingLanguage.Ruby => "Ruby (2.7.0)",
            _ => "Unknown"
        };

        public static string ToFileExtension(this ProgrammingLanguage language) => language switch
        {
            ProgrammingLanguage.C => ".c",
            ProgrammingLanguage.CPP => ".cpp",
            ProgrammingLanguage.CSharp => ".cs",
            ProgrammingLanguage.Java => ".java",
            ProgrammingLanguage.Python => ".py",
            ProgrammingLanguage.JavaScript => ".js",
            ProgrammingLanguage.Go => ".go",
            ProgrammingLanguage.Ruby => ".rb",
            _ => ".txt"
        };

        public static bool IsValid(int languageId) =>
            Enum.IsDefined(typeof(ProgrammingLanguage), languageId);

        public static IEnumerable<object> GetAllLanguages() =>
            Enum.GetValues<ProgrammingLanguage>()
                .Select(l => new
                {
                    id = (int)l,
                    name = l.ToDisplayString(),
                    extension = l.ToFileExtension()
                });
    }
}