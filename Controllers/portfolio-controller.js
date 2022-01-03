const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Transaction = require("../Models/Transaction");
const User = require("../Models/User");
const Portfolio = require("../Models/Portfolio");
const HttpError = require("../Models/http-error");
const axios = require("axios");

const types = ["buy", "sell"];

const getPortfoliosByUserId = async (req, res, next) => {
  var portfolios;
  try {
    portfolios = await Portfolio.find(
      { user: req.params.id },
      { transactions: 0 }
    );
  } catch (err) {
    console.log(err);
    return next(
      new HttpError(
        "Fetching Portfolios  for the user failed. Please try again later.",
        500
      )
    );
  }

  // temporary = [];
  // portfolios.forEach((a) => temporary.push(JSON.parse(JSON.stringify(a))));

  // for (let p of temporary) {
  //   let transactions;
  //   try {
  //     pid = mongoose.Types.ObjectId(p.id);

  //     //Find all Transactions by portfolioId, group them by coin-symbol and sum investment,volume and retain other common fields
  //     transactions = await Transaction.aggregate([
  //       { $match: { portfolio: pid } },
  //       {
  //         $group: {
  //           _id: "$symbol",
  //           value: { $sum: "$investment" },
  //           volume: { $sum: "$volume" },
  //           name: { $first: "$name" },
  //           symbol: { $first: "$symbol" },
  //           image: { $first: "$image" },
  //           portfolio: { $first: "$portfolio" },
  //           user: { $first: "$user" },
  //         },
  //       },
  //       {
  //         $sort: {
  //           value: -1,
  //         },
  //       },
  //       {
  //         $project: {
  //           _id: false,
  //         },
  //       },
  //     ]);
  //     p.transactions = transactions;
  //   } catch (err) {
  //     return next(
  //       new HttpError(
  //         "Fetching Transactions  for the user failed. Please try again later.",
  //         500
  //       )
  //     );
  //   }
  // }

  res.json({ portfolios });
};

const createPortfolioByUserId = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  console.log("inside create portfolio");
  let { name } = req.body;
  let uid = req.userData.userId;

  let user;
  try {
    user = await User.findById(uid);
  } catch (err) {
    console.log("User not found");
    return next(
      new HttpError("Adding transaction failed. Please try again later"),
      500
    );
  }

  const newPortfolio = new Portfolio({
    name,
    investment: 0,
    transactions: [],
    user: uid,
    isPrimary: user.portfolios.length === 0,
  });

  try {
    nameCheck = await Portfolio.find({ user: uid, name: name });
    if (nameCheck.length > 0) {
      console.log("Portfolio with same name exists");
      return next(
        new HttpError(
          "Portfolio with same name already exists. Please use different name"
        ),
        500
      );
    }
  } catch (err) {
    return next(
      new HttpError("Creating portfolio failed. Please try again later"),
      500
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newPortfolio.save({ session: sess });
    console.log("Portfolio saved");
    user.portfolios.push(newPortfolio);
    await user.save({ session: sess });
    console.log("user saved");
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Adding transaction failed, please try again.",
      500
    );
    return next(error);
  }

  return res.status(201).json({ portfolio: newPortfolio });
};

const addTransactionByPortfolioId = async (req, res, next) => {
  const pid = req.params.id;
  let uid = req.userData.userId;

  let portfolio;
  try {
    portfolio = await Portfolio.findById(pid).populate("transactions");
    // console.log(portfolio);
  } catch (err) {
    return next(
      new HttpError("Something went wrong. Please try again later"),
      500
    );
  }

  if (!portfolio) {
    console.log(error);
    const error = new HttpError("Portfolio not found");
    return next(error);
  }

  if (uid !== portfolio.user.toString()) {
    console.log("User is not the owner of portfolio");
    return next(new HttpError("Something went wrong."), 500);
  }

  let { name, symbol, image, volume, atprice, investment, type } = req.body;

  if (!type || types.indexOf(type.trim()) === -1) {
    console.log("Type of transaction is not supported");
    return next(new HttpError("Something went wrong."), 500);
  } else {
    console.log("Trim");
    type = type.trim();
  }

  let newTransaction;

  if (type === "buy") {
    newTransaction = new Transaction({
      name,
      symbol: symbol.toUpperCase(),
      image,
      volume,
      atprice,
      investment,
      portfolio: pid,
      user: uid,
      type: type,
    });
  } else if (type === "sell") {
    newTransaction = new Transaction({
      name,
      symbol: symbol.toUpperCase(),
      image,
      volume: -volume,
      atprice,
      investment: -investment,
      portfolio: pid,
      user: uid,
      type: type,
    });
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newTransaction.save({ session: sess });
    console.log("Transaction saved");
    portfolio.transactions.push(newTransaction);
    portfolio.investment += newTransaction.investment;
    await portfolio.save({ session: sess });
    console.log("portfolio saved");
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Adding transaction failed, please try again.",
      500
    );
    return next(error);
  }

  return res.status(201).json({ portfolio: portfolio });
};

const deleteTransactionByPortfolioId = async (req, res, next) => {
  const pid = mongoose.Types.ObjectId(req.body.portfolio);
  const uid = req.userData.userId;
  const symbol = req.body.symbol;
  console.log("Inside delete");
  let portfolio;
  try {
    portfolio = await Portfolio.findById(pid);
    // console.log(portfolio);
  } catch (err) {
    return next(
      new HttpError("Something went wrong. Please try again later"),
      500
    );
  }

  if (!portfolio) {
    const error = new HttpError("Portfolio not found");
    return next(error);
  }

  if (uid !== portfolio.user.toString()) {
    console.log("User is not the owner of portfolio");
    return next(new HttpError("Something went wrong."), 500);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    const t = await Transaction.find(
      { portfolio: pid, symbol, user: uid },
      { _id: 1, investment: 1 },
      { session: sess }
    );
    console.log(t);
    let temp = 0;
    t.forEach((i) => (temp += i.investment));
    console.log(temp);

    await Portfolio.updateOne(
      { _id: pid },
      {
        $pull: { transactions: { $in: t } },
        $set: { investment: portfolio.investment - temp },
      },
      { session: sess }
    );
    await Transaction.deleteMany(
      { portfolio: pid, symbol, user: uid },
      { session: sess }
    );

    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Deleting transaction failed, please try again.",
      500
    );
    return next(error);
  }

  return res.status(201).send({ msg: "Delete Success" });
};

exports.getPortfoliosByUserId = getPortfoliosByUserId;
exports.createPortfolioByUserId = createPortfolioByUserId;
exports.addTransactionByPortfolioId = addTransactionByPortfolioId;
exports.deleteTransactionByPortfolioId = deleteTransactionByPortfolioId;
