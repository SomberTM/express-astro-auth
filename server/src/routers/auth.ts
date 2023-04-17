import { Router } from "express";
import { completeLogin, initiateLogin, logout } from "../controllers/auth";
import { authMiddleware } from "../middleware/express/auth";

const router = Router();

router.post("/login", initiateLogin);

router.post("/login/:code", completeLogin);

// @ts-ignore
router.get("/logout", authMiddleware, logout);

export default router;
