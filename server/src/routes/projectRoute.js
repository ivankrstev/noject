import { Router } from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import {
  createProject,
  deleteProject,
  getProjects,
  getOneProject,
  updateProject,
  getSharedProjects,
  turnOnProjectSharing,
  turnOffProjectSharing,
  getViewSharedProject,
} from "../controllers/projectController.js";
import verifyProjectOwnership from "../middlewares/verifyProjectOwnership.js";

const router = Router();

router.get("/all", authenticateUser, getProjects);
router.get("/shared", authenticateUser, getSharedProjects);
router.get("/share/:public_link", getViewSharedProject);
router.post("/share/:p_id", authenticateUser, verifyProjectOwnership, turnOnProjectSharing);
router.delete("/share/:p_id", authenticateUser, verifyProjectOwnership, turnOffProjectSharing);
router.get("/:p_id", authenticateUser, getOneProject);
router.post("/create", authenticateUser, createProject);
router.put("/:p_id", authenticateUser, verifyProjectOwnership, updateProject);
router.delete("/:p_id", authenticateUser, verifyProjectOwnership, deleteProject);

export default router;
