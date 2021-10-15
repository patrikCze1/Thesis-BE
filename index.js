const express = require("express");
const app = express();
const cors = require("cors");
const csrf = require("csurf"); //csrf??
const cookieParser = require("cookie-parser");
const i18next = require("i18next");
const i18Middleware = require("i18next-http-middleware");

require("dotenv/config");
const sequelize = require("./models/index");
const {
  projectRoutes,
  projectStageRoutes,
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
  searchRoutes,
} = require("./routes");

sequelize.sync();

i18next.use(i18Middleware.LanguageDetector).init({
  preload: ["cs", "en"],
});

if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
      optionsSuccessStatus: 200,
    })
  );
}

app.use(i18Middleware.handle(i18next)); // todo include locales json

app.use(express.json()); // todo post routes
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use(csrf({ cookie: true }));

/**
 * List of routes
 */
app.use("/api/projects", projectRoutes);
app.use("/api/projects", projectStageRoutes);
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
app.use("/api/search", searchRoutes);

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
