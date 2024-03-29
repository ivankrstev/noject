import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./src/routes/authRoute.js";
import accountRouter from "./src/routes/accountRoute.js";
import projectRouter from "./src/routes/projectRoute.js";
import projectCollaboratorRouter from "./src/routes/projectCollaboratorRoute.js";
import tasksRouter from "./src/routes/tasksRoute.js";
import remindersRouter from "./src/routes/remindersRoute.js";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import { createServer } from "http";
import { Server } from "socket.io";
import handleSocketIO from "./src/sockets/index.js";
import authenticateUserSocket from "./src/middlewares/authenticateUserSocket.js";
import parseSocketCookies from "./src/middlewares/parseSocketCookies.js";
import runCronJob from "./src/cron/index.js";

runCronJob();
const app = express();
config();

app.use(cors({ origin: process.env.ORIGINS?.split(","), credentials: true }));
app.use(cookieParser());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ORIGINS?.split(","),
    credentials: true,
  },
});

io.use(parseSocketCookies);
io.use(authenticateUserSocket);
handleSocketIO(io);

app.set("io", io);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use(morgan(":date :method :url :status - :total-time ms"));

app.use(authRouter);
app.use("/account", accountRouter);
app.use("/project", projectRouter);
app.use("/project-collaborators", projectCollaboratorRouter);
app.use("/tasks", tasksRouter);
app.use("/reminders", remindersRouter);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  return res.status(statusCode).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Tester for slow response
// app.use(function (req, res, next) {
//   setTimeout(next, 1000);
// });
