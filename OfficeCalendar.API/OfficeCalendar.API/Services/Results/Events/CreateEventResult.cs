using OfficeCalendar.API.DTOs.Events.Response;
using OfficeCalendar.API.Models;
namespace OfficeCalendar.API.Services.Results.Events;

public abstract record CreateEventResult
{
    public sealed record Success(EventModel eventModel) : CreateEventResult;
    public sealed record InvalidCredentials(string Message) : CreateEventResult;
    public sealed record NotFound : CreateEventResult;
    public sealed record Error(string Message) : CreateEventResult;
}