
import { Router } from "express";
import { EnderecoController } from "../controllers/endereco.controller";
import { AuthMiddleware } from "../middleware/AuthMiddleware";

const router = Router();

const enderecoController = new EnderecoController();
const authMiddleware = new AuthMiddleware();

// Buscar endereço do usuário autenticado
router.get(
    "/me",
    authMiddleware.authenticate,
    enderecoController.findMyAddress
);

// Cadastrar ou atualizar endereço
router.put(
    "/me",
    authMiddleware.authenticate,
    enderecoController.saveOrUpdate
);

export default router;
