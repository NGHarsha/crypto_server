const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const cors = require("cors");

const coinRouter = require("./routes/coins.js");
const userRouter = require("./routes/users");

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

mongoose
  .connect(
    "mongodb+srv://Aryastark:aryastark@cluster0.dgucn.mongodb.net/test?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000, () => {
      console.log("Server listening on 5000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
