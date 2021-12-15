const HttpError = require("../Models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // console.log(req.headers.authorization);
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    // console.log(token);
    if (!token) {
      return next(new HttpError("Authorization failed", 401));
    }

    const decodedToken = jwt.verify(
      token,
      "jwt secret goes here. Replace with secret."
    );
    // console.log(decodedToken);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    return next(new HttpError("Authorization failed", 401));
  }
};
