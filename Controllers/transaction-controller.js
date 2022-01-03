const mongoose = require("mongoose");
const Transaction = require("../Models/Transaction");
const User = require("../Models/User");
const Portfolio = require("../Models/Portfolio");
const HttpError = require("../Models/http-error");
const axios = require("axios");

// const getAllTransactions = async (req, res, next) => {
//   let Transactions;
//   try {
//     Transactions = await Transaction.find({});
//   } catch (err) {
//     return next(
//       new HttpError(
//         "Fetching Transactions failed. Please try again later.",
//         500
//       )
//     );
//   }

//   return res
//     .status(200)
//     .json({
//       Transactions: Transactions.map((Transaction) =>
//         Transaction.toObject({ getters: true })
//       ),
//     });
// };

const getAggTransactionsByPortfolioId = async (req, res, next) => {
  // console.log(req.params.id);
  // var Transactions = await Transaction.find({ user: req.params.id });

  //Aggregate function will not convert strings to mongodb's objectid. So $match will result 0 Transactions in aggrgate. So convert to objectid.
  // let temp = mongoose.Types.ObjectId(req.params.id);

  // var result = await Transaction.aggregate([
  //   { $match: { user: temp } },
  //   {
  //     $group: {
  //       _id: "$symbol",
  //       value: { $sum: "$investment" },
  //       volume: { $sum: "$volume" },
  //       name: { $first: "$name" },
  //       symbol: { $first: "$symbol" },
  //       image: { $first: "$image" },
  //       user: { $first: "$user" },
  //     },
  //   },
  // ]);
  // console.log(result);

  // let userWithTransactions;

  // if (req.params.id === undefined) {
  //   try {
  //     primaryPortfolio = await Portfolio.findOne({ isPrimary: true, user: uid });
  //   } catch (err) {
  //     console.log(err);
  //     return next(
  //       new HttpError(
  //         "Fetching Portfolios  for the user failed. Please try again later.",
  //         500
  //       )
  //     );
  //   }
  //   pid = primaryPortfolio.id;
  // } else {
  //   pid = req.params.id;
  // }

  let uid = req.userData.userId;
  let pid;
  let portfolio;

  if (req.params.id) {
    console.log(req.params.id);
    try {
      portfolio = await Portfolio.findById(req.params.id, { transactions: 0 });
    } catch (err) {
      console.log(err);
      return next(
        new HttpError("Something went wrong. Please try again later"),
        500
      );
    }
  } else {
    try {
      portfolio = await Portfolio.findOne({ isPrimary: true, user: uid });
    } catch (err) {
      console.log(err);
      return next(
        new HttpError(
          "Fetching Portfolios  for the user failed. Please try again later.",
          500
        )
      );
    }
  }

  if (!portfolio) {
    console.log("portfolio not found");
    const error = new HttpError("Portfolio not found");
    return next(error);
  }

  if (uid !== portfolio.user.toString()) {
    console.log("User is not the owner of portfolio");
    return next(new HttpError("Something went wrong."), 500);
  }

  pid = portfolio.id;
  console.log(pid);

  let port = JSON.parse(JSON.stringify(portfolio));

  var transactions;
  try {
    pid = mongoose.Types.ObjectId(pid);

    //Find all Transactions by portfolioId, group them by coin-symbol and sum investment,volume and retain other common fields

    transactions = await Transaction.aggregate([
      { $match: { portfolio: pid } },
      {
        $group: {
          _id: "$symbol",
          investment: { $sum: "$investment" },
          volume: { $sum: "$volume" },
          name: { $first: "$name" },
          symbol: { $first: "$symbol" },
          image: { $first: "$image" },
          portfolio: { $first: "$portfolio" },
          user: { $first: "$user" },
        },
      },
      {
        $sort: {
          investment: -1,
        },
      },
      {
        $project: {
          _id: false,
        },
      },
    ]);
  } catch (err) {
    return next(
      new HttpError(
        "Fetching Transactions  for the user failed. Please try again later.",
        500
      )
    );
  }

  port.transactions = transactions;

  res.json({ portfolio: port });
};

const postTransactionsByUserId = async (req, res, next) => {
  let { name, symbol, image, volume, atprice, investment } = req.body;
  let uid = req.userData.userId;
  // console.log(req.body, uid);

  const newTransaction = new Transaction({
    name,
    symbol: symbol.toUpperCase(),
    image,
    volume,
    atprice,
    investment,
    user: uid,
  });

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

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newTransaction.save({ session: sess });
    console.log("Transaction saved");
    user.Transactions.push(newTransaction);
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

  return res.status(201).json({ Transaction: newTransaction });
};

const getTransactionHistory = async (req, res, next) => {
  var symbol = req.params.symbol.toUpperCase();
  // console.log(symbol);
  const resp = await axios.get(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d`
  );
  // console.log(resp.data);
  var data = [];
  resp.data.forEach((element) => {
    let temp = {
      time: new Date(element[0]),
      open: parseFloat(element[1]),
      high: parseFloat(element[2]),
      low: parseFloat(element[3]),
      close: parseFloat(element[4]),
    };
    data.push(temp);
  });
  return res.status(200).json({ data });
};

//exports.getAllTransactions = getAllTransactions;
exports.getAggTransactionsByPortfolioId = getAggTransactionsByPortfolioId;
exports.postTransactionsByUserId = postTransactionsByUserId;
exports.getTransactionHistory = getTransactionHistory;
