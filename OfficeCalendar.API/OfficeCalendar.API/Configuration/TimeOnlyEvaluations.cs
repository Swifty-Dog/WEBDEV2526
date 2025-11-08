using System.Globalization;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace OfficeCalendar.API.Configuration;

public class TimeOnlyToStringConverter : ValueConverter<TimeOnly, string>
{
    public TimeOnlyToStringConverter()
        : base(
            timeOnly => timeOnly.ToString("HH:mm", CultureInfo.InvariantCulture),
            dbString => TimeOnly.ParseExact(dbString, "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None))
    { }
}

public class TimeOnlyComparer : ValueComparer<TimeOnly>
{
    public TimeOnlyComparer() : base(
        (time1, time2) => time1.Ticks == time2.Ticks,
        time => time.GetHashCode(),
        time => new TimeOnly(time.Ticks))
    { }
}
