using OfficeCalendar.API.DTOs.Events.Response;
using OfficeCalendar.API.Models;
namespace OfficeCalendar.API.Services.Results.Events;

public abstract record GetEventResult
{
    public sealed record Success(EventResponseDto eventDto) : GetEventResult;
    public sealed record Error(string Message) : GetEventResult;
}