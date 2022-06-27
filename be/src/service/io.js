const socket = require("socket.io");
let io = null;
let connections = [];

const init = (server) => {
  return (io = socket(server, {
    cors: {
      origin: process.env.FE_URI,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      // allowedHeaders: ["my-custom-header"],
      // credentials: true,
    },
  }));
};

const connect = (socketId, userId) => {
  connections = [...connections, { socketId, userId }];
  console.log("socket connections", connections);
  console.log(" process.env", process.env);
};

const disconnect = (socketId) => {
  connections = connections.filter((conn) => conn.socketId !== socketId);
};

const getConnections = () => {
  return connections;
};

exports.getIo = () => io;
exports.init = init;
exports.connect = connect;
exports.disconnect = disconnect;
exports.getConnections = getConnections;
