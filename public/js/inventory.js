'use strict'

// Get a list of items in inventory based on the classification_id 
document.querySelector("#classificationList")
  .addEventListener("change", (e) => {
    const classification_id = e.target.value
    const classIdURL = `/inv/getInventory/${classification_id}`
    fetch(classIdURL)
      .then((response) => {
        if (response.ok) return response.json();
        throw Error("Network response was not OK");
      })
      .then((data) => {
        buildInventoryList(data);
      })
      .catch((error) => {
        console.log('There was a problem: ', error.message)
      })
  })

// Build inventory items into HTML table components and inject into DOM 
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay");
  const dataTable = `
  <thead>
    <tr>
      <th>Vehicle Name</th>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
  </thead>
  <tbody>
    ${data.map((el) => {
    return `
    <tr>
      <td>${el.inv_make} ${el.inv_model}</td>
      <td><a href='/inv/edit/${el.inv_id}' title='Click to update'>Modify</a></td>
      <td><a href='/inv/delete/${el.inv_id}' title='Click to delete'>Delete</a></td>
    </tr>`;
  }).join("")}
  </tbody>`;

  // Display the contents in the Inventory Management view 
  inventoryDisplay.innerHTML = dataTable;
}