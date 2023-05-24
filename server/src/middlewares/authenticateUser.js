import jwt from "jsonwebtoken";

export default function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Authorization header missing or invalid" });
    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
    req.user = user.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
