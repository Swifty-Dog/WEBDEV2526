using OfficeCalendar.API.DTOs.Events.Response;
using OfficeCalendar.API.Models;
namespace OfficeCalendar.API.Services.Results.Events;

public abstract record UpdateEventResult
{
    public sealed record Success(EventResponseDto eventDto) : UpdateEventResult;
    public sealed record NotFound(string Message) : UpdateEventResult;
    public sealed record Error(string Message) : UpdateEventResult;
}