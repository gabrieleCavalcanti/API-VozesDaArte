
import { RowDataPacket } from "mysql2";

export interface ICategoria extends RowDataPacket {
    id_categoria?: number;
    nome_categoria: string;
    descricao?: string | null;
}

export class Categoria {
    private _id_categoria?: number;
    private _nome_categoria: string;
    private _descricao?: string | null;

    // CONSTRUTOR
    constructor(
        nome_categoria: string,
        descricao?: string | null,
        id_categoria?: number
    ) {
        this._id_categoria = id_categoria;
        this._nome_categoria = nome_categoria;
        this._descricao = descricao;
    }

    // GETTERS
    public get Id(): number | undefined {
        return this._id_categoria;
    }

    public get NomeCategoria(): string {
        return this._nome_categoria;
    }

    public get Descricao(): string | null | undefined {
        return this._descricao;
    }

    // SETTERS
    public set NomeCategoria(value: string) {
        this._nome_categoria = value;
    }

    public set Descricao(value: string | null | undefined) {
        this._descricao = value;
    }

    // DP => FACTORY

    // CRIAR CATEGORIA
    public static criar(
        nome_categoria: string,
        descricao?: string | null
    ): Categoria {
        return new Categoria(
            nome_categoria,
            descricao
        );
    }

    // EDITAR CATEGORIA
    public static editar(
        id_categoria: number,
        nome_categoria: string,
        descricao?: string | null
    ): Categoria {
        return new Categoria(
            nome_categoria,
            descricao,
            id_categoria
        );
    }
}
