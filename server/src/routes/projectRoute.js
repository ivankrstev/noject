import { Router } from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import { createProject, deleteProject, getProjects } from "../controllers/projectController.js";
import verifyProjectOwnership from "../middlewares/verifyProjectOwnership.js";

const router = Router();

router.get("/all", authenticateUser, getProjects);
router.post("/create", authenticateUser, createProject);
router.delete("/delete/:p_id", authenticateUser, verifyProjectOwnership, deleteProject);

export default router;
