using OfficeCalendar.API.DTOs.Events.Response;
namespace OfficeCalendar.API.Services.Results.Events;

public abstract record GetEventResult
{
    public sealed record Success(EventResponseDto Dto) : GetEventResult;
    public sealed record InvalidCredentials(string Message) : GetEventResult;
    public sealed record NotFound : GetEventResult;
    public sealed record Error(string Message) : GetEventResult;
}