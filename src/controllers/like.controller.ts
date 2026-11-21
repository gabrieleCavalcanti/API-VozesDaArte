
import { Request, Response } from "express";
import { LikeService } from "../services/like.service";
import { AuthService } from "../services/auth.service";

export class LikeController {

    private likeService = new LikeService();
    private authService = new AuthService();

    // BUSCAR ID DO USUÁRIO AUTENTICADO
    private obterIdUsuario = async (req: Request): Promise<number> => {

        if (!req.user) {
            throw new Error("Usuário não autenticado.");
        }

        const autenticacao = await this.authService.findById(
            req.user.id_autenticacao
        );

        return autenticacao.id_usuario;
    };

    // BUSCAR LIKE PELO ID
    findById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_like = Number(req.params.id);

            if (!Number.isInteger(id_like) || id_like <= 0) {
                res.status(400).json({
                    message: "ID do like inválido."
                });
                return;
            }

            const like = await this.likeService.findById(id_like);

            res.status(200).json(like);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao buscar curtida.";

            res.status(
                mensagem.includes("não encontrada") ? 404 : 500
            ).json({
                message: mensagem
            });
        }
    };

    // LISTAR LIKES DO USUÁRIO AUTENTICADO
    findByUsuario = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_usuario = await this.obterIdUsuario(req);

            const likes = await this.likeService.findByUsuario(id_usuario);

            res.status(200).json(likes);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao listar curtidas.";

            res.status(
                mensagem.includes("não autenticado") ? 401 : 500
            ).json({
                message: mensagem
            });
        }
    };

    // LISTAR LIKES DE UM POST
    findByPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_post = Number(req.params.id);

            if (!Number.isInteger(id_post) || id_post <= 0) {
                res.status(400).json({
                    message: "ID do post inválido."
                });
                return;
            }

            const likes = await this.likeService.findByPost(id_post);

            res.status(200).json(likes);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao listar curtidas do post.";

            res.status(500).json({
                message: mensagem
            });
        }
    };

    // VERIFICAR SE O USUÁRIO CURTIU O POST
    verificarLike = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const id_usuario = await this.obterIdUsuario(req);
            const id_post = Number(req.params.id_post);

            if (!Number.isInteger(id_post) || id_post <= 0) {
                res.status(400).json({
                    message: "ID do post inválido."
                });
                return;
            }

            const curtido = await this.likeService.verificarLike(
                id_usuario,
                id_post
            );

            res.status(200).json({
                curtido
            });

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao verificar curtida.";

            res.status(
                mensagem.includes("não autenticado") ? 401 : 500
            ).json({
                message: mensagem
            });
        }
    };

    // CONTAR LIKES DE UM POST
    countByPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_post = Number(req.params.id);

            if (!Number.isInteger(id_post) || id_post <= 0) {
                res.status(400).json({
                    message: "ID do post inválido."
                });
                return;
            }

            const total = await this.likeService.countByPost(id_post);

            res.status(200).json({
                id_post,
                total_likes: total
            });

        } catch (error) {
            res.status(500).json({
                message: "Erro ao contar curtidas do post."
            });
        }
    };

    // CURTIR POST
    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_usuario = await this.obterIdUsuario(req);
            const id_post = Number(req.body.id_post);

            if (!Number.isInteger(id_post) || id_post <= 0) {
                res.status(400).json({
                    message: "Informe um ID de post válido."
                });
                return;
            }

            const id_like = await this.likeService.create(
                id_usuario,
                id_post
            );

            res.status(201).json({
                message: "Post curtido com sucesso.",
                id_like
            });

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao curtir post.";

            const status =
                mensagem.includes("não autenticado") ? 401 :
                mensagem.includes("não encontrado") ? 404 :
                mensagem.includes("já curtiu") ? 409 :
                mensagem.includes("válido") ? 400 : 500;

            res.status(status).json({
                message: mensagem
            });
        }
    };

    // DESCURTIR POST
    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_usuario = await this.obterIdUsuario(req);
            const id_post = Number(req.params.id_post);

            if (!Number.isInteger(id_post) || id_post <= 0) {
                res.status(400).json({
                    message: "ID do post inválido."
                });
                return;
            }

            await this.likeService.delete(
                id_usuario,
                id_post
            );

            res.status(200).json({
                message: "Curtida removida com sucesso."
            });

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao remover curtida.";

            const status =
                mensagem.includes("não autenticado") ? 401 :
                mensagem.includes("ainda não curtiu") ? 404 :
                mensagem.includes("válido") ? 400 : 500;

            res.status(status).json({
                message: mensagem
            });
        }
    };

    // ALTERNAR LIKE: CURTIR OU DESCURTIR
    toggle = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_usuario = await this.obterIdUsuario(req);
            const id_post = Number(req.params.id_post);

            if (!Number.isInteger(id_post) || id_post <= 0) {
                res.status(400).json({
                    message: "ID do post inválido."
                });
                return;
            }

            const resultado = await this.likeService.toggle(
                id_usuario,
                id_post
            );

            res.status(200).json(resultado);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao alternar curtida.";

            const status =
                mensagem.includes("não autenticado") ? 401 :
                mensagem.includes("não encontrado") ? 404 :
                mensagem.includes("válido") ? 400 : 500;

            res.status(status).json({
                message: mensagem
            });
        }
    };
}
