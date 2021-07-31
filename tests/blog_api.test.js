const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");
const blogListHelper = require("../utils/bloglist_helper");

const api = supertest(app);

const listWithMultipleBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogOne = new Blog(listWithMultipleBlogs[0]);
  await blogOne.save();
  let blogTwo = new Blog(listWithMultipleBlogs[1]);
  await blogTwo.save();

  const newUser = {
    username: "Mirko",
    name: "Dude",
    password: "CrowCrop",
  };

  await api.post("/api/users").send(newUser);
});

test("current number of blogs are returned", async () => {
  let response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(2);
});

test("blogs are returned in JSON format", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("identifier property is named id", async () => {
  let response = await api.get("/api/blogs");
  let ids = response.body.map((blog) => blog.id);
  expect(ids).toBeDefined();
});

test("verify that a new blog gets added", async () => {
  const loginUser = {
    username: "Mirko",
    password: "CrowCrop",
  };

  const loggedUser = await api
    .post("/api/login")
    .send(loginUser)
    .set("Accept", "application/json")
    .expect("Content-Type", /application\/json/);

  const newBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .set("Authorization", `Bearer ${loggedUser.body.token}`)
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
    .expect(200);

  let response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(3);
});

test("verify if likes are missing", async () => {
  const loginUser = {
    username: "Mirko",
    password: "CrowCrop",
  };

  const loggedUser = await api
    .post("/api/login")
    .send(loginUser)
    .set("Accept", "application/json")
    .expect("Content-Type", /application\/json/);

  const newBlog = {
    title: "TestLikes",
    author: "TestLikes",
    url: "http://TestLikes",
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .set("Authorization", `Bearer ${loggedUser.body.token}`)
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
    .expect(200);

  let response = await api.get("/api/blogs");
  let likesCount = blogListHelper.missingLike(response.body);
  expect(likesCount).toBe(0);
});

test("verify if title or url are missing", async () => {
  const loginUser = {
    username: "Mirko",
    password: "CrowCrop",
  };

  const loggedUser = await api
    .post("/api/login")
    .send(loginUser)
    .set("Accept", "application/json")
    .expect("Content-Type", /application\/json/);

  const newBlog = {
    author: "testURLandTITLE",
    likes: 12,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .set("Authorization", `Bearer ${loggedUser.body.token}`);

  let response = await api.get("/api/blogs");
  let blogCount = response.body.length;
  expect(blogCount).toBe(listWithMultipleBlogs.length);
});

test("verify whether deleting a blog works", async () => {
  const loginUser = {
    username: "Mirko",
    password: "CrowCrop",
  };

  const loggedUser = await api
    .post("/api/login")
    .send(loginUser)
    .set("Accept", "application/json")
    .expect("Content-Type", /application\/json/);

  const newBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .set("Authorization", `Bearer ${loggedUser.body.token}`)
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
    .expect(200);

  let blogList = await api.get("/api/blogs");
  let blogToDelete = blogList.body.find((blog) => blog.title === newBlog.title);
  console.log(blogToDelete);
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set("Authorization", `Bearer ${loggedUser.body.token}`);

  let updatedBloglist = await api.get("/api/blogs");
  expect(updatedBloglist.body.length).toEqual(listWithMultipleBlogs.length);
});

afterAll(async () => {
  await mongoose.connection.close();
});
