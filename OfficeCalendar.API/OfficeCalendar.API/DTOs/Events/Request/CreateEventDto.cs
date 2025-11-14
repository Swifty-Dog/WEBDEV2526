using OfficeCalendar.API.Models;
namespace OfficeCalendar.API.DTOs.Events.Request;

public class CreateEventDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime EventDate { get; set; }
    public long CreatedById { get; set; }
    public long? RoomId { get; set; }


}