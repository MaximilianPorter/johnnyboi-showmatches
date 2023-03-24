const jsdom = require("jsdom");
const fs = require("fs");

const manualStopPoint = 5;

const filePath = "./showmatchInfo.json";

let cachedPages = {};
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({}));
  return;
} else {
  cachedPages = JSON.parse(fs.readFileSync(filePath));
}

const specificPagesTest = [
  "JohnnyBoi_i/1v1_World_Cup",
  "JohnnyBoi_i/Show_Match/zen_vs_Rezears",
];
manuallyCachePages();

// const readline = require("node:readline/promises");
// const { stdin: input, stdout: output } = require("node:process");

// const rl = readline.createInterface({ input, output });

// rl.on("SIGINT", () => {
//   // rl.question("Are you sure you want to exit? ", (answer) => {
//   //   if (answer.match(/^y(es)?$/i)) rl.pause();
//   // });

//   console.log(`caching ${Object.keys(cachedPages).length} pages to file...`);
//   if (Object.keys(cachedPages).length <= 0) return;
//   writeCacheToFile();
//   rl.pause();
//   process.exit();
// });

async function manuallyCachePages(onlySpecificPages = []) {
  console.log("caching pages...");
  const response = await fetch(
    `https://liquipedia.net/rocketleague/api.php?action=parse&format=json&prop=text&page=JohnnyBoi_i/Broadcasts`
  );
  const text = await response.json();
  const dom = new jsdom.JSDOM(`${text.parse.text["*"]}`);
  const pagesToCache = [
    ...dom.window.document
      .querySelector(".table-responsive")
      .querySelectorAll("tr"),
  ]
    .map((row) => {
      return [...row.querySelectorAll("a")]
        .at(-1)
        ?.href.split("/rocketleague/")[1];
    })
    .filter(
      (page) =>
        page !== undefined &&
        (onlySpecificPages.length > 0 ? onlySpecificPages.includes(page) : true)
    );

  // start queue to rechache all pages in cachedPages
  const queue = pagesToCache;

  // make countdown for next api call in 30 seconds
  let countdown = 30;
  const loadingBar = setInterval(() => {
    process.stdout.write(countdown + " ");
    countdown--;
  }, 1000);

  let i = 0;
  const interval = setInterval(() => {
    if (
      queue.length <= 0 ||
      (manualStopPoint < 0 ? true : i >= manualStopPoint)
    ) {
      console.log("stopping interval");
      clearInterval(interval);
      clearInterval(loadingBar);

      writeCacheToFile();
      return;
    }

    cachePage(queue.shift());

    countdown = 30;
    console.log(`\n\nnext api call in...`);
    i++;
  }, 30_000);
}

function writeCacheToFile() {
  fs.writeFileSync(filePath, JSON.stringify(cachedPages), function (err) {
    if (err) return console.log(err);
    console.log(`${filePath} written`);
  });
}

function cachePage(page) {
  console.log("caching page:", page);
  if (!page) return;

  getDataFromLiquipedia(page).then((data) => {
    cachedPages[page] = data;
    console.log(`cached page ${page} with ${Object.keys(data).length} entries`);
  });
}

function getTeamInfo(dom) {
  const teamInfo = [];
  const teams = dom.window.document.querySelectorAll(".teamcard");
  teams.forEach((team) => {
    const teamName = team.querySelector("center").textContent.trim(" ");
    const playerFlags = [
      ...team.querySelector(".teamcard-inner").querySelectorAll(".flag"),
    ];
    const teamPlayers = playerFlags.map((flag) => {
      const playerText = flag.closest("tr").textContent;
      return playerText.split("\u00A0");
    });
    teamInfo.push({
      teamName,
      players: teamPlayers,
      // sub,
      // coach,
    });
  });
  return teamInfo;
}

function getPlacements(dom) {
  const prizepoolTable = dom.window.document.querySelector(".prizepooltable");
  if (!prizepoolTable) return null;
  const placements =
    prizepoolTable.querySelectorAll(".block-player").length <= 0
      ? prizepoolTable.querySelectorAll(".block-team")
      : prizepoolTable.querySelectorAll(".block-player");

  // const winnings = prizepoolTable.querySelectorAll(".prizepooltable-place");

  return [...placements].map((p) => {
    return {
      place: p
        .closest(".csstable-widget-row")
        .querySelector(".prizepooltable-place")
        .textContent.trim(),
      winnings: p
        .closest(".csstable-widget-row")
        .querySelectorAll(".csstable-widget-cell")[1].textContent,
      name: p.textContent,
    };
  });
}

