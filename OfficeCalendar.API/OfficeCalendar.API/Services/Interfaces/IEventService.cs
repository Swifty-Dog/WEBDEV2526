using OfficeCalendar.API.Models;
using OfficeCalendar.API.DTOs.Events.Request;
using OfficeCalendar.API.Services.Results.Events;

namespace OfficeCalendar.API.Services.Interfaces;

public interface IEventService
{
    public Task<CreateEventResult> CreateEvent(CreateEventDto newEventDto);

    public Task<GetEventResult> GetEventById(long eventId);

    public Task<IEnumerable<GetEventResult>> GetAllEvents();

    public Task<UpdateEventResult> UpdateEvent(UpdateEventDto updatedEventDto);

    public Task<DeleteEventResult> DeleteEvent(long eventId);

}