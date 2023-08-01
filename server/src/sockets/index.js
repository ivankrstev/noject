import socketStore from "./connectedUsers.js";

const handleSocketIO = (io) => {
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      socketStore.removeSocketByEmail(socket.user, socket.id);
    });
  });
};

export default handleSocketIO;
