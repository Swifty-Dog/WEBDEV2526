using OfficeCalendar.API.DTOs.Events.Response;
namespace OfficeCalendar.API.Services.Results.Events;

public abstract record UpdateEventResult
{
    public sealed record Success(EventResponseDto Dto) : UpdateEventResult;
    public sealed record InvalidCredentials(string Message) : UpdateEventResult;
    public sealed record NotFound : UpdateEventResult;
    public sealed record Error(string Message) : UpdateEventResult;
}