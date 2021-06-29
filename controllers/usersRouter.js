const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (req, res) => {
  const body = req.body;

  if (body.password.length > 4) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
      username: body.username,
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
