namespace OfficeCalendar.API.Services.Results.Tokens;

public abstract record CreateJwtResult
{
    public sealed record Success(string Token) : CreateJwtResult;
    public sealed record ConfigError(string Message) : CreateJwtResult;
}
