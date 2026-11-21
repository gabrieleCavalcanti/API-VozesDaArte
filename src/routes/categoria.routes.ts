
import { Router } from "express";
import { CategoriaController } from "../controllers/categoria.controller";

const router = Router();

const categoriaController = new CategoriaController();

// ROTAS DE CATEGORIAS

router.get("/", categoriaController.findAll);

router.get(
    "/usuario/:id_usuario",
    categoriaController.findInteressesByUsuario
);

router.get("/:id", categoriaController.findById);

router.post("/", categoriaController.create);

router.post(
    "/usuario/:id_usuario/:id_categoria",
    categoriaController.addInteresse
);

router.put("/:id", categoriaController.update);

router.delete(
    "/usuario/:id_usuario/:id_categoria",
    categoriaController.removeInteresse
);

router.delete("/:id", categoriaController.delete);

export default router;
