
import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import uploadImage from "../middleware/uploadImage.middleware";

const router = Router();

const postController = new PostController();
const authMiddleware = new AuthMiddleware();

// ROTAS PÚBLICAS
router.get("/", postController.findAll);
router.get("/artista/:id_artista", postController.findByArtista);
router.get("/:id", postController.findById);

// CRIAR POST
router.post(
  "/",
  authMiddleware.authenticate,
  uploadImage,
  postController.create
);

// ATUALIZAR POST
router.put(
  "/:id",
  authMiddleware.authenticate,
  uploadImage,
  postController.update
);

// ATUALIZAR IMAGEM
router.patch(
  "/:id/imagem",
  authMiddleware.authenticate,
  uploadImage,
  postController.atualizarImagem
);

// DESTACAR POST
router.patch(
  "/:id/destacar",
  authMiddleware.authenticate,
  postController.destacar
);

// REMOVER DESTAQUE
router.patch(
  "/:id/remover-destaque",
  authMiddleware.authenticate,
  postController.removerDestaque
);

// ARQUIVAR POST
router.patch(
  "/:id/arquivar",
  authMiddleware.authenticate,
  postController.arquivar
);

// DESARQUIVAR POST
router.patch(
  "/:id/desarquivar",
  authMiddleware.authenticate,
  postController.desarquivar
);

export default router;
