namespace OfficeCalendar.API.DTOs.Rooms.Request;

public class CreateRoomRequest
{
    public string RoomName { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string Location { get; set; } = string.Empty;
}
