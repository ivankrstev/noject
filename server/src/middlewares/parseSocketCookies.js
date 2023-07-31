export default function parseSocketCookies(socket, next) {
  // Middleware to parse every Socket.io cookie from headers to handshake.cookies
  const cookieString = socket.handshake.headers.cookie;
  const cookies = {};
  cookieString &&
    cookieString.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      cookies[parts.shift().trim()] = decodeURI(parts.join("="));
    });
  socket.handshake.cookies = {};
  Object.keys(cookies).forEach((key) => (socket.handshake.cookies[key] = cookies[key]));
  next();
}
