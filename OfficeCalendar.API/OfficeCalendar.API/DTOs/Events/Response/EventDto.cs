namespace OfficeCalendar.API.DTOs.Events.Response;

public class EventDto
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime EventDate { get; set; }
    public string? RoomName { get; set; }
    public string? Location { get; set; }
    public List<string> Attendees { get; set; } = new();
    public bool Attending { get; set; }
}
