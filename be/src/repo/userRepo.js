const { QueryTypes } = require("sequelize");

// const generateAccessToken = require("./../auth/auth");

// exports.create = async (req, res) => {
//   // Validate request
//   if (!req.body.username) {
//     res.status(400).send({
//       message: "Content can not be empty!",
//       data: req.body,
//     });
//     return;
//   }

//   const user = {
//     username: req.body.username,
//     password: req.body.password,
//   };

//   User.create(user)
//     .then((data) => {
//       console.log(data);
//       // res.send(data);
//       const token = generateAccessToken({ userId: data.id });
//       res.send(token);
//     })
//     .catch((err) => {
//       res.status(500).send({
//         message: err.message || "Some error occurred while creating the user.",
//       });
//     });
// };

// Retrieve all users from the database.
// exports.findAll = (req, res) => {
//   User.findAll()
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       res.status(500).send({
//         message: err.message || "Some error occurred while retrieving users.",
//       });
//     });
// };

// exports.findByEmailAndPassword = async (email, password) => {
//   const user = await User.findOne({
//     where: { email: email, password: password },
//   });

//   return user;
// };

exports.findUsersByProject = async (db, id) => {
  try {
    return await db.query(
      `
    SELECT DISTINCT User.* FROM Users AS User 
    LEFT JOIN ProjectUsers AS pu ON User.id = pu.userId 
    LEFT JOIN UserGroups AS ug ON User.id = ug.userId
    LEFT JOIN Groups AS g ON g.id = ug.groupId
    LEFT JOIN ProjectGroups AS pg ON g.id = pg.groupId
    LEFT JOIN Projects AS p ON p.id = :projectId
    WHERE User.deletedAt IS NULL AND (pu.projectId = :projectId OR pg.projectId = :projectId OR p.createdById = User.id)
    ORDER BY User.lastName ASC
    `,
      {
        model: db.User,
        replacements: { projectId: id },
        type: QueryTypes.SELECT,
      }
    );
  } catch (error) {
    console.error("findUsersByProject", error);
    throw error.message;
  }
};
