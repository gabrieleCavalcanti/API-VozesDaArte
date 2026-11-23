
import { RowDataPacket } from "mysql2";

export interface IUsuario extends RowDataPacket {
    id_usuario?: number;
    nome?: string;
    email?: string;
    tipo?: string;
    url_foto_perfil?: string;
    data_cadastro?: Date;
    id_endereco?: number;
    username?: string;
}

export class Usuario {
    private _id_usuario?: number;
    private _nome: string = '';
    private _email: string = '';
    private _tipo?: string;
    private _url_foto_perfil?: string;
    private _data_cadastro?: Date;
    private _id_endereco?: number;

    // CONSTRUTOR
    constructor(
        nome: string,
        email: string,
        tipo?: string,
        url_foto_perfil?: string,
        id_endereco?: number,
        data_cadastro?: Date,
        id_usuario?: number
    ) {
        this.Nome = nome;
        this.Email = email;
        this._tipo = tipo;
        this._url_foto_perfil = url_foto_perfil;
        this._id_endereco = id_endereco;
        this._data_cadastro = data_cadastro;
        this._id_usuario = id_usuario;
    }

    // GETTERS
    public get Id(): number | undefined {
        return this._id_usuario;
    }

    public get Nome(): string {
        return this._nome;
    }

    public get Email(): string {
        return this._email;
    }

    public get Tipo(): string | undefined {
        return this._tipo;
    }

    public get UrlFotoPerfil(): string | undefined {
        return this._url_foto_perfil;
    }

    public get DataCadastro(): Date | undefined {
        return this._data_cadastro;
    }

    public get IdEndereco(): number | undefined {
        return this._id_endereco;
    }

    // SETTERS
    public set Nome(value: string) {
        this._nome = value;
    }

    public set Email(value: string) {
        this._email = value;
    }

    public set UrlFotoPerfil(value: string | undefined) {
        this._url_foto_perfil = value;
    }

    public set IdEndereco(value: number | undefined) {
        this._id_endereco = value;
    }

    // DP => FACTORY
    public static criar(
        nome: string,
        email: string,
        tipo: string
    ): Usuario {
        return new Usuario(nome, email, tipo);
    }

    public static editar(
        id_usuario: number,
        nome: string,
        email: string,
        url_foto_perfil?: string,
        id_endereco?: number
    ): Usuario {
        return new Usuario(
            nome,
            email,
            undefined,
            url_foto_perfil,
            id_endereco,
            undefined,
            id_usuario
        );
    }
}
