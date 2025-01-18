const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const configs = require("../configs");
const { User } = require("./../db");
const redis = require("./../redis");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const response = require("./../utils/response");

exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      limit,
      offset,
      raw: true,
    });

    const usersCount = await User.count();

    return response(res, 200, "لیست کاربران با موفقیت گرفته شد", {
      usersCount,
      currentPage: page,
      totalPages: Math.ceil(usersCount / limit),
      users,
    });
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

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password", "created_at", "updated_at", "role"] },
    });

    if (!user) {
      return response(res, 404, "کاربری با این شناسه یافت نشد");
    }

    if (email && email !== user.email) {
      const isEmailExist = await User.findOne({ where: { email } });

      if (isEmailExist) {
        return response(res, 400, "این ایمیل قبلا ثبت شده است");
      }
    }

    if (req.file) {
      const fileBuffer = req.file.buffer;
      const newAvatar = `/images/avatars/${Date.now()}-${
        req.file.originalname
      }`;

      await sharp(fileBuffer)
        .png({ quality: 60 })
        .toFile(path.join(__dirname, "..", "..", "public", newAvatar));

      if (
        user.avatar !== "/images/default.jpg" &&
        fs.existsSync(path.join(__dirname, "..", "..", "public", user.avatar))
      ) {
        fs.unlinkSync(path.join(__dirname, "..", "..", "public", user.avatar));
      }

      user.avatar = newAvatar;
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    return response(res, 200, "پروفایل با موفقیت به‌روزرسانی شد", { user });
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    let user;

    if (req.user.role === "admin") {
      const { userId } = req.query;

      if (!userId) {
        return response(
          res,
          400,
          "لطفاً userId را برای حذف حساب کاربری وارد کنید"
        );
      }

      user = await User.findByPk(userId);
      if (!user) {
        return response(res, 404, "کاربری با این شناسه یافت نشد");
      }

      if (user.id === req.user.id) {
        return response(res, 400, "ادمین نمی‌تواند حساب کاربری خود را حذف کند");
      }

      if (user.role === "admin") {
        return response(
          res,
          400,
          "ادمین نمی‌تواند حساب کاربری یک ادمین دیگر را حذف کند"
        );
      }
    } else {
      user = await User.findByPk(req.user.id);
    }

    if (
      user.avatar != "/images/default.jpg" &&
      fs.existsSync(path.join(__dirname, "..", "..", "public", user.avatar))
    ) {
      fs.unlinkSync(path.join(__dirname, "..", "..", "public", user.avatar));
    }
    await user.destroy();

    return response(res, 200, "حساب کاربری با موفقیت حذف شد");
  } catch (err) {
    next(err);
  }
};
