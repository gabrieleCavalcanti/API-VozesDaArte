
import { Post } from "../models/post.model";
import { PostRepository } from "../repository/post.repository";
import { organizarFeed } from "../utils/feed.util";

export class PostService {

    private postRepository = new PostRepository();

    // Buscar post pelo ID
    async findById(id_post: number) {

        const post = await this.postRepository.findById(id_post);

        if (!post) {
            throw new Error("Post não encontrado.");
        }

        return post;
    }

    // Listar todos os posts

    // LISTAR POSTS DO FEED COM PAGINAÇÃO
    async findAll(
        pagina: number = 1,
        latitudeUsuario?: number,
        longitudeUsuario?: number
    ) {
        const publicacoes =
            await this.postRepository.findFeedCandidates();

        return organizarFeed(
            publicacoes,
            pagina,
            latitudeUsuario,
            longitudeUsuario
        );
    }


    // Listar posts de um artista
    async findByArtista(id_artista: number) {

        if (!id_artista || id_artista <= 0) {
            throw new Error("Informe um artista válido.");
        }

        return await this.postRepository.findByArtista(id_artista);
    }

    // Criar post
    async create(
        id_categoria: number,
        titulo: string,
        descricao: string,
        id_artista: number,
        url_img?: string,
        link_externo?: string
    ) {

        if (!id_categoria || !titulo || !descricao || !id_artista) {
            throw new Error("Preencha todos os campos obrigatórios.");
        }

        if (!titulo.trim() || !descricao.trim()) {
            throw new Error("Título e descrição não podem estar vazios.");
        }

        const post = Post.criar(
            id_categoria,
            titulo,
            descricao,
            id_artista,
            url_img,
            link_externo
        );

        return await this.postRepository.create(
            post.IdCategoria,
            post.UrlImg,
            post.Titulo,
            post.Descricao,
            post.LinkExterno,
            post.IdArtista
        );
    }

    // Atualizar post
    async update(
        id_post: number,
        id_categoria: number,
        titulo: string,
        descricao: string,
        url_img?: string,
        link_externo?: string
    ) {

        const postExistente = await this.findById(id_post);

        if (postExistente.arquivado) {
            throw new Error("Não é possível editar um post arquivado.");
        }

        if (!id_categoria || !titulo || !descricao) {
            throw new Error("Preencha todos os campos obrigatórios.");
        }

        if (!titulo.trim() || !descricao.trim()) {
            throw new Error("Título e descrição não podem estar vazios.");
        }

        const post = Post.editar(
            id_post,
            id_categoria,
            titulo,
            descricao,
            url_img,
            link_externo
        );

        return await this.postRepository.update(
            post.Id!,
            post.IdCategoria,
            post.Titulo,
            post.Descricao,
            post.UrlImg,
            post.LinkExterno
        );
    }

    // Atualizar imagem do post
    async updateImagem(
        id_post: number,
        url_img: string
    ): Promise<boolean> {

        const post = await this.findById(id_post);

        if (post.arquivado) {
            throw new Error("Não é possível alterar a imagem de um post arquivado.");
        }

        if (!url_img || !url_img.trim()) {
            throw new Error("Informe a imagem do post.");
        }

        return await this.postRepository.updateImagem(
            id_post,
            url_img
        );
    }

    // Destacar post
    async destacar(
        id_post: number,
        id_artista: number
    ): Promise<boolean> {

        const post = await this.findById(id_post);

        if (post.id_artista !== id_artista) {
            throw new Error("Você não tem permissão para destacar este post.");
        }

        if (post.arquivado) {
            throw new Error("Não é possível destacar um post arquivado.");
        }

        return await this.postRepository.destacar(
            id_post,
            id_artista
        );
    }

    // Remover destaque
    async removerDestaque(
        id_post: number,
        id_artista: number
    ): Promise<boolean> {

        const post = await this.findById(id_post);

        if (post.id_artista !== id_artista) {
            throw new Error("Você não tem permissão para alterar este post.");
        }

        return await this.postRepository.removerDestaque(
            id_post,
            id_artista
        );
    }

    // Arquivar post
    async arquivar(
        id_post: number,
        id_artista: number
    ): Promise<boolean> {

        const post = await this.findById(id_post);

        if (post.id_artista !== id_artista) {
            throw new Error("Você não tem permissão para arquivar este post.");
        }

        if (post.arquivado) {
            throw new Error("Este post já está arquivado.");
        }

        return await this.postRepository.arquivar(
            id_post,
            id_artista
        );
    }

    // Desarquivar post
    async desarquivar(
        id_post: number,
        id_artista: number
    ): Promise<boolean> {

        const post = await this.findById(id_post);

        if (post.id_artista !== id_artista) {
            throw new Error("Você não tem permissão para desarquivar este post.");
        }

        if (!post.arquivado) {
            throw new Error("Este post não está arquivado.");
        }

        return await this.postRepository.desarquivar(
            id_post,
            id_artista
        );
    }
}
