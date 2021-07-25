const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  like: Boolean,
  username: String,
  blogTitle: String,
});

likeSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Like", likeSchema);
