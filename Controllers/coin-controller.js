const mongoose = require("mongoose");
const Coin = require("../Models/Coin");
const User = require("../Models/User");
const HttpError = require("../Models/http-error");
const axios = require("axios");

const getAllCoins = async (req, res, next) => {
  let coins;
  try {
    coins = await Coin.find({});
  } catch (err) {
    return next(
      new HttpError("Fetching Coins failed. Please try again later.", 500)
    );
  }

  return res
    .status(200)
    .json({ coins: coins.map((coin) => coin.toObject({ getters: true })) });
};

const getCoinsByUserId = async (req, res, next) => {
  // console.log(req.params.id);
  // var coins = await Coin.find({ user: req.params.id });

  //Aggregate function will not convert strings to mongodb's objectid. So $match will result 0 coins in aggrgate. So convert to objectid.
  let user = mongoose.Types.ObjectId(req.params.id);

  var coins = await Coin.aggregate([
    { $match: { user: user } },
    {
      $group: {
        _id: "$symbol",
        value: { $sum: "$investment" },
        volume: { $sum: "$volume" },
        name: { $first: "$name" },
        symbol: { $first: "$symbol" },
        image: { $first: "$image" },
        user: { $first: "$user" },
      },
    },
  ]);

  // let userWithCoins;
  try {
    let user = mongoose.Types.ObjectId(req.params.id);

    var coins = await Coin.aggregate([
      { $match: { user: user } },
      {
        $group: {
          _id: "$symbol",
          value: { $sum: "$investment" },
          volume: { $sum: "$volume" },
          name: { $first: "$name" },
          symbol: { $first: "$symbol" },
          image: { $first: "$image" },
          user: { $first: "$user" },
        },
      },
    ]);
  } catch (err) {
    return next(
      new HttpError(
        "Fetching Coins  for the user failed. Please try again later.",
        500
      )
    );
  }
  res.json({ coins });
};

const postCoinsByUserId = async (req, res, next) => {
  let { name, symbol, image, volume, atprice, investment } = req.body;
  let uid = req.userData.userId;
  // console.log(req.body, uid);

  const newCoin = new Coin({
    name,
    symbol,
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
    await newCoin.save({ session: sess });
    console.log("coin saved");
    user.coins.push(newCoin);
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

  return res.status(201).json({ coin: newCoin });
};

const getCoinHistory = async (req, res, next) => {
  var symbol = req.params.symbol.toUpperCase();
  console.log(symbol);
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

exports.getAllCoins = getAllCoins;
exports.getCoinsByUserId = getCoinsByUserId;
exports.postCoinsByUserId = postCoinsByUserId;
exports.getCoinHistory = getCoinHistory;
