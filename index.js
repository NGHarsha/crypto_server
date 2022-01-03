const WebSocket = require("ws");
const mongoose = require("mongoose");
const cron = require("node-cron");
let app = require("./app"); // note, that's your main.js file above
const dotenv = require("dotenv").config();
const newsCronJob = require("./middleware/news-cron");

let WSServer = WebSocket.Server;
let server = require("http").createServer();
let wss = new WSServer({
  server: server,
});

const port = process.env.PORT || 5000;

wss.on("connection", (ws) => {
  //connection is up, let's add a simple simple event
  ws.on("message", (message) => {
    //log the received message and send it back to the client
    console.log("received: %s", message);
    ws.send(`Hello, you sent -> ${message}`);
  });

  //send immediatly a feedback to the incoming connection
  ws.send("Hi there, I am a WebSocket server");
});

server.on("request", app);

cron.schedule("* * * * *", newsCronJob);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    server.listen(port, function () {
      console.log(`Server/WS started on ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
