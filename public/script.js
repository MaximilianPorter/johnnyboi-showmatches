const tabEls = document.querySelectorAll(".tab-button");
const mainEl = document.querySelector("main");
const mainSections = document.querySelectorAll(".main-section");

const showmatchesList = document.querySelectorAll(".showmatches-list");

const subscriberCountEls = document.querySelectorAll(".profile-subscribers");

const dataEndpoint = "http://localhost:3000/api/pages";

let currentViewingShowmatch = null;

const followerCounts = tabEls.forEach((tabEl) => {
  tabEl.addEventListener("click", (e) => {
    // disable all tabs
    tabEls.forEach((tempTab) => (tempTab.ariaCurrent = "false"));
    // enable clicked tab
    tabEl.ariaCurrent = "true";

    const page = getActiveTabPage();
    scrollTabModal(page, "smooth");

    mainSections.forEach(
      (section) =>
        section.ariaCurrent === "true" && (section.ariaCurrent = "false")
    );
    page.ariaCurrent = "true";
  });
});

window.addEventListener("resize", () => {
  scrollTabModal(getActiveTabPage(), "auto");
});

showmatchesList.forEach((showmatchList) =>
  showmatchList.addEventListener("click", (e) => {
    const showmatch = e.target.closest(".showmatch");
    if (!showmatch) return;

    if (currentViewingShowmatch && currentViewingShowmatch !== showmatch) {
      currentViewingShowmatch.ariaCurrent = "false";
    }

    showmatch.ariaCurrent = showmatch.ariaCurrent === "true" ? "false" : "true";
    if (showmatch.ariaCurrent === "true") {
      currentViewingShowmatch = showmatch;
    } else {
      currentViewingShowmatch = null;
    }
  })
);

fetchFollowerCounts().then((data) => {
  subscriberCountEls.forEach((el) => {
    if (el.title == "youtube") {
      el.querySelector("p").textContent = `${
        convertNumberToK(data.data.youtube) ?? `---`
      } subscribers`;
    } else if (el.title == "twitch") {
      el.querySelector("p").textContent = `${
        convertNumberToK(data.data.twitch) ?? `---`
      } followers`;
    } else if (el.title == "twitter") {
      el.querySelector("p").textContent = `${
        convertNumberToK(data.data.twitter) ?? `---`
      } followers`;
    }
  });
});

function convertNumberToK(number) {
  if (number >= 1000) {
    return `${Math.floor(number / 1000)}k`;
  }
  return number;
}

//  FUNCTIONS -----------------------------------------------

async function getData() {
  try {
    const response = await fetch(dataEndpoint);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

function scrollTabModal(page, behavior) {
  mainEl.scrollTo({
    left: page.offsetLeft - mainEl.offsetLeft,
    behavior: behavior,
  });
}

function getActiveTabPage() {
  const activeTab = [...tabEls].find((tab) => tab.ariaCurrent === "true");
  return [...mainSections].find((section) => section.title === activeTab.title);
}

async function fetchFollowerCounts() {
  const followerCounts = await fetch(`${window.origin}/api/userinfo/links`);
  const data = await followerCounts.json();
  return data;
}
