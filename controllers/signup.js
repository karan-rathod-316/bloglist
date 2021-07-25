const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const signupRouter = require("express").Router();
const User = require("../models/user");

signupRouter.post("/", async (req, res) => {
  const body = req.body;

  const user = await User.findOne({ username: body.username });

  const passwordCorrect =
    user === null ? false : bcrypt.compare(body.password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: "invalid username or password",
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = await jwt.sign(userForToken, process.env.SECRET);

  res.status(200).send({ token, username: user.username, name: user.name });
});

module.exports = signupRouter;
