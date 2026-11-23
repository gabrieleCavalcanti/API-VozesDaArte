import { Request, Response } from "express";
import { PostService } from "../services/post.service";
import { AuthService } from "../services/auth.service";
import { ArtistaService } from "../services/artista.service";

// VALIDAR TEXTO
const validarTexto = (
  valor: unknown,
  minimo: number,
  maximo: number,
): boolean => {
  return (
    typeof valor === "string" &&
    valor.trim().length >= minimo &&
    valor.trim().length <= maximo
  );
};

// VALIDAR ID
const validarId = (id: unknown): boolean => {
  return Number.isInteger(Number(id)) && Number(id) > 0;
};

// VALIDAR CAMPO OPCIONAL
const validarCampoOpcional = (valor: unknown, maximo: number): boolean => {
  return (
    valor === undefined ||
    valor === null ||
    (typeof valor === "string" && valor.trim().length <= maximo)
  );
};

export class PostController {
  private postService = new PostService();
  private authService = new AuthService();
  private artistaService = new ArtistaService();

  // BUSCAR ARTISTA AUTENTICADO
  private obterArtistaAutenticado = async (req: Request) => {
    if (!req.user) {
      throw new Error("Usuário não autenticado.");
    }

    const autenticacao = await this.authService.findById(
      req.user.id_autenticacao,
    );

    if (autenticacao.tipo !== "ARTISTA") {
      throw new Error("Apenas artistas podem realizar esta ação.");
    }

    const artista = await this.artistaService.findByUsuario(
      autenticacao.id_usuario,
    );

    if (!artista || !artista.id_artista) {
      throw new Error("Artista não encontrado.");
    }

    return {
      ...artista,
      id_artista: artista.id_artista,
    };
  };

  // BUSCAR POST PELO ID
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_post = Number(req.params.id);

      if (!validarId(id_post)) {
        res.status(400).json({
          message: "ID inválido.",
        });
        return;
      }

      const post = await this.postService.findById(id_post);

      res.status(200).json(post);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao buscar post.";

      res
        .status(mensagem.includes("não encontrado") ? 404 : 500)
        .json({ message: mensagem });
    }
  };

  // LISTAR TODOS OS POSTS
  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const posts = await this.postService.findAll();

      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao listar posts.",
      });
    }
  };

  // BUSCAR FEED DE POSTS
findFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagina = Number(req.query.pagina) || 1;

    const latitudeUsuario =
      req.query.latitude !== undefined
        ? Number(req.query.latitude)
        : undefined;

    const longitudeUsuario =
      req.query.longitude !== undefined
        ? Number(req.query.longitude)
        : undefined;

    if (
      (latitudeUsuario !== undefined && !Number.isFinite(latitudeUsuario)) ||
      (longitudeUsuario !== undefined && !Number.isFinite(longitudeUsuario))
    ) {
      res.status(400).json({
        message: "Coordenadas inválidas.",
      });
      return;
    }

    const posts = await this.postService.findAll(
      pagina,
      latitudeUsuario,
      longitudeUsuario,
    );

    res.status(200).json(posts);
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao buscar feed de posts.";

    res.status(500).json({
      message: mensagem,
    });
  }
};

  // LISTAR POSTS DE UM ARTISTA
  findByArtista = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_artista = Number(req.params.id_artista);

      if (!validarId(id_artista)) {
        res.status(400).json({
          message: "ID do artista inválido.",
        });
        return;
      }

      const posts = await this.postService.findByArtista(id_artista);

      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao listar posts do artista.",
      });
    }
  };

  // CRIAR POST
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);

      const { id_categoria, titulo, descricao, link_externo } = req.body;

      // VALIDAR CAMPOS OBRIGATÓRIOS
      if (!id_categoria || !titulo || !descricao) {
        res.status(400).json({
          message: "Preencha todos os campos obrigatórios.",
        });
        return;
      }

      // VALIDAR CATEGORIA
      if (!validarId(id_categoria)) {
        res.status(400).json({
          message: "Informe uma categoria válida.",
        });
        return;
      }

      // VALIDAR TÍTULO
      if (!validarTexto(titulo, 2, 150)) {
        res.status(400).json({
          message: "O título deve possuir entre 2 e 150 caracteres.",
        });
        return;
      }

      // VALIDAR DESCRIÇÃO
      if (!validarTexto(descricao, 1, 3000)) {
        res.status(400).json({
          message: "A descrição deve possuir até 3000 caracteres.",
        });
        return;
      }

      // VALIDAR LINK EXTERNO
      if (!validarCampoOpcional(link_externo, 500)) {
        res.status(400).json({
          message: "O link externo deve possuir até 500 caracteres.",
        });
        return;
      }

      // CRIAR POST
      const id_post = await this.postService.create(
        Number(id_categoria),
        titulo.trim(),
        descricao.trim(),
        artista.id_artista,
        req.file?.filename,
        link_externo?.trim() || undefined,
      );

      res.status(201).json({
        message: "Post criado com sucesso.",
        id_post,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao criar post.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas")
          ? 403
          : mensagem.includes("não encontrado")
            ? 404
            : mensagem.includes("obrigatórios") ||
                mensagem.includes("válida") ||
                mensagem.includes("possuir")
              ? 400
              : 500;

      res.status(status).json({
        message: mensagem,
      });
    }
  };

  // ATUALIZAR POST
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);

      const id_post = Number(req.params.id);

      if (!validarId(id_post)) {
        res.status(400).json({
          message: "ID inválido.",
        });
        return;
      }

      const { id_categoria, titulo, descricao, link_externo } = req.body;

      if (!id_categoria || !titulo || !descricao) {
        res.status(400).json({
          message: "Preencha todos os campos obrigatórios.",
        });
        return;
      }

      if (!validarId(id_categoria)) {
        res.status(400).json({
          message: "Informe uma categoria válida.",
        });
        return;
      }

      if (!validarTexto(titulo, 2, 150)) {
        res.status(400).json({
          message: "O título deve possuir entre 2 e 150 caracteres.",
        });
        return;
      }

      if (!validarTexto(descricao, 1, 3000)) {
        res.status(400).json({
          message: "A descrição deve possuir até 3000 caracteres.",
        });
        return;
      }

      if (!validarCampoOpcional(link_externo, 500)) {
        res.status(400).json({
          message: "O link externo deve possuir até 500 caracteres.",
        });
        return;
      }

      // VERIFICAR SE O POST PERTENCE AO ARTISTA
      const postExistente = await this.postService.findById(id_post);

      if (postExistente.id_artista !== artista.id_artista) {
        res.status(403).json({
          message: "Você não tem permissão para editar este post.",
        });
        return;
      }

      if (postExistente.arquivado) {
        res.status(400).json({
          message: "Não é possível editar um post arquivado.",
        });
        return;
      }

      const atualizado = await this.postService.update(
        id_post,
        Number(id_categoria),
        titulo.trim(),
        descricao.trim(),
        req.file?.filename ?? postExistente.url_img ?? undefined,
        link_externo?.trim() || undefined,
      );

      if (!atualizado) {
        res.status(400).json({
          message: "Não foi possível atualizar o post.",
        });
        return;
      }

      res.status(200).json({
        message: "Post atualizado com sucesso.",
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao atualizar post.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas")
          ? 403
          : mensagem.includes("não encontrado")
            ? 404
            : 400;

      res.status(status).json({
        message: mensagem,
      });
    }
  };

  // ATUALIZAR IMAGEM DO POST
  atualizarImagem = async (req: Request, res: Response): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);

      const id_post = Number(req.params.id);

      if (!validarId(id_post)) {
        res.status(400).json({
          message: "ID inválido.",
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          message: "Envie uma imagem.",
        });
        return;
      }

      const post = await this.postService.findById(id_post);

      if (post.id_artista !== artista.id_artista) {
        res.status(403).json({
          message: "Você não tem permissão para alterar este post.",
        });
        return;
      }

      const atualizado = await this.postService.updateImagem(
        id_post,
        req.file.filename,
      );

      if (!atualizado) {
        res.status(404).json({
          message: "Não foi possível atualizar a imagem.",
        });
        return;
      }

      res.status(200).json({
        message: "Imagem do post atualizada com sucesso.",
        imagem: req.file.filename,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao atualizar imagem.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas")
          ? 403
          : mensagem.includes("não encontrado")
            ? 404
            : 400;

      res.status(status).json({
        message: mensagem,
      });
    }
  };

  // DESTACAR POST
  destacar = async (req: Request, res: Response): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);

      const id_post = Number(req.params.id);

      if (!validarId(id_post)) {
        res.status(400).json({
          message: "ID inválido.",
        });
        return;
      }

      const destacado = await this.postService.destacar(
        id_post,
        artista.id_artista,
      );

      if (!destacado) {
        res.status(400).json({
          message: "Não foi possível destacar o post.",
        });
        return;
      }

      res.status(200).json({
        message: "Post destacado com sucesso.",
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao destacar post.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas") || mensagem.includes("permissão")
          ? 403
          : mensagem.includes("não encontrado")
            ? 404
            : 400;

      res.status(status).json({
        message: mensagem,
      });
    }
  };

  // REMOVER DESTAQUE
  removerDestaque = async (req: Request, res: Response): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);

      const id_post = Number(req.params.id);

      if (!validarId(id_post)) {
        res.status(400).json({
          message: "ID inválido.",
        });
        return;
      }

      const removido = await this.postService.removerDestaque(
        id_post,
        artista.id_artista,
      );

      if (!removido) {
        res.status(400).json({
          message: "Não foi possível remover o destaque.",
        });
        return;
      }

      res.status(200).json({
        message: "Destaque removido com sucesso.",
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao remover destaque.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas") || mensagem.includes("permissão")
          ? 403
          : mensagem.includes("não encontrado")
            ? 404
            : 400;

      res.status(status).json({
        message: mensagem,
      });
    }
  };

  // ARQUIVAR POST
  arquivar = async (req: Request, res: Response): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);

      const id_post = Number(req.params.id);

      if (!validarId(id_post)) {
        res.status(400).json({
          message: "ID inválido.",
        });
        return;
      }

      const arquivado = await this.postService.arquivar(
        id_post,
        artista.id_artista,
      );

      if (!arquivado) {
        res.status(400).json({
          message: "Não foi possível arquivar o post.",
        });
        return;
      }

      res.status(200).json({
        message: "Post arquivado com sucesso.",
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao arquivar post.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas") || mensagem.includes("permissão")
          ? 403
          : mensagem.includes("não encontrado")
            ? 404
            : 400;

      res.status(status).json({
        message: mensagem,
      });
    }
  };

  // DESARQUIVAR POST
  desarquivar = async (req: Request, res: Response): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);

      const id_post = Number(req.params.id);

      if (!validarId(id_post)) {
        res.status(400).json({
          message: "ID inválido.",
        });
        return;
      }

      const desarquivado = await this.postService.desarquivar(
        id_post,
        artista.id_artista,
      );

      if (!desarquivado) {
        res.status(400).json({
          message: "Não foi possível desarquivar o post.",
        });
        return;
      }

      res.status(200).json({
        message: "Post desarquivado com sucesso.",
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao desarquivar post.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas") || mensagem.includes("permissão")
          ? 403
          : mensagem.includes("não encontrado")
            ? 404
            : 400;

      res.status(status).json({
        message: mensagem,
      });
    }
  };
}
