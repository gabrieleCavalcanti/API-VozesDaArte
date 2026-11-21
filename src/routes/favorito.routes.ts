
import { Router } from "express";
import { FavoritoController } from "../controllers/favorito.controller";
import { AuthMiddleware } from "../middleware/AuthMiddleware";

const router = Router();

const favoritoController = new FavoritoController();
const authMiddleware = new AuthMiddleware();

// LISTAR FAVORITOS DO USUÁRIO AUTENTICADO
router.get(
    "/",
    authMiddleware.authenticate,
    favoritoController.findByUsuario
);

// VERIFICAR SE UM ARTISTA ESTÁ FAVORITADO
router.get(
    "/verificar/:id_artista",
    authMiddleware.authenticate,
    favoritoController.verificarFavorito
);

// LISTAR USUÁRIOS QUE FAVORITARAM UM ARTISTA
router.get(
    "/artista/:id",
    favoritoController.findByArtista
);

// BUSCAR FAVORITO PELO ID
router.get(
    "/:id",
    authMiddleware.authenticate,
    favoritoController.findById
);

// ADICIONAR FAVORITO
router.post(
    "/",
    authMiddleware.authenticate,
    favoritoController.create
);

// ALTERNAR FAVORITO
router.post(
    "/alternar/:id_artista",
    authMiddleware.authenticate,
    favoritoController.toggle
);

// REMOVER FAVORITO
router.delete(
    "/:id_artista",
    authMiddleware.authenticate,
    favoritoController.delete
);

export default router;
