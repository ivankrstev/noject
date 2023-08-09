import { Router } from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import { getAllTasks, updateTaskValue } from "../controllers/tasksController.js";
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

export default router;
