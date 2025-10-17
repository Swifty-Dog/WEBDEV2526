namespace EventApi.Models;

public class TimeSlot
{

    public int Id { get; set; }

    public string StartTime { get; set; }

    public string EndTime { get; set; }

    public TimeSlot(int id, string startTime, string endTime)
    {
        Id = id;
        StartTime = startTime;
        EndTime = endTime;
    }
}