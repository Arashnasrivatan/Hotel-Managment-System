const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { setHeaders } = require("./middlewares/setHeaders");
const path = require("path");
const passport = require("passport");

const app = express();

//* BodyParser
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

//* Helmet
app.use(helmet());

//* Cors Policy
app.use(setHeaders);
app.use(cors());

//* Static Files
app.use(express.static(path.join(__dirname,"public")));

//* Passport

//* Routes


//* 404 Err Handler
app.use((req, res) => {
  return res.status(404).json({
    message: `404! This ${req.path} Path Not Found! Please Check The Path Or Method...`,
  });
});

//* Internal Server Err
app.use((err, res, next) => {
  if (err) {
    return errResponses(
      res,
      err.statusCode,
      `Internal Server Error: ErrName => ${err.name} ErrMessage => ${err.message}`
    );
  }
  next();
});
module.exports = app;