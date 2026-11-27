import { Router } from "express";
import { EventoController } from "../controllers/evento.controller";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import uploadImage from "../middleware/uploadImage.middleware";

const router = Router();

const eventoController = new EventoController();
const authMiddleware = new AuthMiddleware();

// ROTAS PÚBLICAS
router.get("/", eventoController.findAll);

// FEED INTELIGENTE
router.get("/feed", eventoController.findFeed);

// EVENTOS DE UM ARTISTA
router.get("/artista/:id_artista", eventoController.findByArtista);

// LISTAR EVENTOS ARQUIVADOS
// DEVE FICAR ANTES DE /:id
router.get(
  "/arquivados",
  authMiddleware.authenticate,
  eventoController.findArquivados,
);

// BUSCAR EVENTO POR ID
router.get("/:id", eventoController.findById);

// CRIAR EVENTO
router.post(
  "/",
  authMiddleware.authenticate,
  uploadImage,
  eventoController.create,
);

// ATUALIZAR EVENTO
router.put(
  "/:id",
  authMiddleware.authenticate,
  uploadImage,
  eventoController.update,
);

// ATUALIZAR IMAGEM
router.patch(
  "/:id/imagem",
  authMiddleware.authenticate,
  uploadImage,
  eventoController.atualizarImagem,
);

// ARQUIVAR EVENTO
router.patch(
  "/:id/arquivar",
  authMiddleware.authenticate,
  eventoController.arquivar,
);

// DESARQUIVAR EVENTO
router.patch(
  "/:id/desarquivar",
  authMiddleware.authenticate,
  eventoController.desarquivar,
);

// DESTACAR EVENTO
router.patch(
  "/:id/destacar",
  authMiddleware.authenticate,
  eventoController.destacar,
);

// RETIRAR DESTAQUE
router.patch(
  "/:id/retirar-destaque",
  authMiddleware.authenticate,
  eventoController.retirarDestaque,
);

export default router;