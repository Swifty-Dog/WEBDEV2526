namespace OfficeCalendar.API.DTOs.Room.Request;

public class UpdateRoomRequest
{
    public long Id { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public int Capacity { get; set; } = 0;
    public string Location { get; set; } = string.Empty;
}
