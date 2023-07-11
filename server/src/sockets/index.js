import { setSocketId } from "./connectedUsers.js";

const handleSocketIO = (io) => {
  io.on("connection", (socket) => {
    setSocketId(socket.user, socket.id);
    console.log(socket.id);
    // Event listeners
    // socket.on("event", (data) => {
    //   // Handle the event
    // });

    // Emit events
    // socket.emit("event", data);
  });
};

export default handleSocketIO;
