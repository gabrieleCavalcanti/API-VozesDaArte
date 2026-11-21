import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthMiddleware } from "../middleware/AuthMiddleware";

const router = Router();

const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

// ROTAS DE AUTENTICAÇÃO
// router.post("/register", authController.register);

router.post("/login", authController.login);
router.post("/refresh", authController.refresh);

router.get(
    "/me",
    authMiddleware.authenticate,
    authController.me
);

router.post("/logout", authController.logout);

export default router;