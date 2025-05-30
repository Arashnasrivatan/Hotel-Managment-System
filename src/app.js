const express = require("express");
const cors = require("cors");
const response = require("./utils/response");
const helmet = require("helmet");
const { setHeaders } = require("./middlewares/setHeaders");
const rateLimit = require("express-rate-limit");
const path = require("path");
const passport = require("passport");
const localStrategy = require("./strategies/localStrategy");
const JwtAccessTokenStrategy = require("./strategies/JwtAccessTokenStrategy");
const JwtRefreshTokenStrategy = require("./strategies/JwtRefreshTokenStrategy");
const authRoutes = require("./routes/Auth");
const userRoutes = require("./routes/User");
const roomsRoutes = require("./routes/Room");
const bookingRoutes = require("./routes/Booking");
const paymentRoutes = require("./routes/Payment");
const aiChatRoutes = require("./routes/AiChat");
const swaggerDocs = require("./Apidoc/swagger");

const app = express();

//* BodyParser
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

//* Helmet
app.use(helmet());

//* Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

//* Cors Policy
app.use(setHeaders);
app.use(cors());

//* Static Files
app.use(express.static(path.resolve(__dirname, "..", "public")));

//* Passport
passport.use(localStrategy);
passport.use("accessToken", JwtAccessTokenStrategy);
passport.use("refreshToken", JwtRefreshTokenStrategy);

//* Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/aiChat", aiChatRoutes);


//* Swagger
swaggerDocs(app);

//* 404 Err Handler
app.use((req, res) => {
  return response(
    res,
    404,
    `404! This ${req.path} Path Not Found! Please Check The Path Or Method...`
  );
});

//TODO: Error Handler

//* Internal Server Err
app.use((err, res, next) => {
  if (err) {
    return response(
      res,
      err.statusCode,
      `Internal Server Error: ErrName => ${err.name} ErrMessage => ${err.message}`
    );
  }
  next();
});

module.exports = app;
