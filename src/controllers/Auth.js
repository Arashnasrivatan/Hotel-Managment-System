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
    console.log(req.file);

    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return response(res, 400, "کاربری با این ایمیل وجود دارد");
    }

    if (!req.file) {
      return response(res, 400, "لطفا یک عکس پروفایل ارسال کنید.");
    }

    const fileBuffer = req.file.buffer;
    const avatarPath = `/images/avatars/${Date.now()}${req.file.originalname}`;

    console.log(__dirname);

    sharp(fileBuffer)
      .png({
        quality: 60,
      })
      .toFile(path.join(__dirname, "..", "..", "public", avatarPath));

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

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const isUserExist = await User.findOne({ where: { email } });

    if (!isUserExist) {
      return response(res, 400, "کاربری با این ایمیل وجود ندارد");
    }

    const isResetTokenExists = await redis.get(`resetTokenReq:${email}`);

    if (isResetTokenExists) {
      const remainingTime = await redis.ttl(`resetTokenReq:${email}`);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      const formatedTime = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
      return response(res, 400, `لطفا ${formatedTime} دیگر مجددا تلاش کنید`);
    }

    const resetToken = uuidv4();

    const storedResetToken = await redis.set(
      `resetToken:${resetToken}`,
      email,
      "EX",
      120 // 2 minutes
    );

    const resetTokenReq = await redis.set(
      `resetTokenReq:${email}`,
      resetToken,
      "EX",
      120
    );

    if (!storedResetToken || !resetTokenReq) {
      return response(res, 500, "خطا در ارسال ایمیل");
    }

    const resetLink = `${configs.domain}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.imitate.email",
      port: 587,
      auth: {
        user: "yu8kOq8ikkeb6QGUdahkhQ", //? Replace with your real email
        pass: "VObqB5oCLeDciCftdnVA", //? Replace with your real password
      },
    });

    const mailOptions = {
      from: '"Hotel Managment" <support@yourmail.com>',
      to: email,
      subject: "بازنشانی رمز عبور",
      text: `درخواست بازنشانی رمز عبور. لطفا روی لینک زیر کلیک کنید: ${resetLink}`,
      html: `<p>درخواست بازنشانی رمز عبور. لطفا روی لینک زیر کلیک کنید:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    };

    const isEmailSent = await transporter.sendMail(mailOptions);

    if (!isEmailSent) {
      return response(res, 500, "خطا در ارسال ایمیل");
    }

    return response(res, 200, "ایمیل بازنشانی رمز عبور ارسال شد");
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    const email = await redis.get(`resetToken:${token}`);

    if (!email) {
      return response(
        res,
        400,
        "لینک بازنشانی رمز عبور نامعتبر است یا منقضی شده است"
      );
    }

    if (newPassword !== confirmPassword) {
      return response(res, 400, "رمز عبور و تأیید آن یکسان نیست");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findOne({
      where: {
        email,
      },
    });

    if (!updatedUser) {
      return response(res, 400, "کاربری با این ایمیل وجود ندارد");
    }

    updatedUser.password = hashedPassword;

    await updatedUser.save();

    await redis.del(`resetToken:${token}`);
    await redis.del(`resetTokenReq:${email}`);

    return response(res, 200, "رمز عبور با موفقیت تغییر یافت");
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;


    const user = await User.findByPk(req.user.id);

    if (newPassword !== confirmPassword) {
      return response(res, 400, "رمز عبور و تأیید آن یکسان نیست");
    }

    if (oldPassword === newPassword) {
      return response(
        res,
        400,
        "رمز عبور جدید نباید با رمز عبور فعلی یکسان باشد"
      );
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      return response(res, 400, "رمز عبور فعلی صحیح نیست");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    return response(res, 200, "رمز عبور با موفقیت تغییر یافت");
  } catch (err) {
    next(err);
  }
};
