const tabEls = document.querySelectorAll(".tab-button");
const mainEl = document.querySelector("main");
const mainSections = document.querySelectorAll(".main-section");

const showmatchesList = document.querySelector(".showmatches-list");

const dataEndpoint = "http://localhost:3000/api/pages";

// youtube sub count endpoint: https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCldqb1GljWZzaRVtYXfvlAg&key=AIzaSyBaPSsVF8YuiE3VPd0K9Cv1Vpe-QTW1vuY
// twitch follower count endpoint:
// twitter follower count endpoint:

let currentViewingShowmatch = null;

tabEls.forEach((tabEl) => {
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

showmatchesList.addEventListener("click", (e) => {
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
});

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
