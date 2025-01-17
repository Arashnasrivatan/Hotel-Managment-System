const { User } = require("../db");
const bcrypt = require("bcrypt");

const localStrategy = require("passport-local").Strategy;

module.exports = new localStrategy({usernameField:"email"},async (email, password, done) => {
  
  
  const user = await User.findOne({
    where: {
      email,
    },
    raw: true,
  });
  if (!user) {
    return done(null, false);
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return done(null, false);
  }
  return done(null, user);
});
