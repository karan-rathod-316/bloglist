const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const api = supertest(app);

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("tatanka", 10);
    const user = new User({
      username: "tatanka",
      name: "tatanka",
      passwordHash,
    });

    await user.save();
  });

  test("user creation succeeds with a fresh username", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "Walter",
      password: "Sobchak",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("user creation fails with proper statuscode and message if username is already taken", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "tatanka",
      password: "tatanka",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("`username` to be unique");

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test("user creation fails with proper statuscode if username is under 5 characters", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "rot",
      password: "rooot",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      "User validation failed: username: Path `username` (`rot`) is shorter than the minimum allowed length (4)."
    );

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
