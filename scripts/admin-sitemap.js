document.addEventListener("DOMContentLoaded", async () => {
  //change to get from database
  const response = await fetch("../dataStructure/venue-seat.json");
  const data = await response.json();

  const areaList = data[0].areaList;

  const allSeatMap = document.getElementById("adminSeatMap");
  const svgWidth = 500;
  const svgHeight = 300;
  const seatWidth = 40;
  const seatHeight = 40;
  const marginX = 10;
  const marginY = 10;

//   console.log("areaList", areaList);
  areaList.forEach((area) => {
    const areaData = data[0][area];
    const areaDiv = document.createElement("div");
    areaDiv.classList.add("col-md-5","bg-white","rounded-4","m-3","border","border-dark-subtle");
    areaDiv.style.minWidth = "500px";
      areaDiv.innerHTML = `<h5 class="pt-3 text-center">${area}</h5>`;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);
    areaDiv.appendChild(svg);

    areaData.forEach((row) => {
      const y = (row.row - 1) * (seatHeight + marginY) + 30; 
        console.log('row',row)
      row.seatsData.forEach((seat) => {
        const x =
          (seat.column - 1) * (seatWidth + marginX) +
          svgWidth / 2 -
          (row.seats * (seatWidth + marginX)) / 2; 

        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("class", `seat ${seat.status}`);
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", seatWidth);
        rect.setAttribute("height", seatHeight);
        rect.setAttribute("data-status", seat.status);
        rect.setAttribute("data-price", seat.price);

        svg.appendChild(rect);
      });
    });

    allSeatMap.appendChild(areaDiv);
  });
});

