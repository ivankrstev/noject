import socketStore from "./connectedUsers.js";
import projectRoomEvent from "./events/projectRoomEvent.js";

const handleSocketIO = (io) => {
  io.on("connection", (socket) => {
    projectRoomEvent(socket);

    socket.on("disconnect", () => {
      socketStore.removeSocketByEmail(socket.user, socket.id);
    });
  });
};

export default handleSocketIO;
