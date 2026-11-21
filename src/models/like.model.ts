
import { RowDataPacket } from "mysql2";

export interface ILike extends RowDataPacket {
    id_like?: number;
    id_usuario: number;
    id_post: number;
    data_like?: Date | string;
}

export class Like {

    private id_like?: number;
    private id_usuario: number;
    private id_post: number;
    private data_like?: Date | string;

    constructor(
        id_usuario: number,
        id_post: number,
        id_like?: number,
        data_like?: Date | string
    ) {
        this.id_like = id_like;
        this.id_usuario = id_usuario;
        this.id_post = id_post;
        this.data_like = data_like;
    }

    // GETTERS
    getIdLike(): number | undefined {
        return this.id_like;
    }

    getIdUsuario(): number {
        return this.id_usuario;
    }

    getIdPost(): number {
        return this.id_post;
    }

    getDataLike(): Date | string | undefined {
        return this.data_like;
    }

    // SETTERS
    setIdUsuario(id_usuario: number): void {
        this.id_usuario = id_usuario;
    }

    setIdPost(id_post: number): void {
        this.id_post = id_post;
    }

    // CRIAR
    static criar(
        id_usuario: number,
        id_post: number
    ): Like {
        return new Like(id_usuario, id_post);
    }
}
