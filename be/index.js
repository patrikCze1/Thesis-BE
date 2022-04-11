const express = require("express");
require("dotenv/config");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const cookieParser = require("cookie-parser");

const csrf = require("csurf");
const i18next = require("i18next");
const i18Middleware = require("i18next-http-middleware");
const path = require("path");
const Backend = require("i18next-node-fs-backend");

const io = require("./service/io").init(server);
const sequelize = require("./models/index");
const {
  projectRoutes,
  boardRoutes,
  stageRoutes,
  clientRoutes,
  taskRoutes,
  taskAttachmentRoutes,
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
  cronRoutes,
} = require("./routes");
const { connect, disconnect } = require("./service/io");

sequelize.sync();

i18next
  .use(Backend)
  .use(i18Middleware.LanguageDetector)
  .init({
    preload: ["cs", "en"],
    backend: {
      loadPath: path.join(__dirname + "/locales/{{lng}}/{{ns}}.json"),
    },
    fallbackLng: "en",
  });

// if (process.env.NODE_ENV !== "production") {
app.use(
  cors({
    origin: process.env.FE_URI,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
// }

// app.options("*", cors()); // enable preflight

app.use(i18Middleware.handle(i18next)); // todo include locales json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// mount csrf ingnored routes before csrf is appended to the app stack
app.use("/api/auth", authRoutes);

app.use(csrf({ cookie: true }));

// error handler
app.use(function (err, req, res, next) {
  if (err.code !== "EBADCSRFTOKEN") return next(err);

  // handle CSRF token errors here
  res.status(403).json({ message: "Bad csrf token" });
});

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId && userId !== undefined) {
    console.log("New client connected", socket.id);
    connect(socket.id, parseInt(userId));
    socket.join(parseInt(userId));

    console.log("userId", typeof userId, userId);
  } else disconnect(socket.id);
  console.log("rooms", io.sockets.adapter.rooms);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    disconnect(socket.id);
  });
});

app.use(express.static(path.resolve(__dirname, "./client")));

// List of routes
app.use("/api/projects", projectRoutes);
app.use("/api/projects", boardRoutes);
app.use("/api/boards", stageRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", taskRoutes);
app.use("/api/tasks", taskCommentRoutes);
app.use("/api/tasks", taskAttachmentRoutes);
app.use("/api/tasks/checks", taskCheckRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/tracks", timeTrackRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/me", meRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/cron", cronRoutes);

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "index.html"));
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

// save date as utc
