using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace algomate_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddErrorFieldsToSubmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActualOutput",
                table: "Submissions",
                type: "character varying(10000)",
                maxLength: 10000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompileError",
                table: "Submissions",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RuntimeError",
                table: "Submissions",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TestInput",
                table: "Submissions",
                type: "character varying(10000)",
                maxLength: 10000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActualOutput",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "CompileError",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "RuntimeError",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "TestInput",
                table: "Submissions");
        }
    }
}
