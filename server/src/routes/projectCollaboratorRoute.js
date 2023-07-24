import { Router } from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import { searchUsers } from "../controllers/projectCollaboratorsController.js";

const router = Router();

router.get("/search", authenticateUser, searchUsers);

export default router;
