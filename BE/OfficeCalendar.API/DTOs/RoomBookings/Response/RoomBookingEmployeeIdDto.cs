namespace OfficeCalendar.API.DTOs.RoomBookings.Response;

public class RoomBookingEmployeeIdDto : UpcomingRoomBookingsDto
{
    public long RoomId { get; set; }
    public long EmployeeId { get; set; }
}