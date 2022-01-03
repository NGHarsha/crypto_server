const dotenv = require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");
const News = require("../Models/News");

const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${process.env.CRYPTOPANIC_API}&kind=news`;

module.exports = async () => {
  console.log("Starting job ", new Date());
  let resp;
  try {
    resp = await axios.get(url);
  } catch (err) {
    throw new HttpError("An unknown error occured", 500);
  }

  resp.data.results.forEach(async (n) => {
    try {
      let existing = await News.findOne({ news_id: n.id });
      if (existing) {
        //        console.log("Existing News");
        return;
      } else {
        const news = new News({
          news_id: n.id,
          title: n.title,
          kind: n.kind,
          domain: n.domain,
          published_at: n.published_at,
          url: n.url,
          currencies: n.currencies,
        });

        await news.save();
      }
    } catch (err) {
      console.log("News Cron error " + err);
    }
  });
};
