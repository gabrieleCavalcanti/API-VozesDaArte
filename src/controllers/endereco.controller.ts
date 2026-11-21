import { Request, Response } from "express";
import { EnderecoService } from "../services/endereco.service";

export class EnderecoController {
    private enderecoService = new EnderecoService();

    findMyAddress = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    mensagem: "Usuário não autenticado."
                });
                return;
            }

            const username = req.user.username;

            const endereco = await this.enderecoService.findByUsername(username);

            res.status(200).json({
                mensagem: "Endereço encontrado com sucesso.",
                endereco
            });

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao buscar endereço.";

            const status = mensagem === "Endereço não encontrado."
                ? 404 : 400;

            res.status(status).json({ mensagem });
        }
    };

    saveOrUpdate = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    mensagem: "Usuário não autenticado."
                });
                return;
            }

            const username = req.user.username;

            const resultado = await this.enderecoService.saveOrUpdate(
                username,
                req.body
            );

            res.status(200).json(resultado);

        } catch (error) {
            const mensagem = error instanceof Error
                ? error.message
                : "Erro ao salvar endereço.";

            const status = mensagem === "Usuário não encontrado."
                ? 404 : 400;

            res.status(status).json({ mensagem });
        }
    };
}