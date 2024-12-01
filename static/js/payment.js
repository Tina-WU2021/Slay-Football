import { selectedSeats,matchedEvent} from './user-seatSelection';

document.getElementById('payment-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission

    document.getElementById('pay-eventName').textContent = matchedEvent.eventName;
    document.getElementById('buy-venueName').textContent = `Venue: ${matchedEvent.venueName}`;

    const seatList = document.getElementById('seatList');
    selectedSeats.forEach(seat => {
        const li = document.createElement('li');
        li.textContent = `Row: ${seat.row}, Column: ${seat.column}`;
        seatList.appendChild(li);
    });


    //handle after submit
    document.getElementById('confirm-payment').addEventListener('click', async () => {
        event.preventDefault();
        // const selectedArea = document.querySelector('.area-box.selected');
        const displayPrice = document.getElementById('total-price');
        console.log('price:', displayPrice.textContent);
        if (!displayPrice.textContent || displayPrice.textContent == 0) {
            alert('Please select a seating area');
            return;
        }
        console.log('proceeded to here');

        const username = localStorage.getItem('username');

        if (!username) {
            alert('Please login first');
            window.location.href = '/auth-login.html';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const currentEventId = urlParams.get('eventId');
        console.log('currentEventId', currentEventId);

        const formData = {
            username: username,
            eventID: currentEventId,
            paidAmount: displayPrice.textContent,
            paidTime: new Date().toISOString(),
            venueName: matchedEvent.venueName,
            TicketNO: selectedSeats.length,
            seatPurchased: selectedSeats,
        };
        console.log('formData', formData);
    });
})