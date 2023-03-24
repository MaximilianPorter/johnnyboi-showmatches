const express = require("express");
const app = express();
const server = require("http").createServer(app);
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const {
  cachePages: cacheData,
  getData,
} = require(`${__dirname}/cachingPages.js`);

// limit requests
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 2, // limit each IP to 2 requests per second

  // message to send when limit is reached
  message: {
    status: "error",
    message: "Too many requests, chill out.",
  },
});

app.use(cors());
app.use(express.static(`${__dirname}/public`));
app.use(limiter);

// restrict access to api through origin
// app.use("/api", (req, res, next) => {
//   const allowedOrigins = ["http://localhost:3000", "https://jsonbin.io"];
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//   }
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

//   next();
// });

// cache data
// cacheData();

app.get("/", (req, res) => {
  // send index.html
  res.sendFile(__dirname + "/public/");
});

app.get("/api/pages?:page", (req, res) => {
  const page = req.query.page;

  getData().then((data) => {
    const retrievedPage = data[page] || null;
    if (page && !retrievedPage) {
      return res.status(404).json({
        status: "error",
        message: "Page not found",
      });
    }

    // include attribution to liquipedia in response
    res.status(200).json({
      status: "success",
      data: data[page] || data,
      attribution:
        "This api is not associated with Liquipedia in any way, but the data is provided by Liquipedia under the CC-BY-SA 3.0 license (https://liquipedia.net/commons/Liquipedia:Copyrights)",
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server is running...");
});
