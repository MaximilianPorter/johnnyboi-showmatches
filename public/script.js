const testButton = document.querySelector(".test-request-data");

const dataEndpoint = "http://localhost:3000/api/pages";

testButton.addEventListener("click", () => {
  getData();
});

async function getData() {
  try {
    const response = await fetch(dataEndpoint);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
