const { consoleLog } = require("../signale.config");
const yup = require("yup");
const { getHashedPassword, generateToken, verifyToken } = require("../utils");
//import models
const { User, EmailValidator, UserType, Address } = require("../models");

//get user by email
/*
 ** @param {string} email
 ** @returns {Object} user - bookshelf user object
 */
exports.getUserByEmail = async (email) => {
  try {
    let user = await User.where({
      email,
    }).fetch({
      require: false,
    });
    return user;
  } catch (error) {
    consoleLog.error(error);
    throw error;
  }
};

//validate login
/*
 ** @param {string} email
 ** @param {string} password
 */
exports.getUser = async (email, password) => {
  try {
    await yup.string().email().required().validate(email);
    await yup.string().required().validate(password);

    const user = await this.getUserByEmail(email);
    if (user) {
      if (user.get("password") === getHashedPassword(password)) {
        //if password is correct add user to session
        const { password, ...userData } = user.toJSON();
        return userData;
      }
    } else {
      return false;
    }
  } catch (error) {
    consoleLog.error(error);
    throw error;
  }
};

//add new user
/*
 ** @param {Object} data
 ** @param {string} data.email
 ** @param {string} data.password
 ** @returns {Object}
 ** @returns {string} return.token  - token for user
 ** @returns {Object} return.user  - bookshelf user object
 */
exports.addUser = async (data) => {
  try {
    if (await this.getUserByEmail(data.email)) {
      return false;
    }
    const userSchema = yup.object().shape({
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      email: yup.string().email().required(),
      password: yup.string().required(),
      userTypeId: yup.number().required(),
    });

    await userSchema.validate(data, { abortEarly: false });
    const user = new User({
      ...data,
      password: getHashedPassword(data.password),
    });
    await user.save();
    const token = generateToken(
      {
        email: user.get("email"),
      },
      process.env.JWT_EMAIL_TOKEN,
      "1d"
    );
    const emailToken = new EmailValidator({
      userId: user.get("id"),
      validator: token,
      createdAt: new Date(),
    });
    emailToken.save();
    return { user, token: token };
  } catch (error) {
    consoleLog.error(error.message);
    throw error;
  }
};

//verify user email
/*
 ** @param {string} token
 ** @return {boolean} true - if token is valid
 */
exports.verifyEmail = async (token) => {
  try {
    const emailToken = await EmailValidator.where({
      validator: token,
    }).fetch({ require: false });
    if (emailToken) {
      const user = await User.where({
        id: emailToken.get("userId"),
      }).fetch({ require: false });
      if (user) {
        if (!user.get("isVerified")) {
          user.set("isVerified", 1);
          await user.save();
          emailToken.destroy();
          return true;
        }
      }
    }
    // emailToken?.destroy();
    return false;
  } catch (error) {
    consoleLog.error(error);
    throw error;
  }
};
