const express = require("express");
require("dotenv/config");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const csrf = require("csurf"); //csrf??
const cookieParser = require("cookie-parser");
const i18next = require("i18next");
const i18Middleware = require("i18next-http-middleware");
const path = require("path");

const io = require("./service/io").init(server);
const sequelize = require("./models/index");
const {
  projectRoutes,
  projectStageRoutes,
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
} = require("./routes");
const { connect, disconnect } = require("./service/io");

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
app.use(express.static(path.join(__dirname, "public")));

// app.use(csrf({ cookie: true }));

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
    // socket.leave(1);
  });
});

/**
 * List of routes
 */
app.use("/api/projects", projectRoutes);
app.use("/api/projects", projectStageRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", taskRoutes);
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

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

// todo role, nastaveni notifikaci, notifikace, socket, xss, cors, save date as utc
