//Require Mongoose
const mongoose = require("mongoose");

//Define a schema
const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    msg: {
      type: String,
      required: true,
    },
    updated: { type: Date, default: Date.now },
  },
  {
    writeConcern: {
      w: "majority",
      j: true,
      wtimeout: 1000,
    },
  }
);

//Model allow us to communicate with DB collections!
const Chat = mongoose.model("chat", ChatSchema);

module.exports = Chat;
