const User = require("../models/userModel");

module.exports.getUserAll = async (req, res) => {
  User.find().then((result) => {
    return res.status(200).json({ result });
  });
};

module.exports.postUser = async (req, res) => {
  let { name } = req.body;
  let userDoc = new User({
    name,
  });

  userDoc
    .save()
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
  return res.status(200).json({ name });
};
