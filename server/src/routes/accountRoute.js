import { Router } from "express";
import {
  getUserData,
  uploadPicture,
  getPicture,
  changePassword,
} from "../controllers/accountController.js";
import authenticateUser from "../middlewares/authenticateUser.js";

const router = Router();

router.get("/all", authenticateUser, getUserData);
router.post("/picture/upload", authenticateUser, uploadPicture);
router.get("/picture/get", authenticateUser, getPicture);
router.put("/password/change", authenticateUser, changePassword);

export default router;
