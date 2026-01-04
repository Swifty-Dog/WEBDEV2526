using OfficeCalendar.API.DTOs.Events.Response;
using OfficeCalendar.API.Models;
namespace OfficeCalendar.API.Services.Results.Events;

public abstract record CreateEventResult
{
    public sealed record Success(EventResponseDto eventDto) : CreateEventResult;
    public sealed record Error(string Message) : CreateEventResult;
}