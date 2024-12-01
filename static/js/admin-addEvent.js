document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('addEventForm');
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const eventId = urlParams.get('id');
    
    // Update page title and button text based on mode
    if (mode === 'edit') {
        document.querySelector('h2').textContent = 'Edit Event';
        document.querySelector('button[type="submit"]').textContent = 'Update';
        // Load event data
        loadEventData(eventId);
    }

    //get venue from database:
    let areaData = [];
    const venueList = document.getElementById('venue');
    try {
        const response = await fetch('/api/seats');
        if (!response.ok) {
          throw new Error('Failed to fetch seats from database');
        }
        areaData = await response.json();
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to load venue data. Please try again.');
      }
    console.log('venueData', areaData);
    areaData.forEach((venue) => {
        const option = document.createElement('option');
        option.value = venue.venueName;
        option.textContent = venue.venueName;
        venueList.appendChild(option);
      });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value.trim(),
            description: document.getElementById('description').value.trim(),
            eventTime: document.getElementById('eventTime').value,
            venue: document.getElementById('venue').value
        };

        if (formData.venue === 'default') {
            alert('Please select a venue');
            return;
        }

        try {
            const url = mode === 'edit' ? `/api/events/${eventId}` : '/api/events';
            const method = mode === 'edit' ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save event');
            }

            const result = await response.json();
            alert(mode === 'edit' ? 'Event updated successfully!' : 'Event created successfully!');
            window.location.href = './admin-eventManagement.html';
            
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Failed to save event. Please try again.');
        }
    });
});

async function loadEventData(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch event data');
        }
        
        const event = await response.json();
        
        // Populate form fields
        document.getElementById('title').value = event.title;
        document.getElementById('description').value = event.description;
        
        // Format date-time for input field
        const eventDate = new Date(event.eventTime);
        const formattedDate = eventDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
        document.getElementById('eventTime').value = formattedDate;
        
        document.getElementById('venue').value = event.venue;
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load event data. Please try again.');
    }
} 