using OfficeCalendar.API.DTOs.Events.Response;
namespace OfficeCalendar.API.Services.Results.Events;

public abstract record DeleteEventResult
{
    public sealed record Success : DeleteEventResult;
    public sealed record InvalidCredentials(string Message) : DeleteEventResult;
    public sealed record NotFound : DeleteEventResult;
    public sealed record Error(string Message) : DeleteEventResult;
}