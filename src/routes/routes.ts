import { Router } from "express";

import authRoutes from "./auth.routes";
import usuarioRoutes from "./usuario.routes";
import artistaRoutes from "./artista.routes";
import categoriaRoutes from "./categoria.routes";
import enderecoRoutes from "./endereco.routes";

const router = Router();

// ROTAS DA APLICAÇÃO
router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/artistas", artistaRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/enderecos", enderecoRoutes);

export default router;