
import { RowDataPacket } from "mysql2";

export interface IUsuarioInteresseCategoria extends RowDataPacket {
    id_categoria: number;
    id_usuario: number;
}

export class UsuarioInteresseCategoria {
    private _id_categoria: number;
    private _id_usuario: number;

    // CONSTRUTOR
    constructor(
        id_categoria: number,
        id_usuario: number
    ) {
        this._id_categoria = id_categoria;
        this._id_usuario = id_usuario;
    }

    // GETTERS
    public get IdCategoria(): number {
        return this._id_categoria;
    }

    public get IdUsuario(): number {
        return this._id_usuario;
    }

    // SETTERS
    public set IdCategoria(value: number) {
        this._id_categoria = value;
    }

    public set IdUsuario(value: number) {
        this._id_usuario = value;
    }

    // DP => FACTORY

    // ADICIONAR INTERESSE
    public static criar(
        id_categoria: number,
        id_usuario: number
    ): UsuarioInteresseCategoria {
        return new UsuarioInteresseCategoria(
            id_categoria,
            id_usuario
        );
    }
}
