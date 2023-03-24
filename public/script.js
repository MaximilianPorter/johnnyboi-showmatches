const testButton = document.querySelector(".test-request-data");

testButton.addEventListener("click", () => {
  getData();
});

async function getData() {
  const response = await fetch(
    `https://api.jsonbin.io/v3/b/641d2c16c0e7653a05902603`,
    {
      method: "GET",
      headers: {
        "X-Access-Key": `$2b$10$U8MIBtjyXw9ILlbM87hi3.qWMCh/V1hTtdghuJKwfSwMwBdyY77x6`,
      },
    }
  );
  const data = await response.json();
  console.log(data?.record);
}
