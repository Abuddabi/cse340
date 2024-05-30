'use strict'

document.addEventListener("DOMContentLoaded", () => {
  fetch("/account/getUsers")
    .then((response) => {
      if (response.ok) return response.json();
      throw Error("Network response was not OK");
    })
    .then((data) => {
      buildUsersList(data);
    })
    .catch((error) => {
      console.log('There was a problem: ', error.message)
    });
});

function buildUsersList(data) {
  const table = document.querySelector("#usersDisplay");
  const currentId = Number(table.dataset.currentId);
  const dataTable = `
  <thead>
    <tr>
      <th>id</th>
      <th>Name</th>
      <th>Email</th>
      <th>Type</th>
      <td>&nbsp;</td>
    </tr>
  </thead>
  <tbody>
    ${data.map((user) => {
    const modify = user.account_id === currentId ? "" : user.is_blocked ? `
        <a class="unblock" href='/account/unblock/${user.account_id}' title='Click to Unblock'>Unblock</a>
      ` : `
        <a class="block" href='/account/block/${user.account_id}' title='Click to Block'>Block</a>
      `;

    return `
    <tr>
      <td>${user.account_id}</td>
      <td class="${user.is_blocked ? "red" : ""}">${user.account_firstname} ${user.account_lastname}</td>
      <td>${user.account_email}</td>
      <td>${user.account_type}</td>
      <td>${modify}</td>
    </tr>`;
  }).join("")}
  </tbody>`;

  table.innerHTML = dataTable;
}