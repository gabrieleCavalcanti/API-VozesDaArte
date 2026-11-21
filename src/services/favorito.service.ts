
import { Favorito } from "../models/favorito.model";
import { FavoritoRepository } from "../repository/favorito.repository";
import { ArtistaRepository } from "../repository/artista.repository";

export class FavoritoService {

    private favoritoRepository = new FavoritoRepository();
    private artistaRepository = new ArtistaRepository();

    // Validar IDs
    private validarId(id: number, campo: string): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error(`Informe um ${campo} válido.`);
        }
    }

    // Buscar favorito pelo ID
    async findById(id_favorito: number) {

        this.validarId(id_favorito, "ID do favorito");

        const favorito = await this.favoritoRepository.findById(id_favorito);

        if (!favorito) {
            throw new Error("Favorito não encontrado.");
        }

        return favorito;
    }

    // Listar todos os favoritos
    async findAll() {
        return await this.favoritoRepository.findAll();
    }

    // Listar favoritos de um usuário
    async findByUsuario(id_usuario: number) {

        this.validarId(id_usuario, "ID do usuário");

        return await this.favoritoRepository.findByUsuario(id_usuario);
    }

    // Listar usuários que favoritaram um artista
    async findByArtista(id_artista: number) {

        this.validarId(id_artista, "ID do artista");

        return await this.favoritoRepository.findByArtista(id_artista);
    }

    // Verificar se o artista está favoritado
    async verificarFavorito(
        id_usuario: number,
        id_artista: number
    ): Promise<boolean> {

        this.validarId(id_usuario, "ID do usuário");
        this.validarId(id_artista, "ID do artista");

        return await this.favoritoRepository.exists(
            id_usuario,
            id_artista
        );
    }

    // Adicionar favorito
    async create(id_artista: number, id_usuario: number) {

        this.validarId(id_artista, "ID do artista");
        this.validarId(id_usuario, "ID do usuário");

        const artista = await this.artistaRepository.findById(id_artista);

        if (!artista) {
            throw new Error("Artista não encontrado.");
        }

        const favoritoExistente =
            await this.favoritoRepository.findByUsuarioAndArtista(
                id_usuario,
                id_artista
            );

        if (favoritoExistente) {
            throw new Error("Este artista já está nos seus favoritos.");
        }

        const favorito = Favorito.criar(id_artista, id_usuario);

        return await this.favoritoRepository.create(
            favorito.getIdArtista(),
            favorito.getIdUsuario()
        );
    }

    // Remover favorito
    async delete(
        id_usuario: number,
        id_artista: number
    ): Promise<boolean> {

        this.validarId(id_usuario, "ID do usuário");
        this.validarId(id_artista, "ID do artista");

        const favorito =
            await this.favoritoRepository.findByUsuarioAndArtista(
                id_usuario,
                id_artista
            );

        if (!favorito) {
            throw new Error("Este artista não está nos seus favoritos.");
        }

        return await this.favoritoRepository.deleteByUsuarioAndArtista(
            id_usuario,
            id_artista
        );
    }

    // Alternar favorito: adiciona ou remove
    async toggle(id_usuario: number, id_artista: number) {

        const favorito =
            await this.favoritoRepository.findByUsuarioAndArtista(
                id_usuario,
                id_artista
            );

        if (favorito) {
            await this.delete(id_usuario, id_artista);

            return {
                favoritado: false,
                message: "Artista removido dos favoritos."
            };
        }

        const id_favorito = await this.create(id_artista, id_usuario);

        return {
            favoritado: true,
            id_favorito,
            message: "Artista adicionado aos favoritos."
        };
    }
}
