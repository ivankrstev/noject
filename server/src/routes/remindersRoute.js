import { Router } from "express";
import verifyTaskAccess from "../middlewares/verifyTaskAccess.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import { getReminder } from "../controllers/remindersController.js";

const router = Router();

router.get("/:t_id", authenticateUser, verifyTaskAccess, getReminder);

export default router;
