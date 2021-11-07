const express = require("express");
require("dotenv/config");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const csrf = require("csurf"); //csrf??
const cookieParser = require("cookie-parser");
const i18next = require("i18next");
const i18Middleware = require("i18next-http-middleware");
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.FE_URI,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    // allowedHeaders: ["my-custom-header"],
    // credentials: true,
  },
});

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
      origin: process.env.FE_URI,
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

let interval;

const getApiAndEmit = (socket) => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

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
app.use("/api/notifications", notificationRoutes);
app.use("/api/me", meRoutes);
app.use("/api/search", searchRoutes);

app.get("/", (req, res) => {
  res.send("Api index");
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

//nodemon index.js
//socket, pwa, graphql, check xss
// todo role, turn off notifikace
