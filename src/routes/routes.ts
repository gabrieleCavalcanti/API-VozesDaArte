import { Router } from "express";

import authRoutes from "./auth.routes";
import usuarioRoutes from "./usuario.routes";
import artistaRoutes from "./artista.routes";
import categoriaRoutes from "./categoria.routes";
import enderecoRoutes from "./endereco.routes";
import postRoutes from "./post.routes";
import eventoRoutes from "./evento.routes";
import favoritoRoutes from "./favorito.routes";
import likeRoutes from "./like.routes";

const router = Router();

// ROTAS DA APLICAÇÃO
router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/artistas", artistaRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/enderecos", enderecoRoutes);
router.use("/posts", postRoutes);
router.use("/eventos", eventoRoutes);
router.use("/favoritos", favoritoRoutes);
router.use("/likes", likeRoutes);

export default router;