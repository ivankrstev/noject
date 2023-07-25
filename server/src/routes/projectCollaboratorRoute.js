import { Router } from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import { searchUsers, addCollaborator } from "../controllers/projectCollaboratorsController.js";
import verifyProjectOwnership from "../middlewares/verifyProjectOwnership.js";

const router = Router();

router.get("/search", authenticateUser, searchUsers);
router.post("/add", authenticateUser, verifyProjectOwnership, addCollaborator);

export default router;
