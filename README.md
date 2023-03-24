# JohnnyBoi_i Showmatches

All data is attributed to liquipedia under the [creative commons license](https://liquipedia.net/commons/Liquipedia:Copyrights).

This website uses [liquipedia's api](https://liquipedia.net/rocketleague/api.php) to fetch data from the [JohnnyBoi_i/Broadcasts](https://liquipedia.net/rocketleague/JohnnyBoi_i/Broadcasts) page and subsequent match pages.

Because of the restrictions on api calls, I can only query data **once every 30 seconds**. My solution to this problem was running [saveShowmatches.js](saveShowmatches.js) which takes the time to run through each page on the broadcasts section and parses the retrived data...waiting 30 seconds between each page query. (I know, I don't like it either)

The data retrieved is basically just the page's html, so I use the [jsdom](https://www.npmjs.com/package/jsdom) npm library to parse the html on a back-end server.

```js
const jsdom = require("jsdom");
const response = await fetch(
  `https://liquipedia.net/rocketleague/api.php?action=parse&format=json&prop=text&page=JohnnyBoi_i/Broadcasts`
);
const text = await response.json();
const dom = new jsdom.JSDOM(`${text.parse.text["*"]}`);
```

And then I do some querying of classes and id's to get the stuff I need and botta boom botta bang it's parsed into json.

## Displaying info on website

My current solution for displaying this information on a website is fetching my own uploaded [showmatchInfo.json](showmatchInfo.json) and parsing the file in my front-end application.

```js
async function getData() {
  const response = await fetch(
    `https://raw.githubusercontent.com/MaximilianPorter/johnnyboi-showmatches/master/showmatchInfo.json`
  );
  const data = await response.json();
  console.log(data);
}
```

## Response Format

```json
{
  "JohnnyBoi_i/Show_Match/Daniel_vs_Evoh": {
    "pageUrl": "https://liquipedia.net/rocketleague/JohnnyBoi_i/Show_Match/Daniel_vs_Evoh",
    "teamInfo": [], // this includes team info if applicable
    "bracketInfo": [
      {
        "participants": [{ "name": "Daniel" }, { "name": "Evoh" }],
        "games": [
          { "scores": [4, 0], "map": "Mannfield (Night)" },
          { "scores": [2, 3], "map": "Mannfield (Night)" },
          { "scores": [4, 7], "map": "Mannfield (Night)" },
          { "scores": [6, 4], "map": "Mannfield (Night)" },
          { "scores": [7, 1], "map": "Mannfield (Night)" },
          { "scores": [4, 5], "map": "Mannfield (Night)- OT(+0:09)" },
          { "scores": [6, 2], "map": "Mannfield (Night)" }
        ],
        "date": "March 18, 2023 - 20:00 CET"
      }
    ],
    "placements": [
      { "place": "1st", "winnings": "Daniel", "name": "Daniel" },
      { "place": "2nd", "winnings": "Evoh", "name": "Evoh" }
    ],
    "eventInfo": {
      "series": "JohnnyBoi_i Show Match",
      "organizer": "JohnnyBoi_i",
      "type": "Online",
      "location": "North America",
      "date": "2023-03-18",
      "mode": "1v1",
      "liquipedia_tier": "Show Match (D-Tier)"
    },
    "formatInfo": "\n,1v1 Show Match\nThe match is Bo7,\n"
  }
  // other pages
}
```

## Sidenotes

The [server.js](server.js) isn't used currently. I used it to start, but then transitioned to this "file creation" method.
