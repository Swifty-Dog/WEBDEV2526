public class Reservation
{
    public int Id { get; set; }

    public string ReservedBy { get; set; }

    public string RoomID { get; set; }

    public string ReservationType { get; set; }

    public string ReservationDate { get; set; }

    public int TimeslotID { get; set; }


    public Reservation(int id, string reservedBy, string roomID, string reservationType, string reservationDate, int timeslotID)
    {
        Id = id;
        ReservedBy = reservedBy;
        RoomID = roomID;
        ReservationType = reservationType;
        ReservationDate = reservationDate;
        TimeslotID = timeslotID;
    }

}