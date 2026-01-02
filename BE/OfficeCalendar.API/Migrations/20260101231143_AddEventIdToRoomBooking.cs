using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeCalendar.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEventIdToRoomBooking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "EventId",
                table: "RoomBookings",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoomBookings_EventId",
                table: "RoomBookings",
                column: "EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_RoomBookings_Events_EventId",
                table: "RoomBookings",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoomBookings_Events_EventId",
                table: "RoomBookings");

            migrationBuilder.DropIndex(
                name: "IX_RoomBookings_EventId",
                table: "RoomBookings");

            migrationBuilder.DropColumn(
                name: "EventId",
                table: "RoomBookings");
        }
    }
}
