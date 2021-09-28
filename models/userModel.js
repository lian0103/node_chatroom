//Require Mongoose
const mongoose = require("mongoose");

//Define a schema
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique:true,
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
const User = mongoose.model("user", UserSchema);

module.exports = User;
