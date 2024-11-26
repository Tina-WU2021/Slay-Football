document.addEventListener('DOMContentLoaded', function() {
    fetchEvents();
});

async function fetchEvents() {
    try {
        const response = await fetch('/api/events');
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load events. Please try again.');
    }
}

function displayEvents(events) {
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = ''; // Clear existing content

    events.forEach(event => {
        const eventDate = new Date(event.eventTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const eventItem = `
            <div class="list-group-item" data-event-id="${event._id}">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h5 class="mb-1">${event.title}</h5>
                        <p class="mb-1">Date: ${eventDate}</p>
                        <p class="mb-1">Stadium: ${event.venue}</p>
                        <p class="mb-1">${event.description}</p>
                        <div class="mt-2">
                            <button class="btn btn-primary btn-sm edit-event" onclick="editEvent('${event._id}')">Edit</button>
                            <button class="btn btn-danger btn-sm delete-event" onclick="deleteEvent('${event._id}')">Delete</button>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <img src="assets/football match1.png" alt="match" class="img-fluid rounded-4">
                    </div>
                </div>
            </div>
        `;
        eventList.innerHTML += eventItem;
    });
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }

    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete event');
        }

        alert('Event deleted successfully');
        fetchEvents(); // Refresh the list
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete event. Please try again.');
    }
}

function editEvent(eventId) {
    // Redirect to add event page with event ID
    window.location.href = `./admin-addEvent.html?mode=edit&id=${eventId}`;
} 