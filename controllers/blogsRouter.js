const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const Like = require("../models/Likes");

const jwt = require("jsonwebtoken");

blogsRouter.get("/", async (req, res) => {
  let blogs = await Blog.find({}).populate("user", { username: 1, id: 1 });

  res.json(blogs);
});

blogsRouter.get("/:id", async (req, res) => {
  const matchingBlog = await Blog.findById(req.params.id);
  if (matchingBlog) {
    res.json(matchingBlog);
  } else {
    res.status(404).end();
  }
});

blogsRouter.post("/", async (req, res) => {
  let body = req.body;

  const decodedToken = jwt.verify(req.token, process.env.SECRET);

  if (!req.token || !decodedToken) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  const user = await User.findById(decodedToken.id);

  if (!body.title || !body.url) {
    res.status(400).end();
  } else {
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id,
    });

    await User.findByIdAndUpdate(user._id, {
      $push: { blogs: blog._id },
    });

    let savedBlog = await blog.save();
    res.json(savedBlog);
  }
});

blogsRouter.delete("/:id", async (req, res) => {
  const token = req.token;

  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken) {
    return res.status(401).json({
      error: "token missing or invalid",
    });
  }

  const id = req.params.id;
  const blog = await Blog.findById(id);

  if (blog.user.toString() === decodedToken.id) {
    await Blog.findByIdAndDelete(id);
    res.status(204).end();
  } else {
    return res.status(401).json({
      error: "Not authorized to access the blog",
    });
  }
});

blogsRouter.put("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  const blogCreatorsId = blog.user;

  let body = req.body;
  const decodedToken = jwt.verify(req.token, process.env.SECRET);

  if (!req.token || !decodedToken) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  const user = await User.findById(decodedToken.id);

  if (!body.title || !body.url) {
    res.status(400).end();
  } else {
    const body = req.body;

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: blogCreatorsId,
    };

    const like = new Like({
      like: true,
      username: user.username,
      blogTitle: blog.title,
    });

    let allLikes = await Like.find({});

    let checkIfPostAlreadyLiked = allLikes.find((savedLike) => {
      return (
        savedLike.username === user.username &&
        savedLike.blogTitle === blog.title
      );
    });
    if (!checkIfPostAlreadyLiked) {
      await like.save();

      await Blog.findByIdAndUpdate(req.params.id, blog, {
        new: true,
      });

      let updatedBlog = await Blog.findById(req.params.id);
      res.json(updatedBlog);
    } else {
      res.json("Post already liked");
    }
  }
});

module.exports = blogsRouter;
