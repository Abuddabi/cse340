document.querySelector("#updateForm")
  .addEventListener("change", () => {
    document.querySelector(`input[type="submit"]`)
      .removeAttribute("disabled")
  })