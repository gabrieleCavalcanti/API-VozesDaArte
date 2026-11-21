
import { Request, Response } from "express";
import { CategoriaService } from "../services/categoria.service";

export class CategoriaController {

    private categoriaService = new CategoriaService();

    // BUSCAR TODAS AS CATEGORIAS
    findAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const categorias = await this.categoriaService.findAll();

            res.status(200).json(categorias);

        } catch (error) {
            res.status(500).json({
                mensagem: "Erro ao buscar categorias."
            });
        }
    };

    // BUSCAR CATEGORIA POR ID
    findById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_categoria = Number(req.params.id);

            const categoria = await this.categoriaService.findById(
                id_categoria
            );

            res.status(200).json(categoria);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao buscar categoria.";

            const status = mensagem === "Categoria não encontrada."
                ? 404
                : 400;

            res.status(status).json({ mensagem });
        }
    };

    // CADASTRAR CATEGORIA
    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const { nome_categoria, descricao } = req.body;

            const categoria = await this.categoriaService.create(
                nome_categoria,
                descricao
            );

            res.status(201).json({
                mensagem: "Categoria cadastrada com sucesso.",
                categoria
            });

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao cadastrar categoria.";

            res.status(400).json({ mensagem });
        }
    };

    // ATUALIZAR CATEGORIA
    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_categoria = Number(req.params.id);

            const { nome_categoria, descricao } = req.body;

            const categoria = await this.categoriaService.update(
                id_categoria,
                nome_categoria,
                descricao
            );

            res.status(200).json({
                mensagem: "Categoria atualizada com sucesso.",
                categoria
            });

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao atualizar categoria.";

            const status = mensagem === "Categoria não encontrada."
                ? 404
                : 400;

            res.status(status).json({ mensagem });
        }
    };

    // EXCLUIR CATEGORIA
    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_categoria = Number(req.params.id);

            await this.categoriaService.delete(id_categoria);

            res.status(200).json({
                mensagem: "Categoria excluída com sucesso."
            });

        } catch (error) {
            const erro = error as { message?: string; code?: string };

            if (erro.code === "ER_ROW_IS_REFERENCED_2") {
                res.status(409).json({
                    mensagem: "Não é possível excluir a categoria porque existem usuários vinculados."
                });
                return;
            }

            const mensagem = erro.message || "Erro ao excluir categoria.";

            const status = mensagem === "Categoria não encontrada."
                ? 404
                : 400;

            res.status(status).json({ mensagem });
        }
    };

    // BUSCAR INTERESSES DO USUÁRIO
    findInteressesByUsuario = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const id_usuario = Number(req.params.id_usuario);

            const interesses = await this.categoriaService.findInteressesByUsuario(
                id_usuario
            );

            res.status(200).json(interesses);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao buscar interesses.";

            const status = mensagem === "Usuário não encontrado."
                ? 404
                : 400;

            res.status(status).json({ mensagem });
        }
    };

    // ADICIONAR INTERESSE
    addInteresse = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_usuario = Number(req.params.id_usuario);
            const id_categoria = Number(req.params.id_categoria);

            const resultado = await this.categoriaService.addInteresse(
                id_usuario,
                id_categoria
            );

            res.status(201).json(resultado);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao adicionar interesse.";

            let status = 400;

            if (
                mensagem === "Usuário não encontrado." ||
                mensagem === "Categoria não encontrada."
            ) {
                status = 404;
            }

            if (mensagem.includes("já está nos interesses")) {
                status = 409;
            }

            res.status(status).json({ mensagem });
        }
    };

    // REMOVER INTERESSE
    removeInteresse = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const id_usuario = Number(req.params.id_usuario);
            const id_categoria = Number(req.params.id_categoria);

            const resultado = await this.categoriaService.removeInteresse(
                id_usuario,
                id_categoria
            );

            res.status(200).json(resultado);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao remover interesse.";

            let status = 400;

            if (mensagem === "Usuário não encontrado.") {
                status = 404;
            }

            if (mensagem === "Interesse não encontrado.") {
                status = 404;
            }

            res.status(status).json({ mensagem });
        }
    };
}
