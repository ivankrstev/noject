import { Router } from "express";
import {
  registerUser,
  loginUser,
  verifyTFA,
  refreshToken,
  enableTFA,
  disableTFA,
  signOut,
} from "../controllers/authController.js";
import authenticateUser from "../middlewares/authenticateUser.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/tfa/verify", verifyTFA);
router.post("/refresh-token", refreshToken);
router.put("/tfa/enable", authenticateUser, enableTFA);
router.put("/tfa/disable", authenticateUser, disableTFA);
router.post("/tfa/generate", authenticateUser, generateTfaSecret);
router.delete("/signout", authenticateUser, signOut);

export default router;
