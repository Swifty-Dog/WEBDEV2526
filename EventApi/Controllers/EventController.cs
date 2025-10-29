using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventApi.Data;
using EventApi.Models;

namespace EventApi.Controllers;
//Geef juiste route aan voor de controller
// Controleer de tasks en pas ze aan indien nodig
[ApiController]
[Route("api/[controller]")]
public class EventController : ControllerBase
{
    private readonly AppDbContext _context;
    public EventController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Route("https:/Calendar.com/events")]
    public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
    {
        return await _context.Events.ToListAsync();
    }

    [HttpPost]
    [Route("https:/Calendar.com/events")]
    public async Task<ActionResult<Event>> CreateEvent(Event newEvent)
    {
        _context.Events.Add(newEvent);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetEvents), new { id = newEvent.Id }, newEvent);
    }

    [HttpPut]
    [Route("https:/Calendar.com/events/{id}")]
    public async Task<IActionResult> UpdateEvent(int id, Event updatedEvent)
    {
        if (id != updatedEvent.Id)
        {
            return BadRequest();
        }

        _context.Entry(updatedEvent).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Events.Any(e => e.Id == id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete]
    [Route("https:/Calendar.com/events/{id}")]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        var existingEvent = await _context.Events.FindAsync(id);
        if (existingEvent == null)
        {
            return NotFound();
        }

        _context.Events.Remove(existingEvent);
        await _context.SaveChangesAsync();

        return NoContent();
    }


}