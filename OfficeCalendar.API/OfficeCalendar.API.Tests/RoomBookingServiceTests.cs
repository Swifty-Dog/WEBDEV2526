using Moq;
using OfficeCalendar.API.DTOs.RoomBookings;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services;
using OfficeCalendar.API.Services.Results.RoomBookings;

namespace OfficeCalendar.API.Tests;

public class RoomBookingServiceTests
{
    #region Setup
    private readonly Mock<IRoomBookingRepository> _roomBookingRepoMock;
    private readonly RoomBookingService _roomBookingService;

    public RoomBookingServiceTests()
    {
        _roomBookingRepoMock = new Mock<IRoomBookingRepository>();
        _roomBookingService = new RoomBookingService(_roomBookingRepoMock.Object);
    }

    #endregion

    #region Create

    [Theory]
    [InlineData(1, 1, "2025-11-08", "10:00", "11:00")]
    [InlineData(2, 3, "2025-11-08", "14:00", "15:30")]
    public async Task CreateRoomBooking_ValidRequest_ReturnsSuccess(long roomId, long employeeId, string bookingDate, string startTime, string endTime)
    {
        // Arrange
        DateOnly date = DateOnly.Parse(bookingDate);
        TimeOnly start = TimeOnly.Parse(startTime);
        TimeOnly end = TimeOnly.Parse(endTime);

        var request = new CreateRoomBookingRequest
        {
            RoomId = roomId,
            EmployeeId = employeeId,
            BookingDate = date,
            StartTime = start,
            EndTime = end,
            Purpose = "Team Meeting"
        };

        _roomBookingRepoMock.Setup(repo => repo.Create(It.IsAny<RoomBookingModel>())).ReturnsAsync(true);

        // Act
        var result = await _roomBookingService.CreateRoomBooking(request);

        // Assert
        Assert.IsType<CreateRoomBookingResult.Success>(result);
        var successResult = result as CreateRoomBookingResult.Success;
        Assert.Equal(roomId, successResult!.RoomBooking.RoomId);
        Assert.Equal(employeeId, successResult.RoomBooking.EmployeeId);
        Assert.Equal(start, successResult.RoomBooking.StartTime);
        Assert.Equal(end, successResult.RoomBooking.EndTime);
    }

    [Fact]
    public async Task CreateRoomBooking_EndTimeBeforeStartTime_ReturnsInvalidData()
    {
        // Arrange
        var request = new CreateRoomBookingRequest
        {
            RoomId = 1,
            EmployeeId = 1,
            BookingDate = DateOnly.Parse("2025-11-08"),
            StartTime = TimeOnly.Parse("11:00"),
            EndTime = TimeOnly.Parse("10:00"),
            Purpose = "Team Meeting"
        };

        // Act
        var result = await _roomBookingService.CreateRoomBooking(request);

        // Assert
        Assert.IsType<CreateRoomBookingResult.InvalidData>(result);
    }

    [Fact]
    public async Task CreateRoomBooking_RoomNotAvailable_ReturnsRoomNotAvailable()
    {
        // Arrange
        var request = new CreateRoomBookingRequest
        {
            RoomId = 1,
            EmployeeId = 1,
            BookingDate = DateOnly.Parse("2025-11-08"),
            StartTime = TimeOnly.Parse("10:00"),
            EndTime = TimeOnly.Parse("11:00"),
            Purpose = "Team Meeting"
        };

        _roomBookingRepoMock
            .Setup(repo =>
                repo.GetOverlappingBooking(request.BookingDate, request.StartTime, request.EndTime, request.RoomId))
            .ReturnsAsync(new RoomBookingModel());

        // Act
        var result = await _roomBookingService.CreateRoomBooking(request);

        // Assert
        Assert.IsType<CreateRoomBookingResult.RoomNotAvailable>(result);
    }

    [Fact]
    public async Task CreateRoomBooking_RepositoryThrowsException_ReturnsError()
    {
        // Arrange
        var request = new CreateRoomBookingRequest
        {
            RoomId = 1,
            EmployeeId = 1,
            BookingDate = DateOnly.Parse("2025-11-08"),
            StartTime = TimeOnly.Parse("10:00"),
            EndTime = TimeOnly.Parse("11:00"),
            Purpose = "Team Meeting"
        };

        _roomBookingRepoMock
            .Setup(repo =>
                repo.GetOverlappingBooking(request.BookingDate, request.StartTime, request.EndTime, request.RoomId))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _roomBookingService.CreateRoomBooking(request);

        // Assert
        Assert.IsType<CreateRoomBookingResult.Error>(result);
    }

    #endregion

}