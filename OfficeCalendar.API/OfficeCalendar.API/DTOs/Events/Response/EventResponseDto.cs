using OfficeCalendar.API.Models;
using OfficeCalendar.API.DTOs.Rooms.Response;
namespace OfficeCalendar.API.DTOs.Events.Response;

public class EventResponseDto
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime EventDate { get; set; }
    public RoomDto? Room { get; set; }
    public int AttendeesCount { get; set; }

}
