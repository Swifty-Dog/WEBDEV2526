// Dashboard JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize current date
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    // Dutch month names
    const monthNames = [
        'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
        'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
    ];
    
    // Sample events data
    const events = {
        '2025-10-01': ['Team Meeting'],
        '2025-10-03': ['Client Call'],
        '2025-10-07': ['Project Review'],
        '2025-10-10': ['Birthday Party'],
        '2025-10-15': ['Conference'],
        '2025-10-20': ['Workshop'],
        '2025-10-25': ['Team Building'],
        '2025-10-31': ['Halloween Party']
    };
    
    function initCalendar() {
        console.log('Initializing calendar...');
        updateCalendarHeader();
        generateCalendarDays();
    }
    
    function updateCalendarHeader() {
        const monthYearElement = document.getElementById('monthYear');
        
        if (monthYearElement) {
            monthYearElement.textContent = monthNames[currentMonth] + ' ' + currentYear;
        }
        
        const subtitle = document.querySelector('.calendar-subtitle');
        if (subtitle) {
            subtitle.textContent = 'Klik op een dag voor details';
        }
    }
    
    function generateCalendarDays() {
        console.log('Generating calendar days...');
        const calendarDays = document.getElementById('calendarDays');
        
        if (!calendarDays) {
            console.error('Calendar days container not found!');
            return;
        }
        
        calendarDays.innerHTML = '';
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;
        
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
        
        // Previous month days
        for (let i = startDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = createDayElement(day, true);
            calendarDays.appendChild(dayElement);
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = createDayElement(day, false);
            
            const today = new Date();
            if (currentYear === today.getFullYear() && 
                currentMonth === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            const dateString = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
            if (events[dateString]) {
                dayElement.classList.add('has-event');
                dayElement.title = 'Events: ' + events[dateString].join(', ');
            }
            
            calendarDays.appendChild(dayElement);

            // Wire the day to show events in the right-side events panel
            // (keep existing selection click behavior in createDayElement)
            dayElement.addEventListener('click', function() {
                showDayEvents(dateString);
            });
        }
        
        // Next month days
        const totalCellsUsed = startDay + daysInMonth;
        const remainingCells = totalCellsUsed <= 35 ? (35 - totalCellsUsed) : (42 - totalCellsUsed);
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = createDayElement(day, true);
            calendarDays.appendChild(dayElement);
        }
        
        console.log('Calendar generated with ' + calendarDays.children.length + ' total days');
    }
    
    function createDayElement(day, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        dayElement.addEventListener('click', function() {
            document.querySelectorAll('.calendar-day.selected').forEach(function(el) {
                el.classList.remove('selected');
            });
            
            if (!isOtherMonth) {
                dayElement.classList.add('selected');
            }
        });
        
        return dayElement;
    }

    // Show events for a given dateString (format YYYY-MM-DD) in the right-side events panel
    function showDayEvents(dateString) {
        const eventsSection = document.querySelector('.events-list');
        const subtitle = document.querySelector('.calendar-subtitle');

        if (!eventsSection) return;

        // Clear existing events
        eventsSection.innerHTML = '';

        const dayEvents = events[dateString];

        if (dayEvents && dayEvents.length) {
            // Update subtitle
            if (subtitle) subtitle.textContent = dateString + ': ' + dayEvents.length + ' event(s)';

            // Create event items
            dayEvents.forEach(ev => {
                const item = document.createElement('div');
                item.classList.add('event-item');

                const time = document.createElement('div');
                time.classList.add('event-time');
                time.textContent = '--:--'; // placeholder time

                const details = document.createElement('div');
                details.classList.add('event-details');
                const h4 = document.createElement('h4');
                h4.textContent = ev;
                const p = document.createElement('p');
                p.textContent = 'Klik voor details...';

                details.appendChild(h4);
                details.appendChild(p);

                const status = document.createElement('div');
                status.classList.add('event-status');
                status.textContent = '📅';

                item.appendChild(time);
                item.appendChild(details);
                item.appendChild(status);

                eventsSection.appendChild(item);
            });
        } else {
            if (subtitle) subtitle.textContent = 'Geen events voor geselecteerde dag';

            const empty = document.createElement('div');
            empty.classList.add('event-item');
            empty.style.justifyContent = 'center';
            empty.style.textAlign = 'center';
            empty.style.padding = '20px';
            empty.textContent = 'Geen events';
            eventsSection.appendChild(empty);
        }
    }
    
    function previousMonth() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        initCalendar();
    }
    
    function nextMonth() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        initCalendar();
    }
    
    // Initialize calendar
    initCalendar();
    
    // Add event listeners
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', previousMonth);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextMonth);
    }
});

