const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const cors = require("cors");

const coinRouter = require("./routes/coins.js");
const userRouter = require("./routes/users");

const dotenv = require("dotenv").config();

app.use(cors());

app.use("/api/coins", coinRouter);
app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.status(200).send("Welcome");
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log("Server listening on " + port);
    });
  })
  .catch((err) => {
    console.log(err);
  });
