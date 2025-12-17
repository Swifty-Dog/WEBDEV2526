using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeCalendar.API.Migrations
{
    /// <inheritdoc />
    public partial class AccentColorBetterName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserTheme",
                table: "Settings",
                newName: "AccentColor");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AccentColor",
                table: "Settings",
                newName: "UserTheme");
        }
    }
}
