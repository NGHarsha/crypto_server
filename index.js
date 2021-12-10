const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");

const transactionRouter = require("./routes/transactions.js");
const userRouter = require("./routes/users");
const portfolioRouter = require("./routes/portfolio");

const dotenv = require("dotenv").config();

app.use(cors());

app.use("/api/transactions", transactionRouter);
app.use("/api/users", userRouter);
app.use("/api/portfolio", portfolioRouter);

const url =
  "https://cryptopanic.com/api/v1/posts/?auth_token=98e3469d18b340ec5ca2013fdb3a7d756b4168aa&kind=news";
app.get("/api/news", async (req, res) => {
  let resp;
  try {
    resp = await axios.get(url);
  } catch (err) {
    console.log(err);
  }
  return res.status(200).send(resp.data.results);
});

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
