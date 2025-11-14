using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.DTOs.Events.Response;

public class EventResponseDto
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime EventDate { get; set; }
    public long CreatedById { get; set; }
    public long? RoomId { get; set; }

}
