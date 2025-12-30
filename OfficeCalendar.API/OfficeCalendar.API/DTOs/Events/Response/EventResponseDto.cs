using OfficeCalendar.API.Models;
using OfficeCalendar.API.DTOs.Rooms.Response;
namespace OfficeCalendar.API.DTOs.Events.Response;

public class EventResponseDto
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly EventDate { get; set; } = DateOnly.FromDateTime(DateTime.Today);
    public TimeOnly StartTime { get; set; } = TimeOnly.FromDateTime(DateTime.Now);
    public TimeOnly EndTime { get; set; } = TimeOnly.FromDateTime(DateTime.Now);
    public RoomDto? Room { get; set; }
    public List<string> Attendees { get; set; } = new();
    public bool Attending { get; set; }

}