function getBracketInfo(dom) {
  const bracketInfo = [];

  const brackets = dom.window.document.querySelectorAll(".brkts-popup");
  brackets.forEach((bracket) => {
    const bracketHeader = bracket.querySelector(".brkts-popup-header-dev");

    const bracketPlayers =
      bracketHeader.querySelectorAll(".block-player").length > 0
        ? bracketHeader.querySelectorAll(".block-player")
        : bracketHeader.querySelectorAll(".block-team");

    const bracketBody = bracket.querySelector(".brkts-popup-body");
    const bracketGames = bracketBody.querySelectorAll(".brkts-popup-body-game");
    const gameScores = [...bracketGames].map((game) => {
      const scoreLeft = game.querySelector(".brkts-popup-spaced").textContent;
      const scoreRight = game.querySelector(".brkts-popup-spaced").nextSibling
        .nextSibling.textContent;
      const map = game.querySelector(".brkts-popup-spaced").nextSibling
        .textContent;
      return [parseInt(scoreLeft), map, parseInt(scoreRight)];
    });

    const date = bracketBody.querySelector(
      ".match-countdown-block"
    ).textContent;

    bracketInfo.push({
      participants: [...bracketPlayers].map((p) => [
        p
          .querySelector("span[data-highlightingclass]")
          ?.getAttribute("data-highlightingclass"),
        p.textContent,
      ]),
      games: gameScores,
      date,
    });
  });

  return bracketInfo;
}

function getMatchInfo(dom) {
  const matchListOrder = [];
  const matchList = dom.window.document.querySelector(".brkts-matchlist");
  const matches = matchList?.querySelectorAll(".brkts-matchlist-match");

  matches?.forEach((match) => {
    const matchObj = [];
    const teams = match.querySelectorAll(".brkts-matchlist-opponent");
    teams.forEach((team, i) => {
      const players = team.querySelectorAll(".block-player");
      const playerNames = [...players].map((player) => player.textContent);
      matchObj.push(playerNames);
    });
    matchListOrder.push(matchObj);
  });
  return matchListOrder;
}

function getFormatInfo(dom) {
  // headers
  const headers = dom.window.document.querySelectorAll("h3");

  const formatEl = dom.window.document.querySelector("#Format");
  if (!formatEl) return null;
  const formatIndex = [...headers].findIndex((h) =>
    h.textContent.startsWith("Format")
  );
  const formatElements = [];
  let currHeader = headers[formatIndex];
  // get all elements between formatIndex and formatIndex  + 1
  while (currHeader.nextSibling !== headers[formatIndex + 1]) {
    formatElements.push(currHeader.nextSibling);
    currHeader = currHeader.nextSibling;
  }

  const formatDescription = `${[...formatElements].map((e) => e.textContent)}`;
  return formatDescription;
}

function getEventInfo(dom) {
  const infobox = dom.window.document.querySelector(".fo-nttax-infobox");
  if (!infobox) return null;
  const descriptions = infobox.querySelectorAll(".infobox-description");
  const eventInfo = {};
  descriptions.forEach((d) => {
    const title = d.textContent.replace(" ", "_").toLowerCase().split(":")[0];
    const value = d.nextSibling.textContent.trim(" ");
    eventInfo[title] = value;
  });

  return eventInfo;
}

async function getDataFromLiquipedia(page) {
  try {
    const response = await fetch(
      `https://liquipedia.net/rocketleague/api.php?action=parse&format=json&prop=text&page=${page}`,
      {
        headers: {
          "User-Agent":
            "JohnnyBoi_i Tournament Data | Made by Max, Contact: mx.porters@gmail.com",
          "Accept-Encoding": "gzip",
        },
      }
    );
    const text = await response.json();
    const dom = new jsdom.JSDOM(`${text.parse.text["*"]}`);

    // event info
    const eventInfo = getEventInfo(dom) ?? [];

    // format
    const formatInfo = getFormatInfo(dom) ?? [];

    // placements (prizepool table)
    const placements = getPlacements(dom) ?? [];

    const teamInfo = getTeamInfo(dom) ?? [];
    const bracketInfo = getBracketInfo(dom) ?? [];
    // const matchInfo = getMatchInfo(dom);

    const bracketInfoFile = {
      pageUrl: `https://liquipedia.net/rocketleague/${page}`,
      teamInfo,
      bracketInfo,
      placements,
      // matchInfo,
      eventInfo,
      formatInfo,
    };

    return bracketInfoFile;
  } catch (error) {
    console.log(error);
  }
}
