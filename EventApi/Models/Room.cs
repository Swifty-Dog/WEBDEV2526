public class Room
{
    public string RoomNumber { get; set; }

    public string RoomType { get; set; }

    public int MaxCApacity { get; set; }

    public Room(string roomNumber, string roomType, int maxCapacity)
    {
        RoomNumber = roomNumber;
        RoomType = roomType;
        MaxCApacity = maxCapacity;
    }
}