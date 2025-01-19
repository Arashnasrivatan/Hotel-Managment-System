const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const configs = require("../configs");
const { User } = require("./../db");
const redis = require("./../redis");
const sharp = require("sharp");
const path = require("path");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const response = require("./../utils/response");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return response(res, 400, "کاربری با این ایمیل وجود دارد");
    }

    let avatarPath = '/images/default.jpg';
    if (req.file) {
      const fileBuffer = req.file.buffer;
      avatarPath = `/images/avatars/${Date.now()}${req.file.originalname}`;

      sharp(fileBuffer)
        .png({
          quality: 60,
        })
        .toFile(path.join(__dirname, "..", "..", "public", avatarPath));
    }
    const user = await User.create({
      name,
      email,
      avatar: avatarPath,
      password: hashedPassword,
    });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      configs.auth.accessTokenSecretKey,
      {
        expiresIn: configs.auth.accessTokenExpiresInSeconds + "s",
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      configs.auth.refreshTokenSecretKey,
      {
        expiresIn: configs.auth.refreshTokenExpiresInSeconds + "s",
      }
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    await redis.set(
      `refreshToken:${user.id}`,
      hashedRefreshToken,
      "EX",
      configs.auth.refreshTokenExpiresInSeconds
    );

    return response(res, 201, "ثبت‌نام با موفقیت انجام شد", {
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = req.user;

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      configs.auth.accessTokenSecretKey,
      {
        expiresIn: configs.auth.accessTokenExpiresInSeconds + "s",
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      configs.auth.refreshTokenSecretKey,
      {
        expiresIn: configs.auth.refreshTokenExpiresInSeconds + "s",
      }
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    await redis.set(
      `refreshToken:${user.id}`,
      hashedRefreshToken,
      "EX",
      configs.auth.refreshTokenExpiresInSeconds
    );

    return response(res, 200, "ورود با موفقیت انجام شد", {
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    return response(res, 200, "اطلاعات کاربر دریافت شد", user);
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const user = req.user;

    const storedRefreshToken = await redis.get(`refreshToken:${user.id}`);

    if (!storedRefreshToken) {
      return response(res, 401, "لطفا دوباره وارد شوید");
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      configs.auth.accessTokenSecretKey,
      {
        expiresIn: configs.auth.accessTokenExpiresInSeconds + "s",
      }
    );

    return response(res, 200, "توکن دسترسی جدید صادر شد", { accessToken });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const user = req.user;
    const deletedRefreshToken = await redis.del(`refreshToken:${user.id}`);

    if (!deletedRefreshToken) {
      return response(res, 400, "خطا در خروج");
    }
    return response(res, 200, "خروج با موفقیت انجام شد");
  } catch (err) {
    next(err);
  }
};
