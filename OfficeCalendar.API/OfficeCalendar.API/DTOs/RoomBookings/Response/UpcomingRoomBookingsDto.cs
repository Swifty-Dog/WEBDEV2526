namespace OfficeCalendar.API.DTOs.RoomBookings.Response;

public class UpcomingRoomBookingsDto
{
    public long Id { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public DateOnly BookingDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string Purpose { get; set; } = string.Empty;
}
