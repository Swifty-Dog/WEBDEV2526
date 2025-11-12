namespace OfficeCalendar.API.DTOs.RoomBookings.Response;

public class RoomBookingDateDto
{
    public long RoomId { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}