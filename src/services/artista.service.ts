import { Artista } from "../models/artista.model";
import { ArtistaRepository } from "../repository/artista.repository";
import { UsuarioRepository } from "../repository/usuario.repository";

export class ArtistaService {
  private artistaRepository = new ArtistaRepository();
  private usuarioRepository = new UsuarioRepository();

  // Buscar artista pelo ID
  async findById(id_artista: number) {
    const artista = await this.artistaRepository.findById(id_artista);

    if (!artista) {
      throw new Error("Artista não encontrado.");
    }

    return artista;
  }

  // Buscar artista pelo ID do usuário
  async findByUsuario(id_usuario: number) {
    const artista = await this.artistaRepository.findByUsuario(id_usuario);

    if (!artista) {
      throw new Error("Artista não encontrado.");
    }

    return artista;
  }

  // Listar todos os artistas
  async findAll() {
    return await this.artistaRepository.findAll();
  }

  // Criar artista - Artista
  async create(
    id_usuario: number,
    url_foto_capa?: string,
    biografia?: string,
    contato_profissional?: string,
  ) {
    const usuario = await this.usuarioRepository.findById(id_usuario);

    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }

    const artistaExistente =
      await this.artistaRepository.findByUsuario(id_usuario);

    if (artistaExistente) {
      throw new Error("Este usuário já possui um cadastro de artista.");
    }

    const artista = Artista.criar(
      id_usuario,
      url_foto_capa,
      biografia,
      contato_profissional,
    );

    return await this.artistaRepository.create(
      artista.IdUsuario!,
      artista.UrlFotoCapa,
      artista.Biografia,
      artista.ContatoProfissional,
    );
  }

  // Atualizar artista
  async update(
    id_artista: number,
    url_foto_capa?: string,
    biografia?: string,
    contato_profissional?: string,
  ) {
    await this.findById(id_artista);

    const artista = Artista.editar(
      id_artista,
      url_foto_capa,
      biografia,
      contato_profissional,
    );

    return await this.artistaRepository.update(
      artista.Id!,
      artista.UrlFotoCapa,
      artista.Biografia,
      artista.ContatoProfissional,
    );
  }

  // Atualizar foto de capa do artista
  async updateFotoCapa(id_artista: number, nomeArquivo: string) {
    await this.findById(id_artista);

    return await this.artistaRepository.updateFotoCapa(id_artista, nomeArquivo);
  }
  // Excluir artista
  async delete(id_artista: number) {
    await this.findById(id_artista);

    return await this.artistaRepository.delete(id_artista);
  }
}
