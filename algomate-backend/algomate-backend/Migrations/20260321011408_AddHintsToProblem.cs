using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace algomate_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddHintsToProblem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Hints",
                table: "Problems",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Hints",
                table: "Problems");
        }
    }
}
