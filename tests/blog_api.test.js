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
  let blogTwo = new Blog(listWithMultipleBlogs[0]);
  await blogTwo.save();
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
  const newBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  let response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(3);
});

test("verify if likes are missing", async () => {
  const newBlog = {
    title: "TestLikes",
    author: "TestLikes",
    url: "http://TestLikes",
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  let response = await api.get("/api/blogs");
  let likesCount = blogListHelper.missingLike(response.body);
  expect(likesCount).toBe(0);
});

test("missing title or url", async () => {
  const newBlog = {
    author: "testURLandTITLE",
    likes: 12,
  };

  await api.post("/api/blogs/").send(newBlog).expect(400);

  let response = await api.get("/api/blogs");
  let blogCount = response.body.length;
  expect(blogCount).toBe(listWithMultipleBlogs.length);
});

test("delete a blog", async () => {
  let blogList = await api.get("/api/blogs");
  let ids = blogList.body.map((blog) => blog.id);
  await api.delete(`/api/blogs/${ids[0]}`).expect(204);

  let updatedBloglist = await api.get("/api/blogs");
  expect(updatedBloglist.body.length).toEqual(listWithMultipleBlogs.length - 1);
});

test("verify that a blog can be updated", async () => {
  const response = await api.get("/api/blogs");
  const blogId = response.body[0].id;

  const updatedBlog = {
    title: "TestPutRequest",
    author: "TestPutRequest",
    url: "http://TestPutRequest",
    likes: 12,
  };

  await api
    .put(`/api/blogs/${blogId}`)
    .send(updatedBlog)
    .expect("Content-Type", /application\/json/);

  let updatedBlogList = await api.get(`/api/blogs/${blogId}`);
  expect(updatedBlogList.body.title).toEqual(updatedBlog.title);
});

afterAll(async () => {
  await mongoose.connection.close();
});
