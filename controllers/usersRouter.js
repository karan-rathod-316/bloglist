const bcrypt = require("bcrypt");
const user = require("../models/user");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (req, res) => {
  const body = req.body;

  const existingUsers = await User.find();
  const checkForDuplicateUser = existingUsers.find(
    (savedUser) => savedUser.name === body.name
  );

  if (checkForDuplicateUser) {
    return res
      .status(400)
      .send({ error: "This username has already been taken!" });
  }

  if (!checkForDuplicateUser && body.password.length > 4) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    });

    const savedUser = await user.save();

    res.json(savedUser);
  } else {
    res
      .status(400)
      .send({ error: "Password should be longer than 4 characters" });
  }
});

usersRouter.get("/", async (req, res) => {
  const users = await User.find({}).populate("blogs");
  res.json(users);
});

module.exports = usersRouter;
