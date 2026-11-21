
import { Request, Response } from "express";
import { FavoritoService } from "../services/favorito.service";
import { AuthService } from "../services/auth.service";

export class FavoritoController {

    private favoritoService = new FavoritoService();
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

    // BUSCAR FAVORITO PELO ID
    findById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_favorito = Number(req.params.id);

            if (!Number.isInteger(id_favorito) || id_favorito <= 0) {
                res.status(400).json({
                    message: "ID do favorito inválido."
                });
                return;
            }

            const favorito = await this.favoritoService.findById(id_favorito);

            res.status(200).json(favorito);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao buscar favorito.";

            res.status(
                mensagem.includes("não encontrado") ? 404 : 500
            ).json({
                message: mensagem
            });
        }
    };

    // LISTAR FAVORITOS DO USUÁRIO AUTENTICADO
    findByUsuario = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_usuario = await this.obterIdUsuario(req);

            const favoritos = await this.favoritoService.findByUsuario(
                id_usuario
            );

            res.status(200).json(favoritos);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao listar favoritos.";

            res.status(
                mensagem.includes("não autenticado") ? 401 : 500
            ).json({
                message: mensagem
            });
        }
    };

    // LISTAR USUÁRIOS QUE FAVORITARAM UM ARTISTA
    findByArtista = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_artista = Number(req.params.id);

            if (!Number.isInteger(id_artista) || id_artista <= 0) {
                res.status(400).json({
                    message: "ID do artista inválido."
                });
                return;
            }

            const favoritos = await this.favoritoService.findByArtista(
                id_artista
            );

            res.status(200).json(favoritos);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao listar favoritos do artista.";

            res.status(500).json({
                message: mensagem
            });
        }
    };

    // VERIFICAR SE O ARTISTA ESTÁ FAVORITADO
    verificarFavorito = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const id_usuario = await this.obterIdUsuario(req);
            const id_artista = Number(req.params.id_artista);

            if (!Number.isInteger(id_artista) || id_artista <= 0) {
                res.status(400).json({
                    message: "ID do artista inválido."
                });
                return;
            }

            const favoritado = await this.favoritoService.verificarFavorito(
                id_usuario,
                id_artista
            );

            res.status(200).json({
                favoritado
            });

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao verificar favorito.";

            res.status(
                mensagem.includes("não autenticado") ? 401 : 500
            ).json({
                message: mensagem
            });
        }
    };

    // ADICIONAR FAVORITO
    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_usuario = await this.obterIdUsuario(req);
            const id_artista = Number(req.body.id_artista);

            if (!Number.isInteger(id_artista) || id_artista <= 0) {
                res.status(400).json({
                    message: "Informe um ID de artista válido."
                });
                return;
            }

            const id_favorito = await this.favoritoService.create(
                id_artista,
                id_usuario
            );

            res.status(201).json({
                message: "Artista adicionado aos favoritos com sucesso.",
                id_favorito
            });

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao adicionar favorito.";

            const status =
                mensagem.includes("não autenticado") ? 401 :
                mensagem.includes("não encontrado") ? 404 :
                mensagem.includes("já está") ? 409 :
                mensagem.includes("válido") ? 400 : 500;

            res.status(status).json({
                message: mensagem
            });
        }
    };

    // REMOVER FAVORITO
    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_usuario = await this.obterIdUsuario(req);
            const id_artista = Number(req.params.id_artista);

            if (!Number.isInteger(id_artista) || id_artista <= 0) {
                res.status(400).json({
                    message: "ID do artista inválido."
                });
                return;
            }

            await this.favoritoService.delete(
                id_usuario,
                id_artista
            );

            res.status(200).json({
                message: "Artista removido dos favoritos com sucesso."
            });

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao remover favorito.";

            const status =
                mensagem.includes("não autenticado") ? 401 :
                mensagem.includes("não está") ? 404 :
                mensagem.includes("válido") ? 400 : 500;

            res.status(status).json({
                message: mensagem
            });
        }
    };

    // ALTERNAR FAVORITO
    toggle = async (req: Request, res: Response): Promise<void> => {
        try {
            const id_usuario = await this.obterIdUsuario(req);
            const id_artista = Number(req.params.id_artista);

            if (!Number.isInteger(id_artista) || id_artista <= 0) {
                res.status(400).json({
                    message: "ID do artista inválido."
                });
                return;
            }

            const resultado = await this.favoritoService.toggle(
                id_usuario,
                id_artista
            );

            res.status(200).json(resultado);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao alternar favorito.";

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
