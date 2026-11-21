
import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller";
import uploadImage from "../middleware/uploadImage.middleware";
import { AuthMiddleware } from "../middleware/AuthMiddleware";

const router = Router();

const usuarioController = new UsuarioController();
const authMiddleware = new AuthMiddleware();

// ROTAS DE USUÁRIO
router.get("/", usuarioController.findAll);
router.get("/email", usuarioController.findByEmail);

// ATUALIZAR FOTO DE PERFIL
router.put(
    "/fotoPerfil",
    authMiddleware.authenticate,
    uploadImage,
    usuarioController.atualizarFoto
);

// ATUALIZAR USUÁRIO
router.put("/:id", usuarioController.update);

// CADASTRAR USUÁRIO
router.post("/", usuarioController.create);

// BUSCAR USUÁRIO PELO ID
router.get("/:id", usuarioController.findById);

// EXCLUIR USUÁRIO
// router.delete("/:id", usuarioController.delete);

export default router;
