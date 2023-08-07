import { Router } from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import { getAllTasks } from "../controllers/tasksController.js";
import verifyProjectAccess from "../middlewares/verifyProjectAccess.js";

const router = Router();

router.get("/:p_id", authenticateUser, verifyProjectAccess, getAllTasks);

export default router;
