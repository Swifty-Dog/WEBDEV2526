public class Timeslot
{

    public int Id { get; set; }

    public string StartTime { get; set; }

    public string EndTime { get; set; }

    public Timeslot(int id, string startTime, string endTime)
    {
        Id = id;
        StartTime = startTime;
        EndTime = endTime;
    }
}