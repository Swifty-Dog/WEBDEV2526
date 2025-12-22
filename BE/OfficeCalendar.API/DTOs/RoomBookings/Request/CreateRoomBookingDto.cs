namespace OfficeCalendar.API.DTOs.RoomBookings.Request;

public class CreateRoomBookingDto
{
    public long? Id { get; set; }
    public long RoomId { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public DateOnly BookingDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string Purpose { get; set; } = string.Empty;
}
