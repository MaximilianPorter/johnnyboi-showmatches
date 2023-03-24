const testButton = document.querySelector(".test-request-data");

testButton.addEventListener("click", () => {
  fetch(
    `https://raw.githubusercontent.com/MaximilianPorter/rocket-replay/main/README.md`
  )
    .then((res) => res.text())
    .then((data) => {
      console.log(data);
    });
});
