document.addEventListener('DOMContentLoaded', async () => {
  //handle if access through update
  const urlParams = new URLSearchParams(window.location.search);
  const venueName = urlParams.get('venueName');
  const addVenueVenueName = document.getElementById('addVenueVenueName');
  const whenUpdateDisplayPrevious = document.getElementById('whenUpdateDisplayPrevious');
  let matchedVenueIDForUpdate;

  if (venueName) {
    addVenueVenueName.value = decodeURIComponent(venueName);
    // console.log('addVenueVenueName',addVenueVenueName.value)
    
  let currentUpdatingVenueName = addVenueVenueName.value;
  let areaData = [];
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

  const matchedVenue = areaData.find((venue) => venue.venueName === currentUpdatingVenueName);
  matchedVenueIDForUpdate = matchedVenue._id;
  if (matchedVenue) {
    whenUpdateDisplayPrevious.textContent = 'Previously selected area: '+ String(matchedVenue.areaList)
  } else {
    console.log('No matching venue found.');
  }
  }



  //create vaneu-add selected area
  const checkboxes = document.querySelectorAll('input[name="area"]');

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const areaId = `inputs-${event.target.value}`;
      const inputGroup = document.getElementById(areaId);

      if (event.target.checked) {
        inputGroup.style.display = 'block';
      } else {
        inputGroup.style.display = 'none';
      }
    });
  });

  document.querySelectorAll('.btn-add-row').forEach((button) => {
    button.addEventListener('click', function () {
      const area = this.getAttribute('data-area');
      const rowsContainer = document.querySelector(`#inputs-${area} .rows-container`);

      const currentRows = rowsContainer.children.length + 1;

      const rowDiv = document.createElement('div');
      rowDiv.className = 'row row-input mb-1';

      rowDiv.innerHTML = `
            <div class="col-2">
               <div class="text-center">Row ${currentRows}</div>
            </div>
            <div class="col-4">
                <input type="number" id="seats-${area}-${currentRows}" placeholder="Seats" class="form-control" required />
            </div>
            <div class="col-5">
                <input type="number" id="price-${area}-${currentRows}" placeholder="Price" class="form-control" required />
            </div>
            <div class="col-1">
                <button class="btn btn-danger btn-remove-row">Remove</button>
            </div>
        `;

      rowDiv.querySelector('.btn-remove-row').addEventListener('click', function () {
        rowDiv.remove();
      });

      rowsContainer.appendChild(rowDiv);
    });
  });

  document.getElementById('submitAddVenue').addEventListener('click', async (event) => {
    event.preventDefault();
    
    const venuName = document.getElementById('addVenueVenueName').value.trim();
    
    const newVenueData = {
      venueName: venuName,
      venuePic: '',
      areaList: [],
    };

    document.querySelectorAll('input[name="area"]:checked').forEach((checkbox) => {
      const areaKey = checkbox.value;
      newVenueData.areaList.push(areaKey);
      newVenueData[areaKey] = [];

      const rows = document.querySelectorAll(`#inputs-${areaKey} .rows-container .row-input`);

      rows.forEach((row, index) => {
        const seatsInput = document.getElementById(`seats-${areaKey}-${index + 1}`);
        const priceInput = document.getElementById(`price-${areaKey}-${index + 1}`);

        const seats = seatsInput ? seatsInput.value : null;
        const price = priceInput ? priceInput.value : null;

        const seatsData = Array.from({ length: seats }, (_, j) => ({
          column: j + 1,
          status: 'available',
        }));

        newVenueData[areaKey].push({
          row: index + 1,
          seats: seats,
          price: price,
          seatsData: seatsData,
        });
      });
    });

    console.log(newVenueData);
    
    //The database

    //update
    if (venueName) {
      if (confirm(`Are you sure to update ${venuName}`)) {
        try {
          const response = await fetch(`/api/seats/${matchedVenueIDForUpdate}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newVenueData),
          });
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save venue seats');
          }
    
          const result = await response.json();
          alert('Venue seat updated successfully!', result);
          window.location.href = './admin-seatManagement.html';
        } catch (error) {
          console.error('Error:', error);
          alert(error.message || 'Failed to update Venue seat. Please try again.');
        }
      }
    } else { 

    //create new
    try {
      const response = await fetch('/api/seats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVenueData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save venue seats');
      }

      const result = await response.json();
      alert('Venue seat created successfully!', result);
      window.location.href = './admin-seatManagement.html';
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Failed to save Venue seat. Please try again.');
    }}
  });
});
