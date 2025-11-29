using OfficeCalendar.API.DTOs.Events.Response;
using OfficeCalendar.API.Models;
namespace OfficeCalendar.API.Services.Results.Events;

public abstract record GetEventsResult
{
    public sealed record Success(List<EventModel> eventModelList) : GetEventsResult;
    public sealed record InvalidCredentials(string Message) : GetEventsResult;
    public sealed record NotFound : GetEventsResult;
    public sealed record Error(string Message) : GetEventsResult;
}