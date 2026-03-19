using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace algomate_backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Problems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Difficulty = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "Easy"),
                    Topic = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    InputFormat = table.Column<string>(type: "text", nullable: false),
                    OutputFormat = table.Column<string>(type: "text", nullable: false),
                    SampleInput = table.Column<string>(type: "text", nullable: false),
                    SampleOutput = table.Column<string>(type: "text", nullable: false),
                    Constraints = table.Column<string>(type: "text", nullable: false),
                    TimeLimitMs = table.Column<int>(type: "integer", nullable: false, defaultValue: 2000),
                    MemoryLimitMb = table.Column<int>(type: "integer", nullable: false, defaultValue: 256),
                    MaxScore = table.Column<int>(type: "integer", nullable: false),
                    TotalSubmissions = table.Column<int>(type: "integer", nullable: false),
                    AcceptedSubmissions = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ContributorName = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Problems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SupabaseUid = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Student"),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    ProblemsSolved = table.Column<int>(type: "integer", nullable: false),
                    TotalSubmissions = table.Column<int>(type: "integer", nullable: false),
                    AvatarUrl = table.Column<string>(type: "text", nullable: true),
                    IsPremium = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TestCases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProblemId = table.Column<int>(type: "integer", nullable: false),
                    Input = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    ExpectedOutput = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    IsHidden = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Points = table.Column<int>(type: "integer", nullable: false, defaultValue: 10)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestCases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TestCases_Problems_ProblemId",
                        column: x => x.ProblemId,
                        principalTable: "Problems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Leaderboards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    Rank = table.Column<int>(type: "integer", nullable: false),
                    ProblemsSolved = table.Column<int>(type: "integer", nullable: false),
                    TotalSubmissions = table.Column<int>(type: "integer", nullable: false),
                    AccuracyPercent = table.Column<double>(type: "double precision", nullable: false),
                    BadgeTitle = table.Column<string>(type: "text", nullable: true),
                    Period = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "AllTime"),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leaderboards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Leaderboards_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Recommendations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ProblemId = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recommendations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recommendations_Problems_ProblemId",
                        column: x => x.ProblemId,
                        principalTable: "Problems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Recommendations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Submissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ProblemId = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "character varying(50000)", maxLength: 50000, nullable: false),
                    IsSuccessful = table.Column<bool>(type: "boolean", nullable: false),
                    Language = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LanguageId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    Output = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: true),
                    ExpectedOutput = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    ExecutionTimeMs = table.Column<double>(type: "double precision", nullable: false),
                    MemoryUsedMb = table.Column<double>(type: "double precision", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    TestCasesPassed = table.Column<int>(type: "integer", nullable: false),
                    TotalTestCases = table.Column<int>(type: "integer", nullable: false),
                    Judge0Token = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Submissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Submissions_Problems_ProblemId",
                        column: x => x.ProblemId,
                        principalTable: "Problems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Submissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Leaderboards_Period",
                table: "Leaderboards",
                column: "Period");

            migrationBuilder.CreateIndex(
                name: "IX_Leaderboards_UserId",
                table: "Leaderboards",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Leaderboards_UserId_Period",
                table: "Leaderboards",
                columns: new[] { "UserId", "Period" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Problems_Difficulty",
                table: "Problems",
                column: "Difficulty");

            migrationBuilder.CreateIndex(
                name: "IX_Problems_Topic",
                table: "Problems",
                column: "Topic");

            migrationBuilder.CreateIndex(
                name: "IX_Problems_Topic_Difficulty",
                table: "Problems",
                columns: new[] { "Topic", "Difficulty" });

            migrationBuilder.CreateIndex(
                name: "IX_Recommendations_ProblemId",
                table: "Recommendations",
                column: "ProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_Recommendations_UserId",
                table: "Recommendations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Recommendations_UserId_ProblemId",
                table: "Recommendations",
                columns: new[] { "UserId", "ProblemId" });

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_Judge0Token",
                table: "Submissions",
                column: "Judge0Token");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_ProblemId",
                table: "Submissions",
                column: "ProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_UserId",
                table: "Submissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_UserId_ProblemId",
                table: "Submissions",
                columns: new[] { "UserId", "ProblemId" });

            migrationBuilder.CreateIndex(
                name: "IX_TestCases_ProblemId",
                table: "TestCases",
                column: "ProblemId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_SupabaseUid",
                table: "Users",
                column: "SupabaseUid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Leaderboards");

            migrationBuilder.DropTable(
                name: "Recommendations");

            migrationBuilder.DropTable(
                name: "Submissions");

            migrationBuilder.DropTable(
                name: "TestCases");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Problems");
        }
    }
}
