using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeCalendar.API.Migrations
{
    /// <inheritdoc />
    public partial class settings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "EventParticipations");

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    EmployeeId = table.Column<long>(type: "INTEGER", nullable: false),
                    SiteTheme = table.Column<int>(type: "INTEGER", nullable: false),
                    UserTheme = table.Column<int>(type: "INTEGER", nullable: false),
                    FontSize = table.Column<int>(type: "INTEGER", nullable: false),
                    DefaultCalendarView = table.Column<int>(type: "INTEGER", nullable: false),
                    Language = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.EmployeeId);
                    table.ForeignKey(
                        name: "FK_Settings_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Settings");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "EventParticipations",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }
    }
}
