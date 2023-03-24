const fs = require("fs");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const rateLimit = require("express-rate-limit");
const cors = require("cors");

app.use(cors());

let cachedPages = {};
if (fs.existsSync("./cachedPages.json")) {
  cachedPages = JSON.parse(fs.readFileSync("./cachedPages.json"));
}

app.get("/api/pages?:page", (req, res) => {
  const page = req.query.page;

  if (cachedPages[page]) {
    res.status(200).json({
      status: "success",
      data: cachedPages[page],
    });
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server is running...");
});
