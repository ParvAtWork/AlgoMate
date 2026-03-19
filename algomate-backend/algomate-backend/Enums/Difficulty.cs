namespace AlgoMateBackend.Enums
{
    /// <summary>
    /// Problem difficulty levels
    /// </summary>
    public enum Difficulty
    {
        Easy = 1,
        Medium = 2,
        Hard = 3
    }

    /// <summary>
    /// Extension methods for Difficulty enum
    /// </summary>
    public static class DifficultyExtensions
    {
        public static string ToDisplayString(this Difficulty difficulty) => difficulty switch
        {
            Difficulty.Easy => "Easy",
            Difficulty.Medium => "Medium",
            Difficulty.Hard => "Hard",
            _ => throw new ArgumentOutOfRangeException(nameof(difficulty))
        };

        public static int ToBaseScore(this Difficulty difficulty) => difficulty switch
        {
            Difficulty.Easy => 100,
            Difficulty.Medium => 200,
            Difficulty.Hard => 300,
            _ => 0
        };

        public static bool IsValid(string value) =>
            Enum.TryParse<Difficulty>(value, true, out _);
    }
}