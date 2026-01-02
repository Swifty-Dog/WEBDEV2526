using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OfficeCalendar.API.Configuration;

public class JsonDateOnlyConverter : JsonConverter<DateOnly>
{
    private readonly string _format = "yyyy-MM-dd";
    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) =>
        DateOnly.ParseExact(reader.GetString()!, _format, CultureInfo.InvariantCulture);
    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value.ToString(_format));
}

public class JsonTimeOnlyConverter : JsonConverter<TimeOnly>
{
    private readonly string _format = "HH:mm";
    public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) =>
        TimeOnly.ParseExact(reader.GetString()!, _format, CultureInfo.InvariantCulture);
    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value.ToString(_format));
}
