import jwt from "jsonwebtoken";

export default function authenticateUserSocket(socket, next) {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error: Token not provided"));
    const user = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
    socket.user = user.userId;
    next();
  } catch (error) {
    console.error(error);
    return next(new Error("Authentication error: Invalid token"));
  }
}
