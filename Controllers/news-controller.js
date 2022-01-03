const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../Models/http-error");
const axios = require("axios");
const dotenv = require("dotenv").config();
const News = require("../Models/News");

const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${process.env.CRYPTOPANIC_API}&kind=news`;
const unsplashUrl = `https://api.unsplash.com/search/photos?query=crypto&client_id=${process.env.UNSPLASH_API}`;
const pixabayUrl = `https://pixabay.com/api/?key=${process.env.PIXABAY_API}&q=crypto&image_type=photo`;

const getLatestNews = async (req, res, next) => {
  console.log("Inside getLatest");
  let news;
  try {
    news = await News.find().sort({ published_at: -1 }).limit(20);
  } catch (err) {
    console.log(err);
    return next(new HttpError("An unknown error occured", 500));
  }
  console.log(news);
  return res.status(200).send({ news });
};

const getImages = async (req, res, next) => {
  let images;
  try {
    images = await axios.get(pixabayUrl);
  } catch (err) {
    console.log(err);
    return next(new HttpError("An unknown error occured", 500));
  }
  return res
    .status(200)
    .send({ ...images.data, images: images.data.hits.splice(0, 30) });
};

exports.getLatestNews = getLatestNews;
exports.getImages = getImages;
