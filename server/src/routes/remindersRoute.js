import { Router } from "express";
import verifyTaskAccess from "../middlewares/verifyTaskAccess.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import {
  createReminder,
  deleteReminder,
  updateReminder,
} from "../controllers/remindersController.js";

const router = Router();

router.post("/:t_id", authenticateUser, verifyTaskAccess, createReminder);
router.put("/:t_id", authenticateUser, verifyTaskAccess, updateReminder);
router.delete("/:t_id", authenticateUser, verifyTaskAccess, deleteReminder);

export default router;
