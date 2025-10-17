public class Event
{

    public int Id { get; set; }

    public string EventType { get; set; }

    public string EventName { get; set; }


    public Event(int id, string eventType, string eventName)
    {
        Id = id;
        EventType = eventType;
        EventName = eventName;
    }



}