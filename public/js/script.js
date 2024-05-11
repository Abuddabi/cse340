document.addEventListener("DOMContentLoaded", () => {
  showVIN();
});

const showVIN = () => {
  const button = document.querySelector("#js-vin-btn");
  if (!button) return;

  button.addEventListener("click", (e) => {
    e.preventDefault();
    button.parentElement.innerHTML = "Never Gonna Give You Up.";
  });
}