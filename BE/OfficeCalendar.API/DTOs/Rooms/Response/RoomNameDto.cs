namespace OfficeCalendar.API.DTOs.Rooms.Response;

public class RoomNameDto
{
    public long Id { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string Location { get; set; } = string.Empty;
}
