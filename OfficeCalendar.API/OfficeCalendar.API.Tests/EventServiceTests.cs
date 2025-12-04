using Moq;
using OfficeCalendar.API.Services;
using OfficeCalendar.API.Services.Results.Events;
using OfficeCalendar.API.DTOs.Events.Request;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Models;
using Xunit;

namespace OfficeCalendar.API.Tests
{
    public class EventServiceTests
    {
        private readonly Mock<IEventRepository> _repo;
        private readonly EventService _service;

        public EventServiceTests()
        {
            _repo = new Mock<IEventRepository>();
            _service = new EventService(_repo.Object);
        }

        #region CreateEvent

        [Fact]
        public async Task CreateEvent_ShouldReturnSuccess()
        {
            _repo.Setup(r => r.Create(It.IsAny<EventModel>()))
                 .ReturnsAsync(true);

            var dto = new CreateEventDto
            {
                Title = "Test"
            };

            var result = await _service.CreateEvent(dto);

            Assert.IsType<CreateEventResult.Success>(result);
        }

        [Fact]
        public async Task CreateEvent_ShouldReturnError_WhenFailed()
        {
            _repo.Setup(r => r.Create(It.IsAny<EventModel>()))
                .ReturnsAsync(false);

            var result = await _service.CreateEvent(new CreateEventDto());

            Assert.IsType<CreateEventResult.Error>(result);
        }

        #endregion

        #region GetEvent

        [Fact]
        public async Task GetEventById_ShouldReturnSuccess()
        {
            _repo.Setup(r => r.GetById(1))
                .ReturnsAsync(new EventModel { Id = 1 });

            var result = await _service.GetEventById(1);

            Assert.IsType<GetEventResult.Success>(result);
        }

        [Fact]
        public async Task GetEventById_ShouldReturnError_WhenMissing()
        {
            _repo.Setup(r => r.GetById(1))
                .ReturnsAsync((EventModel?)null);

            var result = await _service.GetEventById(1);

            Assert.IsType<GetEventResult.Error>(result);
        }

        [Fact]
        public async Task GetAllEvents_ShouldReturnSuccess()
        {
            var list = new List<EventModel>
            {
                new EventModel { Id = 1 }
            };

            _repo.Setup(r => r.GetAllEvents())
                .ReturnsAsync(list);

            var result = await _service.GetAllEvents();

            Assert.IsType<GetEventsResult.Success>(result);
        }

        #endregion

        #region UpdateEvent

        [Fact]
        public async Task UpdateEvent_ShouldReturnNotFound()
        {
            _repo.Setup(r => r.GetById(1))
                .ReturnsAsync((EventModel?)null);

            var dto = new UpdateEventDto { Id = 1 };

            var result = await _service.UpdateEvent(dto);

            Assert.IsType<UpdateEventResult.NotFound>(result);
        }
        #endregion

        #region DeleteEvent

        [Fact]

        public async Task DeleteEvent_ShouldReturnNotFound()
        {
            _repo.Setup(r => r.GetById(1))
                .ReturnsAsync((EventModel?)null);

            var result = await _service.DeleteEvent(1);

            Assert.IsType<DeleteEventResult.NotFound>(result);
        }

        [Fact]
        public async Task DeleteEvent_ShouldReturnSuccess()
        {
            _repo.Setup(r => r.GetById(1))
                .ReturnsAsync(new EventModel { Id = 1 });

            _repo.Setup(r => r.Delete(1))
                .ReturnsAsync(true);

            var result = await _service.DeleteEvent(1);

            Assert.IsType<DeleteEventResult.Success>(result);
        }

        #endregion
    }
}
