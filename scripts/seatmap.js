document.addEventListener('DOMContentLoaded', async () => {
    
    const selectedArea = document.getElementById('ticket-type');
    
    selectedArea.addEventListener('change', (event) => {
        // const selectedValue = event.target.value;
        // console.log("selectedValue", event.target.value)
        renderSeatMapBySelection(event.target.value);
    });

    
})

async function renderSeatMapBySelection(selectedArea) {
    //change to get from database
    const response = await fetch('../dataStructure/venue-seat.json'); 
    const data = await response.json(); 

    //change to match with the venue name
    const seats = data[0][selectedArea];
    console.log("seats",seats)

    // console.log("selectedArea",selectedArea)

    const svg = document.getElementById('seatMap');
    const seatWidth = 40;
    const seatHeight = 40;
    const marginX = 10;
    const marginY = 10;

    const maxSeatsInRow = Math.max(...seats.map(row => row.seats));

    const svgWidth = (maxSeatsInRow * (seatWidth + marginX)); 
    svg.setAttribute('viewBox', `0 0 ${svgWidth} 300`); 

    seats.forEach(row => {
        const y = (row.row - 1) * (seatHeight + marginY) + 30; 

        row.seatsData.forEach(seat => {
            const x = (seat.column - 1) * (seatWidth + marginX) + (svgWidth / 2) - ((row.seats * (seatWidth + marginX)) / 2) ; 
        
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute('class', `seat ${seat.status}`);
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', seatWidth);
            rect.setAttribute('height', seatHeight);
            rect.setAttribute('data-status', seat.status);
            rect.setAttribute('data-price', seat.price);

            svg.appendChild(rect);
        });
    });
    handleSeatSelection();
}

function handleSeatSelection() {
    document.querySelectorAll('.seat').forEach(seat => {
        seat.addEventListener('click', function() {
            if (this.dataset.status === 'available') {
                document.querySelectorAll('.selected').forEach(selectedSeat => {
                    selectedSeat.classList.remove('selected');
                });
                this.classList.add('selected');
            } else if (this.dataset.status === 'occupied') {
                alert('This seat is occupied.');
            }
        });
    });
}