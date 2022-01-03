const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");

const transactionRouter = require("./routes/transactions.js");
const userRouter = require("./routes/users");
const portfolioRouter = require("./routes/portfolio");
const newsRouter = require("./routes/news.js");

app.use(cors());

app.use("/api/transactions", transactionRouter);
app.use("/api/users", userRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/news", newsRouter);

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

// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => {
//     app.listen(port, () => {
//       console.log("Server listening on " + port);
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });

module.exports = app;
