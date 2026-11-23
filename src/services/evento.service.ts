
import { Evento, IEvento } from "../models/evento.model";
import { IEndereco } from "../models/endereco.model";
import { EventoRepository } from "../repository/evento.repository";
import { EnderecoRepository } from "../repository/endereco.repository";
import { organizarFeed } from "../utils/feed.util";

export class EventoService {
  private eventoRepository = new EventoRepository();
  private enderecoRepository = new EnderecoRepository();

  // BUSCAR EVENTO POR ID
  async findById(id_evento: number) {
    if (!id_evento || id_evento <= 0) {
      throw new Error("ID do evento inválido.");
    }

    const evento = await this.eventoRepository.findById(id_evento);

    if (!evento) {
      throw new Error("Evento não encontrado.");
    }

    return evento;
  }

  // LISTAR TODOS OS EVENTOS

    // LISTAR EVENTOS DO FEED COM PAGINAÇÃO
    async findAll(
        pagina: number = 1,
        latitudeUsuario?: number,
        longitudeUsuario?: number
    ) {
        const eventos =
            await this.eventoRepository.findFeedCandidates();

        return organizarFeed(
            eventos,
            pagina,
            latitudeUsuario,
            longitudeUsuario
        );
    }


  // LISTAR EVENTOS DE UM ARTISTA
  async findByArtista(id_artista: number) {
    if (!id_artista || id_artista <= 0) {
      throw new Error("Artista não identificado.");
    }

    return await this.eventoRepository.findByArtista(id_artista);
  }

  // VALIDAR DADOS DO EVENTO
  private validarEvento(dados: Partial<IEvento>): void {
    if (!dados.titulo?.trim()) {
      throw new Error("O título do evento é obrigatório.");
    }

    if (dados.titulo.length > 150) {
      throw new Error("O título deve ter no máximo 150 caracteres.");
    }

    if (!dados.data_hora) {
      throw new Error("A data e hora do evento são obrigatórias.");
    }

    const data = new Date(dados.data_hora);

    if (Number.isNaN(data.getTime())) {
      throw new Error("Data e hora do evento inválidas.");
    }

    if (
      dados.valor === undefined ||
      dados.valor === null ||
      !Number.isFinite(Number(dados.valor)) ||
      Number(dados.valor) < 0
    ) {
      throw new Error("O valor do evento deve ser um número válido e não negativo.");
    }

    if (typeof dados.descricao !== "string" || !dados.descricao.trim()) {
      throw new Error("A descrição do evento é obrigatória.");
    }

    if (dados.descricao.length > 1000) {
      throw new Error("A descrição deve ter no máximo 1000 caracteres.");
    }
  }

  // CADASTRAR EVENTO
  async create(
    dados: Partial<IEvento>,
    enderecoDados: IEndereco,
    id_artista: number,
    url_img?: string
  ) {
    if (!id_artista || id_artista <= 0) {
      throw new Error("Artista não identificado.");
    }

    this.validarEvento(dados);

    if (!enderecoDados || typeof enderecoDados !== "object") {
      throw new Error("Os dados do endereço são obrigatórios.");
    }

    // CADASTRAR ENDEREÇO INDEPENDENTE
    const id_endereco = await this.enderecoRepository.create(enderecoDados);

    const evento = Evento.criar({
      titulo: dados.titulo!.trim(),
      data_hora: dados.data_hora!,
      valor: Number(dados.valor),
      descricao: dados.descricao!.trim(),
      arquivado: false,
      url_img: url_img ?? null,
      id_artista,
      id_endereco
    });

    const id_evento = await this.eventoRepository.create(evento.toJSON());

    return {
      mensagem: "Evento cadastrado com sucesso.",
      id_evento
    };
  }

