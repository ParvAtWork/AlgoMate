namespace AlgoMateBackend.Enums
{
    /// <summary>
    /// Defines the time periods for leaderboard rankings.
    /// Used across leaderboard endpoints and recalculation logic.
    /// </summary>
    /// <example>
    /// var period = LeaderboardPeriod.AllTime;
    /// var display = LeaderboardPeriod.Weekly.ToDisplayString();
    /// var isValid = LeaderboardPeriodExtensions.IsValid("Monthly");
    /// </example>
    public enum LeaderboardPeriod
    {
        /// <summary>Rankings reset every week</summary>
        Weekly = 1,

        /// <summary>Rankings reset every month</summary>
        Monthly = 2,

        /// <summary>All-time rankings — never reset</summary>
        AllTime = 3
    }

    /// <summary>
    /// Extension methods for LeaderboardPeriod enum
    /// </summary>
    public static class LeaderboardPeriodExtensions
    {
        /// <summary>
        /// Converts LeaderboardPeriod enum to display string
        /// </summary>
        /// <param name="period">LeaderboardPeriod enum value</param>
        /// <returns>Display string e.g. "Weekly", "Monthly", "AllTime"</returns>
        public static string ToDisplayString(this LeaderboardPeriod period) => period switch
        {
            LeaderboardPeriod.Weekly => "Weekly",
            LeaderboardPeriod.Monthly => "Monthly",
            LeaderboardPeriod.AllTime => "AllTime",
            _ => throw new ArgumentOutOfRangeException(nameof(period))
        };

        /// <summary>
        /// Validates if a string value is a valid LeaderboardPeriod
        /// </summary>
        /// <param name="value">String value to validate</param>
        /// <returns>True if valid, false otherwise</returns>
        public static bool IsValid(string value) =>
            Enum.TryParse<LeaderboardPeriod>(value, true, out _);

        /// <summary>
        /// Returns all valid period display strings
        /// </summary>
        /// <returns>Array of valid period strings</returns>
        public static IEnumerable<string> GetAllPeriods() =>
            Enum.GetValues<LeaderboardPeriod>()
                .Select(p => p.ToDisplayString());
    }
}