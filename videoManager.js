const secrets = require("./secrets.config");
const fs = require("fs");
const closest_match = require("closest-match");

// async function getVideos(results = 25, pageToken = "") {
//   const response = await fetch(
//     `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=UUldqb1GljWZzaRVtYXfvlAg&maxResults=${results}&channelId=UCldqb1GljWZzaRVtYXfvlAg&key=${process.env.YOUTUBE_API_KEY}&pageToken=${pageToken}`
//   );
//   const data = await response.json();
//   return {
//     items: data.items.filter(
//       (item) =>
//         !item.snippet.description.toLowerCase().includes("#shorts") &&
//         !item.snippet.description.toLowerCase().includes("#short")
//     ),
//     nextPageToken: data.nextPageToken,
//     totalResults: data.pageInfo.totalResults,
//   };
// }

// getVideos().then((data) => {
//   // testJSON.json to json
//   const liquipediaPages = Object.keys(
//     JSON.parse(fs.readFileSync("./testJSON.json", "utf8")).data
//   ).map((page) =>
//     page.replaceAll("JohnnyBoi_i/Show_Match/", "").replaceAll("_", " ")
//   );

//   for (const item of data.items) {
//     const closestChecks = closest_match.closestMatch(
//       item.snippet.title,
//       liquipediaPages,
//       true
//     );
//     console.log(
//       `${item.snippet.title} ------------------>>>----------------- ${closestChecks[0]}`
//     );
//   }
// });

//  FIND VIDEO ////////////////////////////////////////////////////////

async function findVideo(query) {
  // const response = await fetch(
  //   `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCldqb1GljWZzaRVtYXfvlAg&type=video&key=${process.env.YOUTUBE_API_KEY}&q=${query}`
  // );
  const response = await fetch(
    `https://yt.lemnoslife.com/search?part=snippet&q=${query}&channelId=UCldqb1GljWZzaRVtYXfvlAg&type=video`
  );
  const data = await response.json();
  // console.log(data);
  return data.items[0];
}

const liquipediaPages = JSON.parse(
  fs.readFileSync("./testJSON.json", "utf8")
).data;
const liquipediaPageNames = Object.keys(liquipediaPages).filter((page) =>
  page.includes("JohnnyBoi_i/Show_Match/")
);

Promise.all(
  liquipediaPageNames.map((page) =>
    findVideo(
      `${page}, ${[...liquipediaPages[page].placements.map((p) => p.name)]}`
    )
  )
).then((data) => {
  data.forEach((item, i) => {
    console.log(
      `${liquipediaPageNames[i]} ------------------>>>----------------- ${item.snippet.title} - https://www.youtube.com/watch?v=${item.id.videoId}`
    );
  });
});
