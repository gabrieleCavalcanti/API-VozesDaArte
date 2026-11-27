
import { Request, Response } from "express";
import { EventoService } from "../services/evento.service";
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

// VALIDAR VALOR DO EVENTO
const validarValor = (valor: unknown): boolean => {
  return (
    valor !== undefined &&
    valor !== null &&
    valor !== "" &&
    Number.isFinite(Number(valor)) &&
    Number(valor) >= 0
  );
};

// VALIDAR DATA
const validarData = (data: unknown): boolean => {
  return (
    typeof data === "string" &&
    data.trim().length > 0 &&
    !Number.isNaN(new Date(data).getTime())
  );
};

// VALIDAR CAMPO OBRIGATÓRIO
const validarCampoObrigatorio = (valor: unknown): boolean => {
  return typeof valor === "string" && valor.trim().length > 0;
};

// VALIDAR CAMPO OPCIONAL
const validarCampoOpcional = (
  valor: unknown,
  maximo: number,
): boolean => {
  return (
    valor === undefined ||
    valor === null ||
    (typeof valor === "string" && valor.trim().length <= maximo)
  );
};

export class EventoController {
  private eventoService = new EventoService();
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

  // BUSCAR EVENTO PELO ID
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_evento = Number(req.params.id);

      if (!validarId(id_evento)) {
        res.status(400).json({
          message: "ID do evento inválido.",
        });
        return;
      }

      const evento = await this.eventoService.findById(id_evento);

      res.status(200).json(evento);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao buscar evento.";

      res
        .status(mensagem.includes("não encontrado") ? 404 : 500)
        .json({ message: mensagem });
    }
  };

  // LISTAR TODOS OS EVENTOS
  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventos = await this.eventoService.findAll();

      res.status(200).json(eventos);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao listar eventos.",
      });
    }
  };
  // BUSCAR FEED DE EVENTOS
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
      (latitudeUsuario !== undefined &&
        !Number.isFinite(latitudeUsuario)) ||
      (longitudeUsuario !== undefined &&
        !Number.isFinite(longitudeUsuario))
    ) {
      res.status(400).json({
        message: "Coordenadas inválidas.",
      });
      return;
    }

    const eventos = await this.eventoService.findAll(
      pagina,
      latitudeUsuario,
      longitudeUsuario
    );

    res.status(200).json(eventos);
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "Erro ao buscar feed de eventos.";

    res.status(500).json({ message: mensagem });
  }
};

  // LISTAR EVENTOS DE UM ARTISTA
  findByArtista = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_artista = Number(req.params.id_artista);

      if (!validarId(id_artista)) {
        res.status(400).json({
          message: "ID do artista inválido.",
        });
        return;
      }

      const eventos = await this.eventoService.findByArtista(id_artista);

      res.status(200).json(eventos);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao listar eventos do artista.",
      });
    }
  };

  // LISTAR EVENTOS ARQUIVADOS DO ARTISTA AUTENTICADO
