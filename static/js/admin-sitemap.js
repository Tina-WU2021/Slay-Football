document.addEventListener('DOMContentLoaded', async () => {
  let areaData = [];
  let selectedVenueNameForDelete;
  let matchedVenueIDForEditAndDelete;

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

  //change to get from database
  // const response = await fetch("../venue-seat.json");
  // const data = await response.json();
  const data = areaData;
  const selectedVenue = document.getElementById('selected-venue');
  const stadiumText = document.getElementById('stadium-text');

  //map all venue from the database
  areaData.forEach((venue) => {
    const option = document.createElement('option');
    option.value = venue.venueName;
    option.textContent = venue.venueName;
    selectedVenue.appendChild(option);
  });

  //handle when user change the venue to display the seats
  selectedVenue.addEventListener('change', () => {
    const selectedValue = selectedVenue.value;

    const matchedVenue = data.find((venue) => venue.venueName === selectedValue);
    selectedVenueNameForDelete = matchedVenue.venueName;
    matchedVenueIDForEditAndDelete = matchedVenue._id;
    console.log('selectedVenueNameForDelete', selectedVenueNameForDelete);
    console.log('matchedVenueIDForDelete', matchedVenueIDForEditAndDelete);

    if (matchedVenue) {
      console.log('Selected Venue:', matchedVenue.venueName);
      stadiumText.textContent = matchedVenue.venueName;
      areaData = matchedVenue;
      console.log('areaData', areaData);

      const allSeatMap = document.getElementById('adminSeatMap');
      allSeatMap.innerHTML = '';

      const svgWidth = 500;
      const svgHeight = 300;
      const seatWidth = 40;
      const seatHeight = 40;
      const marginX = 10;
      const marginY = 10;

      //   console.log("areaList", areaList);
      areaData.areaList.forEach((area) => {
        const areaInfo = areaData[area];
        const areaDiv = document.createElement('div');
        areaDiv.classList.add('col-md-5', 'bg-white', 'rounded-4', 'm-3', 'border', 'border-dark-subtle');
        areaDiv.style.minWidth = '500px';
        areaDiv.innerHTML = `<h5 class="pt-3 text-center">${area}</h5>
         <div class="text-center text-secondary">Upper rows are closer to the court.</div>`;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', svgWidth);
        svg.setAttribute('height', svgHeight);
        areaDiv.appendChild(svg);

        areaInfo.forEach((row) => {
          const y = (row.row - 1) * (seatHeight + marginY) + 30;
          console.log('row', row);
          row.seatsData.forEach((seat) => {
            const x =
              (seat.column - 1) * (seatWidth + marginX) + svgWidth / 2 - (row.seats * (seatWidth + marginX)) / 2;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
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

        allSeatMap.appendChild(areaDiv);
      });
    } else {
      console.log('No matching venue found.');
    }
  });

  //user click the delete button
  const deleteVenueButton = document.getElementById('deleteVenueButton');
  deleteVenueButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (selectedVenueNameForDelete == undefined) {
      return;
    }
    if (!confirm(`Are you sure you want to delete Venue: ${selectedVenueNameForDelete}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/seats/${matchedVenueIDForEditAndDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete Venue');
      }

      alert('Venue deleted successfully');
      location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete venue. Please try again.');
    }
  });

  //user click the delete button
  const editVenueButton = document.getElementById('editVenueButton');
  editVenueButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (selectedVenueNameForDelete == undefined) {
      return;
    }
    if (confirm(`Go to edit Venue: ${selectedVenueNameForDelete}?`)) {
      //redirect
      const selectedVenueName = encodeURIComponent(selectedVenueNameForDelete);
      window.location.href = `./admin-addVenue.html?venueName=${selectedVenueName}`;
    }
  });
});


