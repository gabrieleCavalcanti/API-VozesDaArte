
import { Router } from "express";
import { LikeController } from "../controllers/like.controller";
import { AuthMiddleware } from "../middleware/AuthMiddleware";

const router = Router();

const likeController = new LikeController();
const authMiddleware = new AuthMiddleware();

// LISTAR LIKES DO USUÁRIO AUTENTICADO
router.get(
    "/",
    authMiddleware.authenticate,
    likeController.findByUsuario
);

// VERIFICAR SE O USUÁRIO CURTIU UM POST
router.get(
    "/verificar/:id_post",
    authMiddleware.authenticate,
    likeController.verificarLike
);

// CONTAR LIKES DE UM POST
router.get(
    "/contar/:id",
    likeController.countByPost
);

// LISTAR LIKES DE UM POST
router.get(
    "/post/:id",
    likeController.findByPost
);

// BUSCAR LIKE PELO ID
router.get(
    "/id/:id",
    authMiddleware.authenticate,
    likeController.findById
);

// CURTIR POST
router.post(
    "/",
    authMiddleware.authenticate,
    likeController.create
);

// ALTERNAR LIKE
router.post(
    "/alternar/:id_post",
    authMiddleware.authenticate,
    likeController.toggle
);

// DESCURTIR POST
router.delete(
    "/:id_post",
    authMiddleware.authenticate,
    likeController.delete
);

export default router;
