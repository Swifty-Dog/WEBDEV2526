namespace OfficeCalendar.API.DTOs.Events.Response;

public class EventResponseDto
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly EventDate { get; set; } = DateOnly.FromDateTime(DateTime.Today);
    public DateTime StartTime { get; set; } = DateTime.Now;
    public DateTime EndTime { get; set; } = DateTime.Now;
    public RoomDto? Room { get; set; }
    public List<string> Attendees { get; set; } = new List<string>();
    public bool Attending { get; set; }
}
