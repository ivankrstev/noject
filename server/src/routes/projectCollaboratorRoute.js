import { Router } from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import {
  searchUsers,
  addCollaborator,
  getCollaborators,
} from "../controllers/projectCollaboratorsController.js";
import verifyProjectOwnership from "../middlewares/verifyProjectOwnership.js";

const router = Router();

router.get("/search", authenticateUser, searchUsers);
router.post("/add", authenticateUser, verifyProjectOwnership, addCollaborator);
router.get("/:p_id", authenticateUser, verifyProjectOwnership, getCollaborators);

export default router;
