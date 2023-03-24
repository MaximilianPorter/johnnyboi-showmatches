const testButton = document.querySelector(".test-request-data");

testButton.addEventListener("click", () => {
  getData();
});

async function getData() {
  const response = await fetch(
    `https://raw.githubusercontent.com/MaximilianPorter/johnnyboi-showmatches/master/showmatchInfo.json`
  );
  const data = await response.json();
  console.log(data);
}
