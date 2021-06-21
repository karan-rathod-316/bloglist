const dummy = () => {
  return 1;
};

let totalLikes = (blogs) => {
  let total;
  if (blogs.length < 1) {
    total = 0;
  } else {
    blogs.reduce((acc, val) => {
      acc += val.likes;
      total = acc;
      return acc;
    }, 0);
  }
  return total;
};

const favoriteBlog = (blogs) => {
  let sortedBlogs = blogs.sort((a, b) => b.likes - a.likes);
  let result = sortedBlogs[0];
  return result;
};

const missingLike = (blog) => {
  if (!blog.like) {
    return 0;
  }
};
module.exports = { dummy, totalLikes, favoriteBlog, missingLike };