  // ATUALIZAR EVENTO
  async update(
    id_evento: number,
    dados: Partial<IEvento>,
    id_artista: number
  ) {
    if (!id_evento || id_evento <= 0) {
      throw new Error("ID do evento inválido.");
    }

    if (!id_artista || id_artista <= 0) {
      throw new Error("Artista não identificado.");
    }

    this.validarEvento(dados);

    const eventoAtual = await this.eventoRepository.findById(id_evento);

    if (!eventoAtual) {
      throw new Error("Evento não encontrado.");
    }

    if (eventoAtual.id_artista !== id_artista) {
      throw new Error("Você não tem permissão para atualizar este evento.");
    }

    if (eventoAtual.arquivado) {
      throw new Error("Não é possível atualizar um evento arquivado.");
    }

    const evento = Evento.editar({
      ...eventoAtual,
      titulo: dados.titulo!.trim(),
      data_hora: dados.data_hora!,
      valor: Number(dados.valor),
      descricao: dados.descricao!.trim(),
      url_img: dados.url_img ?? eventoAtual.url_img ?? null,
      id_artista,
      id_endereco: eventoAtual.id_endereco
    });

    const atualizado = await this.eventoRepository.update(id_evento, evento.toJSON());

    if (!atualizado) {
      throw new Error("Não foi possível atualizar o evento.");
    }

    return {
      mensagem: "Evento atualizado com sucesso."
    };
  }


  // DESTACAR EVENTO
  async destacar(id_evento: number, id_artista: number) {
    if (!id_evento || id_evento <= 0) {
      throw new Error("ID do evento inválido.");
    }

    if (!id_artista || id_artista <= 0) {
      throw new Error("Artista não identificado.");
    }

    const evento = await this.eventoRepository.findById(id_evento);

    if (!evento) {
      throw new Error("Evento não encontrado.");
    }

    if (evento.id_artista !== id_artista) {
      throw new Error("Você não tem permissão para destacar este evento.");
    }

    if (evento.arquivado) {
      throw new Error("Não é possível destacar um evento arquivado.");
    }

    if (evento.destaque) {
      throw new Error("Este evento já está destacado.");
    }

    const resultado = await this.eventoRepository.destacar(
      id_evento,
      id_artista
    );

    if (!resultado) {
      throw new Error("Não foi possível destacar o evento.");
    }

    return {
      mensagem: "Evento destacado com sucesso."
    };
  }

  // RETIRAR DESTAQUE
  async retirarDestaque(id_evento: number, id_artista: number) {
    if (!id_evento || id_evento <= 0) {
      throw new Error("ID do evento inválido.");
    }

    if (!id_artista || id_artista <= 0) {
      throw new Error("Artista não identificado.");
    }

    const evento = await this.eventoRepository.findById(id_evento);

    if (!evento) {
      throw new Error("Evento não encontrado.");
    }

    if (evento.id_artista !== id_artista) {
      throw new Error("Você não tem permissão para retirar o destaque deste evento.");
    }

    if (!evento.destaque) {
      throw new Error("Este evento não está destacado.");
    }

    const resultado = await this.eventoRepository.retirarDestaque(
      id_evento,
      id_artista
    );

    if (!resultado) {
      throw new Error("Não foi possível retirar o destaque do evento.");
    }

    return {
      mensagem: "Destaque do evento removido com sucesso."
    };
  }


  // ATUALIZAR IMAGEM
  async updateImagem(
    id_evento: number,
    id_artista: number,
    url_img: string
  ) {
    if (!url_img) {
      throw new Error("Imagem não enviada.");
    }

    const atualizado = await this.eventoRepository.updateImagem(
      id_evento,
      id_artista,
      url_img
    );

    if (!atualizado) {
      throw new Error("Evento não encontrado ou sem permissão para atualizar.");
    }

    return {
      mensagem: "Imagem do evento atualizada com sucesso."
    };
  }

  

  // ARQUIVAR EVENTO
  async arquivar(id_evento: number, id_artista: number) {
    const arquivado = await this.eventoRepository.arquivar(
      id_evento,
      id_artista
    );

    if (!arquivado) {
      throw new Error("Evento não encontrado ou já arquivado.");
    }

    return {
      mensagem: "Evento arquivado com sucesso."
    };
  }

  // DESARQUIVAR EVENTO
  async desarquivar(id_evento: number, id_artista: number) {
    const desarquivado = await this.eventoRepository.desarquivar(
      id_evento,
      id_artista
    );

    if (!desarquivado) {
      throw new Error("Evento não encontrado ou não está arquivado.");
    }

    return {
      mensagem: "Evento desarquivado com sucesso."
    };
  }
}
