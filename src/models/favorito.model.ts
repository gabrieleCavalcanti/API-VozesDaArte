
import { RowDataPacket } from "mysql2";

export interface IFavorito extends RowDataPacket {
    id_favorito?: number;
    id_artista: number;
    id_usuario: number;
}

export class Favorito {

    private id_favorito?: number;
    private id_artista: number;
    private id_usuario: number;

    constructor(
        id_artista: number,
        id_usuario: number,
        id_favorito?: number
    ) {
        this.id_favorito = id_favorito;
        this.id_artista = id_artista;
        this.id_usuario = id_usuario;
    }

    // GETTERS
    getIdFavorito(): number | undefined {
        return this.id_favorito;
    }

    getIdArtista(): number {
        return this.id_artista;
    }

    getIdUsuario(): number {
        return this.id_usuario;
    }

    // SETTERS
    setIdArtista(id_artista: number): void {
        this.id_artista = id_artista;
    }

    setIdUsuario(id_usuario: number): void {
        this.id_usuario = id_usuario;
    }

    // CRIAR
    static criar(
        id_artista: number,
        id_usuario: number
    ): Favorito {
        return new Favorito(id_artista, id_usuario);
    }
}
