import { RowDataPacket } from "mysql2";

export interface IPost extends RowDataPacket {
    id_post?: number;
    id_categoria?: number;
    url_img?: string;
    titulo?: string;
    descricao?: string;
    link_externo?: string;
    destaque?: boolean;
    arquivado?: boolean;
    data_cadastro?: Date;
    id_artista: number;
}

export class Post {
    private _id_post?: number;
    private _id_categoria: number;
    private _url_img?: string;
    private _titulo: string;
    private _descricao: string;
    private _link_externo?: string;
    private _destaque: boolean;
    private _arquivado: boolean;
    private _data_cadastro?: Date;
    private _id_artista: number;

    // CONSTRUTOR
    constructor(
        id_categoria: number,
        titulo: string,
        descricao: string,
        id_artista: number,
        url_img?: string,
        link_externo?: string,
        destaque: boolean = false,
        arquivado: boolean = false,
        data_cadastro?: Date,
        id_post?: number
    ) {
        this._id_categoria = id_categoria;
        this._titulo = titulo;
        this._descricao = descricao;
        this._id_artista = id_artista;
        this._url_img = url_img;
        this._link_externo = link_externo;
        this._destaque = destaque;
        this._arquivado = arquivado;
        this._data_cadastro = data_cadastro;
        this._id_post = id_post;
    }

    // GETTERS
    public get Id(): number | undefined {
        return this._id_post;
    }

    public get IdCategoria(): number {
        return this._id_categoria;
    }

    public get UrlImg(): string | undefined {
        return this._url_img;
    }

    public get Titulo(): string {
        return this._titulo;
    }

    public get Descricao(): string {
        return this._descricao;
    }

    public get LinkExterno(): string | undefined {
        return this._link_externo;
    }

    public get Destaque(): boolean {
        return this._destaque;
    }

    public get Arquivado(): boolean {
        return this._arquivado;
    }

    public get DataCadastro(): Date | undefined {
        return this._data_cadastro;
    }

    public get IdArtista(): number {
        return this._id_artista;
    }

    // SETTERS
    public set IdCategoria(value: number) {
        this._id_categoria = value;
    }

    public set UrlImg(value: string | undefined) {
        this._url_img = value;
    }

    public set Titulo(value: string) {
        this._titulo = value;
    }

    public set Descricao(value: string) {
        this._descricao = value;
    }

    public set LinkExterno(value: string | undefined) {
        this._link_externo = value;
    }

    public set Destaque(value: boolean) {
        this._destaque = value;
    }

    public set Arquivado(value: boolean) {
        this._arquivado = value;
    }

    // DP => FACTORY
    public static criar(
        id_categoria: number,
        titulo: string,
        descricao: string,
        id_artista: number,
        url_img?: string,
        link_externo?: string
    ): Post {
        return new Post(
            id_categoria,
            titulo,
            descricao,
            id_artista,
            url_img,
            link_externo
        );
    }

    public static editar(
        id_post: number,
        id_categoria: number,
        titulo: string,
        descricao: string,
        url_img?: string,
        link_externo?: string
    ): Post {
        return new Post(
            id_categoria,
            titulo,
            descricao,
            0,
            url_img,
            link_externo,
            false,
            false,
            undefined,
            id_post
        );
    }
}