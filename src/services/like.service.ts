
import { Like } from "../models/like.model";
import { LikeRepository } from "../repository/like.repository";
import { PostRepository } from "../repository/post.repository";

export class LikeService {

    private likeRepository = new LikeRepository();
    private postRepository = new PostRepository();

    // Validar IDs
    private validarId(id: number, campo: string): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error(`Informe um ${campo} válido.`);
        }
    }

    // Buscar like pelo ID
    async findById(id_like: number) {

        this.validarId(id_like, "ID do like");

        const like = await this.likeRepository.findById(id_like);

        if (!like) {
            throw new Error("Curtida não encontrada.");
        }

        return like;
    }

    // Listar todos os likes
    async findAll() {
        return await this.likeRepository.findAll();
    }

    // Listar likes de um usuário
    async findByUsuario(id_usuario: number) {

        this.validarId(id_usuario, "ID do usuário");

        return await this.likeRepository.findByUsuario(id_usuario);
    }

    // Listar likes de um post
    async findByPost(id_post: number) {

        this.validarId(id_post, "ID do post");

        return await this.likeRepository.findByPost(id_post);
    }

    // Verificar se o usuário curtiu o post
    async verificarLike(
        id_usuario: number,
        id_post: number
    ): Promise<boolean> {

        this.validarId(id_usuario, "ID do usuário");
        this.validarId(id_post, "ID do post");

        return await this.likeRepository.exists(
            id_usuario,
            id_post
        );
    }

    // Contar likes de um post
    async countByPost(id_post: number): Promise<number> {

        this.validarId(id_post, "ID do post");

        return await this.likeRepository.countByPost(id_post);
    }

    // Curtir post
    async create(id_usuario: number, id_post: number) {

        this.validarId(id_usuario, "ID do usuário");
        this.validarId(id_post, "ID do post");

        const post = await this.postRepository.findById(id_post);

        if (!post) {
            throw new Error("Post não encontrado.");
        }

        const likeExistente =
            await this.likeRepository.findByUsuarioAndPost(
                id_usuario,
                id_post
            );

        if (likeExistente) {
            throw new Error("Você já curtiu este post.");
        }

        const like = Like.criar(id_usuario, id_post);

        return await this.likeRepository.create(
            like.getIdUsuario(),
            like.getIdPost()
        );
    }

    // Descurtir post
    async delete(
        id_usuario: number,
        id_post: number
    ): Promise<boolean> {

        this.validarId(id_usuario, "ID do usuário");
        this.validarId(id_post, "ID do post");

        const like =
            await this.likeRepository.findByUsuarioAndPost(
                id_usuario,
                id_post
            );

        if (!like) {
            throw new Error("Você ainda não curtiu este post.");
        }

        return await this.likeRepository.deleteByUsuarioAndPost(
            id_usuario,
            id_post
        );
    }

    // Alternar like: curtir ou descurtir
    async toggle(id_usuario: number, id_post: number) {

        const like =
            await this.likeRepository.findByUsuarioAndPost(
                id_usuario,
                id_post
            );

        if (like) {
            await this.delete(id_usuario, id_post);

            return {
                curtido: false,
                message: "Curtida removida com sucesso."
            };
        }

        const id_like = await this.create(id_usuario, id_post);

        return {
            curtido: true,
            id_like,
            message: "Post curtido com sucesso."
        };
    }
}
