import { Router } from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import {
  createTask,
  getAllTasks,
  updateTaskValue,
  deleteTask,
  decreaseLevelOfTasks,
} from "../controllers/tasksController.js";
import verifyProjectAccess from "../middlewares/verifyProjectAccess.js";
import verifyTaskAccess from "../middlewares/verifyTaskAccess.js";

const router = Router();

router.get("/:p_id", authenticateUser, verifyProjectAccess, getAllTasks);
router.put("/:t_id/value", authenticateUser, verifyTaskAccess, updateTaskValue);
router.put("/:t_id/decrease-level", authenticateUser, verifyTaskAccess, decreaseLevelOfTasks);
router.post("/:p_id", authenticateUser, verifyProjectAccess, createTask);
router.delete("/:t_id", authenticateUser, verifyTaskAccess, deleteTask);

export default router;
