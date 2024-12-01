document.addEventListener('DOMContentLoaded', async () => {
  //handle if access through update
  const urlParams = new URLSearchParams(window.location.search);
  const ticketID = urlParams.get('id');

  if (ticketID) {
    let ticketData = [];
    let eventSeatData = [];
    //ticket data
    try {
      const response = await fetch('/api/ticketRecord');
      if (!response.ok) {
        throw new Error('Failed to fetch ticketRecord from database');
      }
      ticketData = await response.json();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load venue data. Please try again.');
    }
    console.log('ticketData', ticketData);

    //eventData
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

    const matchedTicket = ticketData.find((ticket) => ticket._id === ticketID);
    const matchedEvent = eventSeatData.find((event) => event.eventID === matchedTicket.eventID);

    if (matchedTicket) {
      console.log('matchedTicket', matchedTicket);
      console.log('matchedEvent', matchedEvent);
      document.getElementById('ticket-eventName').textContent = matchedEvent.eventName;
      document.getElementById('ticket-dateDisplay').textContent = new Date(matchedEvent.eventTime).toLocaleDateString();
      document.getElementById('ticket-venueName').textContent = matchedEvent.venueName;
      document.getElementById('ticket-paidAmount').textContent = `$${matchedTicket.paidAmount}`;
      document.getElementById('ticket-paidTime').textContent = new Date(matchedTicket.paidTime).toLocaleString();
      document.getElementById('ticket-ticketNO').textContent = matchedTicket.TicketNO;
      const seats =
        matchedTicket.seatPurchased.map((seat) => `Row ${seat.row}, Column ${seat.column}`).join(', ') || 'N/A';
      document.getElementById('ticket-seatPurchased').textContent = seats;
    } else {
      console.log('No matching venue found.');
    }
  }
});
