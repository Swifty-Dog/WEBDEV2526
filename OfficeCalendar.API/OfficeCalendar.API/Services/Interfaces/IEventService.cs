using OfficeCalendar.API.Models;
using OfficeCalendar.API.DTOs.Events.Request;
using OfficeCalendar.API.Services.Results.Events;

namespace OfficeCalendar.API.Services.Interfaces;

public interface IEventService
{
    public Task<CreateEventResult> CreateEvent(long CurrentUserId, CreateEventDto newEventDto);

    public Task<GetEventResult> GetEventById(long eventId, long? currentUserId = null);

    public Task<GetEventsResult> GetAllEvents(long? currentUserId = null);

    public Task<UpdateEventResult> UpdateEvent(long EventId, UpdateEventDto updatedEventDto, long? currentUserId = null);

    public Task<DeleteEventResult> DeleteEvent(long eventId);

}