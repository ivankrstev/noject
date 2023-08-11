import { Router } from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import { createTask, getAllTasks, updateTaskValue } from "../controllers/tasksController.js";
import verifyProjectAccess from "../middlewares/verifyProjectAccess.js";
import verifyTaskAccess from "../middlewares/verifyTaskAccess.js";

const router = Router();

router.get("/:p_id", authenticateUser, verifyProjectAccess, getAllTasks);
router.put(
  "/:p_id-:t_id/value",
  authenticateUser,
  verifyProjectAccess,
  verifyTaskAccess,
  updateTaskValue
);
router.post("/:p_id", authenticateUser, verifyProjectAccess, createTask);

export default router;
