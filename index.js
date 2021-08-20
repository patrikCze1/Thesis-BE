const express = require("express");
require("dotenv/config");
const app = express();
const cors = require("cors");
const csrf = require('csurf')
const sequelize = require("./models/index");
const {
  projectRoutes,
  clientRoutes,
  taskRoutes,
  taskAttachmentRoutes,
  taskChangeLogRoutes,
  taskCommentRoutes,
  taskCheckRoutes,
  authRoutes,
  userRoutes,
  groupRoutes,
  todoRoutes,
  timeTrackRoutes,
  notificationRoutes,
  meRoutes,
} = require("./routes");

sequelize.sync();

app.use(express.json()); // todo post routes
app.use(express.urlencoded({ extended: true }));

// app.use(csrf({ cookie: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: "http://localhost:3000" }));
}

app.use("/api/projects", projectRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", taskRoutes);
app.use("/api/tasks", taskChangeLogRoutes);
app.use("/api/tasks", taskCommentRoutes);
app.use("/api/tasks", taskAttachmentRoutes);
app.use("/api/tasks/checks", taskCheckRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/tracks", timeTrackRoutes);
app.use("/", notificationRoutes);
app.use("/api/me", meRoutes);

app.get("/", (req, res) => {
  res.send("Api index");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

//nodemon index.js
//socket, pwa, graphql, check xss
// todo role, turn off notifikace
