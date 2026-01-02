using Microsoft.AspNetCore.SignalR;

namespace OfficeCalendar.API.Hubs;

public static class GenericHubExtensions
{
    public static Task BroadcastEvent(this IHubContext<GenericHub> hubContext, string eventName, object? payload = null)
    {
        return hubContext.Clients.All.SendAsync(eventName, payload);
    }
}
