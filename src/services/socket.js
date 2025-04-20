const { Server } = require("socket.io");

/**
 * @param {http.Server} server
 */
function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("✅new client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = setupSocket;
