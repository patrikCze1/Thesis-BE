const db = require("./../models");
const User = db.User;
const Op = db.Sequelize.Op;
const generateAccessToken = require("./../auth/auth");

exports.create = async (req, res) => {
  // Validate request
  if (!req.body.username) {
    res.status(400).send({
      message: "Content can not be empty!",
      data: req.body,
    });
    return;
  }

  const user = {
    username: req.body.username,
    password: req.body.password,
  };

  User.create(user)
    .then((data) => {
      console.log(data);
      // res.send(data);
      const token = generateAccessToken({ userId: data.id });
      res.send(token);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the user.",
      });
    });
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
  User.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};


exports.findByEmailAndPassword = async (email, password) => {
    const user = await User.findOne({where: {email: email, password: password }});

    return user;
}