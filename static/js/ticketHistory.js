async function fetchTicketHistory() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            throw new Error('请先登录');
        }

        const response = await fetch(`/api/ticketRecord/user/${username}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('获取票务记录失败');
        }

        const tickets = await response.json();
        console.log('tickets', tickets);
        
        const eventSeatData = await fetchEventSeatData();
        const matchedTickets = tickets.map(ticket => {
            const matchedEvent = eventSeatData.find(event => event.eventID === ticket.eventID);
            return { ...ticket, matchedEvent }; // Combine ticket with matched event
        });

        displayTickets(matchedTickets);
        // displayTickets(tickets);
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.list-group').innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${error.message || '无法加载票务历史记录'}
            </div>
        `;
    }

    

}

async function fetchEventSeatData() {
    let eventSeatData = [];
    try {
        const response = await fetch('/api/eventSeatStatus');
        if (!response.ok) {
            throw new Error('Failed to fetch seats from database');
        }
        eventSeatData = await response.json();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load venue data. Please try again.');
    }
    console.log('eventSeatData', eventSeatData);
    return eventSeatData;
}

function displayTickets(tickets) {
console.log('displayTickets', tickets);
     
    const listGroup = document.querySelector('.list-group');
    if (!tickets || tickets.length === 0) {
        listGroup.innerHTML = `
            <div class="list-group-item">
                <p class="mb-1">No ticket record found.</p>
            </div>
        `;
        return;
    }
    
    listGroup.innerHTML = tickets.map(ticket =>
        
        `
        <div class="list-group-item py-3 my-2" style="background-color: #f0f0f0; border: 1px solid #ccc">
            <h5 class="mb-1">Event: ${ticket.matchedEvent.eventName}</h5>
            <p class="mb-1">Date: ${new Date(ticket.matchedEvent.eventTime).toLocaleDateString()}</p>
            <p class="mb-1">Venue: ${ticket.matchedEvent.venueName}</p>
            <br/>
            <p class="mb-1">Paid: ${ticket.paidAmount}</p>
            <p class="mb-1">Paid time: ${new Date(ticket.paidTime).toLocaleString()}</p>
            <p class="mb-1">Number of tickets: ${ticket.TicketNO}</p>
            <p class="mb-1">Seats: ${ticket.seatPurchased.map((seat) => `Row ${seat.row}, Column ${seat.column}`).join(', ')}</p>
        </div>
    `).join('');
}

// 检查登录状态并加载票务历史
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = '/login.html';
    } else {
        fetchTicketHistory();
    }
}); 