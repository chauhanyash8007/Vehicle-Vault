const userSchema = require("../models/UserModel");
const bcrypt = require("bcrypt");
const mailSend = require("../utils/MailUtil");

const registerUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const savedUser = await userSchema.create({
      ...req.body,
      password: hashedPassword,
    });
    //send mail... replace with actual mail sending logic and message content
    await mailSend(
      savedUser.email,
      "Welcome to our app",
      "Thank you for registering with our app.",
    );
    res.status(201).json({
      message: "user created successfully",
      data: savedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "error while creating user",
      err: err,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const foundUserFromEmail =
      (await userSchema.findOne({ email: email })) /
      console.log(foundUserFromEmail);
    if (foundUserFromEmail) {
      const isPasswordMatched = await bcrypt.compare(
        password,
        foundUserFromEmail.password,
      );
      if (isPasswordMatched) {
        res.status(200).json({
          message: "Login Success",
          data: foundUserFromEmail,
          role: foundUserFromEmail.role,
        });
      } else {
        res.status(401).json({
          message: "Invalid Credentials",
        });
      }
    } else {
      res.status(404).json({
        message: "user not found.",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "error while logging in",
      err: err,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
