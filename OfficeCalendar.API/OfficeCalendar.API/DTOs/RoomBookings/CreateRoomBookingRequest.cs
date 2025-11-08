namespace OfficeCalendar.API.DTOs.RoomBookings;

public class CreateRoomBookingRequest
{
    public long RoomId { get; set; }
    public long EmployeeId { get; set; }
    public DateOnly BookingDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string Purpose { get; set; } = string.Empty;
}