findArquivados = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const artista = await this.obterArtistaAutenticado(req);

    const eventos = await this.eventoService.findArquivados(
      artista.id_artista,
    );

    res.status(200).json(eventos);
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "Erro ao listar eventos arquivados.";

    const status = mensagem.includes("não autenticado")
      ? 401
      : mensagem.includes("Apenas artistas")
        ? 403
        : mensagem.includes("não encontrado")
          ? 404
          : 500;

    res.status(status).json({
      message: mensagem,
    });
  }
};

  // CRIAR EVENTO
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);

      const {
        titulo,
        data_hora,
        valor,
        descricao,
        cep,
        rua,
        complemento,
        uf,
        estado,
        cidade,
        bairro,
        numero,
        latitude,
        longitude,
      } = req.body;

      // VALIDAR CAMPOS OBRIGATÓRIOS DO EVENTO
      if (!titulo || !data_hora || valor === undefined || !descricao) {
        res.status(400).json({
          message: "Preencha todos os campos obrigatórios do evento.",
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

      // VALIDAR DATA E HORA
      if (!validarData(data_hora)) {
        res.status(400).json({
          message: "Informe uma data e hora válidas.",
        });
        return;
      }

      // VALIDAR VALOR
      if (!validarValor(valor)) {
        res.status(400).json({
          message: "O valor do evento deve ser um número válido e não negativo.",
        });
        return;
      }

      // VALIDAR DESCRIÇÃO
      if (!validarTexto(descricao, 1, 1000)) {
        res.status(400).json({
          message: "A descrição deve possuir entre 1 e 1000 caracteres.",
        });
        return;
      }

      // VALIDAR ENDEREÇO
      if (
        !validarCampoObrigatorio(cep) ||
        !validarCampoObrigatorio(rua) ||
        !validarCampoObrigatorio(uf) ||
        !validarCampoObrigatorio(estado) ||
        !validarCampoObrigatorio(cidade) ||
        !validarCampoObrigatorio(bairro) ||
        !validarCampoObrigatorio(numero)
      ) {
        res.status(400).json({
          message: "Preencha todos os campos obrigatórios do endereço.",
        });
        return;
      }

      if (!validarCampoOpcional(complemento, 255)) {
        res.status(400).json({
          message: "O complemento deve possuir até 255 caracteres.",
        });
        return;
      }

      // VALIDAR COORDENADAS
      if (
        latitude !== undefined &&
        latitude !== null &&
        !Number.isFinite(Number(latitude))
      ) {
        res.status(400).json({
          message: "Latitude inválida.",
        });
        return;
      }

      if (
        longitude !== undefined &&
        longitude !== null &&
        !Number.isFinite(Number(longitude))
      ) {
        res.status(400).json({
          message: "Longitude inválida.",
        });
        return;
      }

      // DADOS DO ENDEREÇO
      const enderecoDados = {
        cep: cep.trim(),
        rua: rua.trim(),
        complemento: complemento?.trim() || null,
        uf: uf.trim(),
        estado: estado.trim(),
        cidade: cidade.trim(),
        bairro: bairro.trim(),
        numero: numero.trim(),
        latitude:
          latitude === undefined || latitude === null || latitude === ""
            ? null
            : Number(latitude),
        longitude:
          longitude === undefined || longitude === null || longitude === ""
            ? null
            : Number(longitude),
      };

      // CRIAR EVENTO
      const resultado = await this.eventoService.create(
        {
          titulo: titulo.trim(),
          data_hora,
          valor: Number(valor),
          descricao: descricao.trim(),
        },
        enderecoDados,
        artista.id_artista,
        req.file?.filename,
      );

      res.status(201).json({
        message: resultado.mensagem,
        id_evento: resultado.id_evento,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao criar evento.";

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

  // ATUALIZAR EVENTO
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);

      const id_evento = Number(req.params.id);

      if (!validarId(id_evento)) {
        res.status(400).json({
          message: "ID do evento inválido.",
        });
        return;
      }

      const { titulo, data_hora, valor, descricao } = req.body;

      // VALIDAR CAMPOS OBRIGATÓRIOS
      if (!titulo || !data_hora || valor === undefined || !descricao) {
        res.status(400).json({
          message: "Preencha todos os campos obrigatórios.",
        });
        return;
      }

      if (!validarTexto(titulo, 2, 150)) {
        res.status(400).json({
          message: "O título deve possuir entre 2 e 150 caracteres.",
        });
        return;
      }

      if (!validarData(data_hora)) {
        res.status(400).json({
          message: "Informe uma data e hora válidas.",
        });
        return;
      }

      if (!validarValor(valor)) {
        res.status(400).json({
          message: "O valor do evento deve ser válido e não negativo.",
        });
        return;
      }

      if (!validarTexto(descricao, 1, 1000)) {
        res.status(400).json({
          message: "A descrição deve possuir entre 1 e 1000 caracteres.",
        });
        return;
      }

      // VERIFICAR SE O EVENTO PERTENCE AO ARTISTA
      const eventoExistente = await this.eventoService.findById(id_evento);

      if (eventoExistente.id_artista !== artista.id_artista) {
        res.status(403).json({
          message: "Você não tem permissão para editar este evento.",
        });
        return;
      }

      if (eventoExistente.arquivado) {
        res.status(400).json({
          message: "Não é possível editar um evento arquivado.",
        });
        return;
      }

      const atualizado = await this.eventoService.update(
        id_evento,
        {
          titulo: titulo.trim(),
          data_hora,
          valor: Number(valor),
          descricao: descricao.trim(),
          url_img: req.file?.filename ?? eventoExistente.url_img ?? null,
        },
        artista.id_artista,
      );

      if (!atualizado) {
        res.status(400).json({
          message: "Não foi possível atualizar o evento.",
        });
        return;
      }

      res.status(200).json({
        message: atualizado.mensagem,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao atualizar evento.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas") ||
            mensagem.includes("permissão")
          ? 403
          : mensagem.includes("não encontrado")
            ? 404
            : 400;

      res.status(status).json({
        message: mensagem,
      });
    }
  };

  // ATUALIZAR IMAGEM DO EVENTO
  atualizarImagem = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);

      const id_evento = Number(req.params.id);

      if (!validarId(id_evento)) {
        res.status(400).json({
          message: "ID do evento inválido.",
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          message: "Envie uma imagem.",
        });
        return;
      }

      const evento = await this.eventoService.findById(id_evento);

      if (evento.id_artista !== artista.id_artista) {
        res.status(403).json({
          message: "Você não tem permissão para alterar este evento.",
        });
        return;
      }

      if (evento.arquivado) {
        res.status(400).json({
          message: "Não é possível alterar a imagem de um evento arquivado.",
        });
        return;
      }

      const atualizado = await this.eventoService.updateImagem(
        id_evento,
        artista.id_artista,
        req.file.filename,
      );

      if (!atualizado) {
        res.status(400).json({
          message: "Não foi possível atualizar a imagem do evento.",
        });
        return;
      }

      res.status(200).json({
        message: atualizado.mensagem,
        imagem: req.file.filename,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao atualizar imagem do evento.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas") ||
            mensagem.includes("permissão")
          ? 403
          : mensagem.includes("não encontrado")
            ? 404
            : 400;

      res.status(status).json({
        message: mensagem,
      });
    }
  };


  // DESTACAR EVENTO
  destacar = async (req: Request, res: Response): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);
      const id_evento = Number(req.params.id);

      if (!validarId(id_evento)) {
        res.status(400).json({
          message: "ID do evento inválido.",
        });
        return;
      }

      const evento = await this.eventoService.findById(id_evento);

      if (evento.id_artista !== artista.id_artista) {
        res.status(403).json({
          message: "Você não tem permissão para destacar este evento.",
        });
        return;
      }

      if (evento.arquivado) {
        res.status(400).json({
          message: "Não é possível destacar um evento arquivado.",
        });
        return;
      }

      const resultado = await this.eventoService.destacar(
        id_evento,
        artista.id_artista
      );

      if (!resultado) {
        res.status(400).json({
          message: "Não foi possível destacar o evento.",
        });
        return;
      }

      res.status(200).json({
        message: resultado.mensagem,
      });

    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao destacar evento.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas") ||
            mensagem.includes("permissão")
          ? 403
          : mensagem.includes("não encontrado")
            ? 404
            : 400;

      res.status(status).json({ message: mensagem });
    }
  };

  // RETIRAR DESTAQUE DO EVENTO
  retirarDestaque = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);
      const id_evento = Number(req.params.id);

      if (!validarId(id_evento)) {
        res.status(400).json({
          message: "ID do evento inválido.",
        });
        return;
      }

      const evento = await this.eventoService.findById(id_evento);

      if (evento.id_artista !== artista.id_artista) {
        res.status(403).json({
          message: "Você não tem permissão para retirar o destaque deste evento.",
        });
        return;
      }

      const resultado = await this.eventoService.retirarDestaque(
        id_evento,
        artista.id_artista
      );

      if (!resultado) {
        res.status(400).json({
          message: "Não foi possível retirar o destaque do evento.",
        });
        return;
      }

      res.status(200).json({
        message: resultado.mensagem,
      });

    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao retirar destaque do evento.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas") ||
            mensagem.includes("permissão")
          ? 403
          : mensagem.includes("não encontrado")
            ? 404
            : 400;

      res.status(status).json({ message: mensagem });
    }
  };


  // ARQUIVAR EVENTO
  arquivar = async (req: Request, res: Response): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);

      const id_evento = Number(req.params.id);

      if (!validarId(id_evento)) {
        res.status(400).json({
          message: "ID do evento inválido.",
        });
        return;
      }

      const arquivado = await this.eventoService.arquivar(
        id_evento,
        artista.id_artista,
      );

      if (!arquivado) {
        res.status(400).json({
          message: "Não foi possível arquivar o evento.",
        });
        return;
      }

      res.status(200).json({
        message: arquivado.mensagem,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao arquivar evento.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas") ||
            mensagem.includes("permissão")
          ? 403
          : mensagem.includes("não encontrado")
            ? 404
            : 400;

      res.status(status).json({
        message: mensagem,
      });
    }
  };

  // DESARQUIVAR EVENTO
  desarquivar = async (req: Request, res: Response): Promise<void> => {
    try {
      const artista = await this.obterArtistaAutenticado(req);

      const id_evento = Number(req.params.id);

      if (!validarId(id_evento)) {
        res.status(400).json({
          message: "ID do evento inválido.",
        });
        return;
      }

      const desarquivado = await this.eventoService.desarquivar(
        id_evento,
        artista.id_artista,
      );

      if (!desarquivado) {
        res.status(400).json({
          message: "Não foi possível desarquivar o evento.",
        });
        return;
      }

      res.status(200).json({
        message: desarquivado.mensagem,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao desarquivar evento.";

      const status = mensagem.includes("não autenticado")
        ? 401
        : mensagem.includes("Apenas artistas") ||
            mensagem.includes("permissão")
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
