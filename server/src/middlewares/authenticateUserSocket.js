import jwt from "jsonwebtoken";
import socketStore from "../sockets/connectedUsers.js";

export default function authenticateUserSocket(socket, next) {
  try {
    const token = socket.handshake.cookies.refreshToken;
    if (!token) return next(new Error("Authentication error: Token not provided"));
    const user = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
    socket.user = user.userId;
    socketStore.setSocketId(user.userId, socket.id);
    next();
  } catch (error) {
    console.error(error);
    return next(new Error("Authentication error: Invalid token"));
  }
}
