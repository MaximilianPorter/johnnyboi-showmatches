const secrets = require("./secrets.config");

async function getYoutubeSubscribers() {
  try {
    const subscriberInfo = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCldqb1GljWZzaRVtYXfvlAg&key=${process.env.YOUTUBE_API_KEY}`
    );
    const subscriberData = await subscriberInfo.json();
    return parseInt(
      subscriberData.items[0].statistics.subscriberCount
        .toString()
        .replace(",", "")
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getTwitchFollowers() {
  try {
    const responseForToken = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const tokenData = await responseForToken.json();
    const token = tokenData.access_token;

    const followerInfo = await fetch(
      `https://api.twitch.tv/helix/channels/followers?broadcaster_id=91526191`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-ID": `${process.env.TWITCH_CLIENT_ID}`,
        },
      }
    );
    const followerData = await followerInfo.json();
    return parseInt(followerData.total.toString().replace(",", ""));
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getTwitterFollowers() {
  const { getUserDetail } = require("twitster");
  try {
    const userDetails = await getUserDetail("JohnnyBoi_i");
    return parseInt(
      userDetails.profileInfo.follower.toString().replace(",", "")
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = {
  getYoutubeSubscribers,
  getTwitchFollowers,
  getTwitterFollowers,
};
