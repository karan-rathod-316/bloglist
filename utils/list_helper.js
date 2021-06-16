const dummy = (blogs) => {
  console.log(blogs);
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
module.exports = { dummy, totalLikes, favoriteBlog };
