
import { Router } from "express";
import { ArtistaController } from "../controllers/artista.controller";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import uploadImage from "../middleware/uploadImage.middleware";

const router = Router();

const artistaController = new ArtistaController();
const authMiddleware = new AuthMiddleware();

// ROTAS DE ARTISTA
router.get("/", artistaController.findAll);
router.get("/usuario/:id_usuario", artistaController.findByUsuario);

// ATUALIZAR FOTO DE CAPA
router.put(
    "/fotoCapa",
    authMiddleware.authenticate,
    uploadImage,
    artistaController.atualizarFotoCapa
);

// ATUALIZAR ARTISTA
router.put("/:id", artistaController.update);

// BUSCAR ARTISTA PELO ID
router.get("/:id", artistaController.findById);

// router.post("/artistas", artistaController.create);
// router.delete("/:id", artistaController.delete);

export default router;
