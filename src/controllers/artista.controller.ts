import { Request, Response } from "express";
import { ArtistaService } from "../services/artista.service";
import { AuthService } from "../services/auth.service";

export class ArtistaController {
  private artistaService = new ArtistaService();
  private authService = new AuthService();

  // BUSCAR ARTISTA PELO ID
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_artista = Number(req.params.id);

      if (!Number.isInteger(id_artista) || id_artista <= 0) {
        res.status(400).json({
          message: "ID inválido.",
        });
        return;
      }

      const artista = await this.artistaService.findById(id_artista);

      res.status(200).json(artista);
    } catch (error) {
      res.status(404).json({
        message:
          error instanceof Error ? error.message : "Erro ao buscar artista.",
      });
    }
  };

  // BUSCAR ARTISTA PELO ID DO USUÁRIO
  findByUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_usuario = Number(req.params.id_usuario);

      if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
        res.status(400).json({
          message: "ID do usuário inválido.",
        });
        return;
      }

      const artista = await this.artistaService.findByUsuario(id_usuario);

      res.status(200).json(artista);
    } catch (error) {
      res.status(404).json({
        message:
          error instanceof Error ? error.message : "Erro ao buscar artista.",
      });
    }
  };

  // LISTAR TODOS OS ARTISTAS
  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const artistas = await this.artistaService.findAll();

      res.status(200).json(artistas);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao listar artistas.",
      });
    }
  };

  // NÃO POSSUI CREATE
  // O CADASTRO É REALIZADO PELO UsuarioController

  // ATUALIZAR ARTISTA
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_artista = Number(req.params.id);

      if (!Number.isInteger(id_artista) || id_artista <= 0) {
        res.status(400).json({
          message: "ID inválido.",
        });
        return;
      }

      const { url_foto_capa, biografia, contato_profissional } = req.body;

      const atualizado = await this.artistaService.update(
        id_artista,
        url_foto_capa,
        biografia,
        contato_profissional,
      );

      if (!atualizado) {
        res.status(400).json({
          message: "Não foi possível atualizar o artista.",
        });
        return;
      }

      res.status(200).json({
        message: "Artista atualizado com sucesso.",
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao atualizar artista.";

      const status = mensagem.includes("não encontrado") ? 404 : 400;

      res.status(status).json({
        message: mensagem,
      });
    }
  };

  // ATUALIZAR FOTO DE CAPA
  atualizarFotoCapa = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          message: "Usuário não autenticado.",
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          message: "Envie uma imagem.",
        });
        return;
      }

      // BUSCAR AUTENTICAÇÃO
      const autenticacao = await this.authService.findById(
        req.user.id_autenticacao,
      );

      // BUSCAR ARTISTA PELO ID DO USUÁRIO
      const artista = await this.artistaService.findByUsuario(
        autenticacao.id_usuario,
      );

      // ATUALIZAR FOTO DE CAPA
      if (!artista.id_artista) {
        res.status(404).json({
          message: "ID do artista não encontrado.",
        });
        return;
      }

      const atualizado = await this.artistaService.updateFotoCapa(
        artista.id_artista,
        req.file.filename,
      );

      if (!atualizado) {
        res.status(404).json({
          message: "Não foi possível atualizar a foto de capa.",
        });
        return;
      }

      res.status(200).json({
        message: "Foto de capa atualizada com sucesso.",
        foto: req.file.filename,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao atualizar foto de capa.";

      res.status(mensagem.includes("não encontrado") ? 404 : 500).json({
        message: mensagem,
      });
    }
  };

  // EXCLUIR ARTISTA
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_artista = Number(req.params.id);

      if (!Number.isInteger(id_artista) || id_artista <= 0) {
        res.status(400).json({
          message: "ID inválido.",
        });
        return;
      }

      const excluido = await this.artistaService.delete(id_artista);

      if (!excluido) {
        res.status(404).json({
          message: "Artista não encontrado.",
        });
        return;
      }

      res.status(200).json({
        message: "Artista excluído com sucesso.",
      });
    } catch (error) {
      res.status(404).json({
        message:
          error instanceof Error ? error.message : "Erro ao excluir artista.",
      });
    }
  };
}
