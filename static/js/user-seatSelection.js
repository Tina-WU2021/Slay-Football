document.addEventListener('DOMContentLoaded', async () => {
  const selectedArea = document.getElementById('buy-seatArea');
  //Get all data from database

  let eventSeatData = [];
  let matchedEvent = [];
  let matchedEventIDForUpdate;
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

  //get current event page eventid
  const urlParams = new URLSearchParams(window.location.search);
  const currentEventId = urlParams.get('eventId');

  matchedEvent = eventSeatData.find((event) => event.eventID === currentEventId);
  matchedEventIDForUpdate = matchedEvent._id;

  if (matchedEvent) {
    console.log('matchedEvent', matchedEvent);
    //Processing data
    document.getElementById('buy-eventName').textContent = matchedEvent.eventName;
    document.getElementById('buy-venueName').textContent = `Venue: ${matchedEvent.venueName}`;
    const eventDateFromData = new Date(matchedEvent.eventTime);
    const formattedDate = eventDateFromData.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'CET',
    });
      document.getElementById('buy-dateDisplay').textContent = `Date: ${formattedDate}`;
      
      const seatArea = document.getElementById('buy-seatArea');
      matchedEvent.areaList.forEach((venue) => {
        const option = document.createElement('option');
        option.value = venue;
        option.textContent = venue;
        seatArea.appendChild(option);
      });
  } else {
    console.log('No matching venue found.');
  }

  let selectedTicketArea = '';
  selectedArea.addEventListener('change', (event) => {
    selectedTicketArea = event.target.value;
    console.log('selectedValue', selectedTicketArea);
    renderSeatMapBySelection(matchedEvent, selectedTicketArea);
  });

  //handle after submit
  let selectedSeats = [];
  let formData = {};
  document.getElementById('book-tickets').addEventListener('click', async (event) => {
    event.preventDefault();
    // const selectedArea = document.querySelector('.area-box.selected');
    const displayPrice = document.getElementById('total-price');
    console.log('price:', displayPrice.textContent);
    if (!displayPrice.textContent || displayPrice.textContent == 0) {
      alert('Please select a seat');
      return;
    }
    console.log('proceeded to here');

    const username = localStorage.getItem('username');

    if (!username) {
      alert('Please login first');
      window.location.href = '/auth-login.html';
      return;
    }
    updateEventSeatStatus(matchedEvent, selectedTicketArea, selectedSeats);
    const urlParams = new URLSearchParams(window.location.search);
    const currentEventId = urlParams.get('eventId');
    console.log('currentEventId', currentEventId);

    formData = {
      username: username,
      eventID: currentEventId,
      paidAmount: displayPrice.textContent,
      paidTime: new Date().toISOString(),
      venueName: matchedEvent.venueName,
      TicketNO: selectedSeats.length,
      seatArea: selectedTicketArea,
      seatPurchased: selectedSeats,
    };
    console.log('formData', formData);
    //   $('#paymentModal').modal('show');
    document.getElementById('payment-form-popup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    // Close the pop-up when the cancel button is clicked
    document.getElementById('close-popup').addEventListener('click', () => {
      document.getElementById('payment-form-popup').style.display = 'none';
      document.getElementById('overlay').style.display = 'none';
    });

    // Close the pop-up when overlay is clicked
    document.getElementById('overlay').addEventListener('click', () => {
        document.getElementById('payment-form-popup').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    });
  });

  //handle after payment

  document.getElementById('confirm-payment').addEventListener('click', async (event) => {
    event.preventDefault();
    //update eventSeatStatus

    try {
      const response = await fetch(`/api/eventSeatStatus/${matchedEventIDForUpdate}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchedEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to update eventSeatStatus');
      }
      console.log('eventSeatStatus updated successfully');
    } catch (error) {
      console.error('Error updating eventSeatStatus:', error);
    }

    // add ticket record
    try {
      const response = await fetch('/api/ticketRecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save eventSeatStatus');
      }

        const result = await response.json();
        console.log('result',result,result.ticketId);
      alert('Booked successfully!', result.ticketId);
       
      window.location.href = `./ticketDisplayAfterPay.html?id=${result.ticketId}`;
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Failed to save eventSeatStatus. Please try again.');
    }
  });

  async function renderSeatMapBySelection(eventSeatData, selectedArea) {
    //change to match with the venue name
    //   const seats = data[0][selectedArea];
    const seats = eventSeatData[selectedArea];
    console.log('seats', seats);
    // console.log("selectedArea",selectedArea)

    const svg = document.getElementById('seatMap');
    svg.innerHTML = '';
    const seatWidth = 40;
    const seatHeight = 40;
    const marginX = 10;
    const marginY = 10;

    const maxSeatsInRow = Math.max(...seats.map((row) => row.seats));

    const svgWidth = maxSeatsInRow * (seatWidth + marginX);
    svg.setAttribute('viewBox', `0 0 ${svgWidth} 300`);

    seats.forEach((row) => {
      const y = (row.row - 1) * (seatHeight + marginY) + 30;

      row.seatsData.forEach((seat) => {
        const x = (seat.column - 1) * (seatWidth + marginX) + svgWidth / 2 - (row.seats * (seatWidth + marginX)) / 2;

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('class', `seat ${seat.status}`);
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', seatWidth);
        rect.setAttribute('height', seatHeight);
        rect.setAttribute('data-status', seat.status);
        rect.setAttribute('data-price', row.price);
        rect.setAttribute('data-row', row.row);
        rect.setAttribute('data-column', seat.column);
        svg.appendChild(rect);

        const priceText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        priceText.setAttribute('x', x + seatWidth / 2);
        priceText.setAttribute('y', y + seatHeight / 2 + 5);
        priceText.setAttribute('text-anchor', 'middle');
        priceText.setAttribute('font-size', '13');
        priceText.textContent = `$${row.price}`;
        svg.appendChild(priceText);
      });
    });
    handleSeatSelection();
  }

  function handleSeatSelection() {
    let totalPrice = 0;
    const displayPrice = document.getElementById('total-price');
    console.log('displayPrice', displayPrice.value);
    document.querySelectorAll('.seat').forEach((seat) => {
      seat.addEventListener('click', function () {
        if (this.dataset.status === 'available') {
          this.classList.toggle('selected');

          const seatPrice = parseInt(this.dataset.price);
          const seatRow = this.dataset.row;
          const seatColumn = this.dataset.column;
          if (this.classList.contains('selected')) {
            totalPrice += seatPrice;
            selectedSeats.push({ row: seatRow, column: seatColumn }); // Add seat to selected
          } else {
            totalPrice -= seatPrice;
            // Remove seat from selected
            selectedSeats = selectedSeats.filter((seat) => !(seat.row === seatRow && seat.column === seatColumn));
          }

          console.log('Total Price:', totalPrice);
        } else if (this.dataset.status === 'occupied') {
          alert('This seat is occupied.');
        }

        displayPrice.textContent = totalPrice;
      });
    });
  }

  async function updateEventSeatStatus(matchedEventData, selectedArea, selectedSeats) {
    console.log('matchedEventData', matchedEventData, 'selectedArea', selectedArea, 'selectedSeats', selectedSeats);

    const areaData = matchedEventData[selectedArea];
    selectedSeats.forEach((seat) => {
      matchedEventData[selectedArea].forEach((row) => {
        if (row.row == seat.row) {
          const seatData = row.seatsData.find((s) => s.column == seat.column); // Use == for comparison
          if (seatData) {
            seatData.status = 'occupied';
          }
        }
      });
    });
    console.log('Updated Event Data:', matchedEventData);

    // t
  }
});
