import { RowDataPacket } from "mysql2";

export interface IArtista extends RowDataPacket {
  id_artista?: number;
  id_usuario?: number;
  url_foto_capa?: string | null;
  biografia?: string | null;
  contato_profissional?: string | null;
}

export class Artista {
  private _id_artista?: number;
  private _id_usuario?: number;
  private _url_foto_capa?: string | null;
  private _biografia?: string | null;
  private _contato_profissional?: string | null;

  // CONSTRUTOR
  constructor(
    id_usuario?: number,
    url_foto_capa?: string | null,
    biografia?: string | null,
    contato_profissional?: string | null,
    id_artista?: number,
  ) {
    this._id_usuario = id_usuario;
    this._url_foto_capa = url_foto_capa;
    this._biografia = biografia;
    this._contato_profissional = contato_profissional;
    this._id_artista = id_artista;
  }

  // GETTERS
  public get Id(): number | undefined {
    return this._id_artista;
  }

  public get IdUsuario(): number | undefined {
    return this._id_usuario;
  }

  public get UrlFotoCapa(): string | null | undefined {
    return this._url_foto_capa;
  }

  public get Biografia(): string | null | undefined {
    return this._biografia;
  }

  public get ContatoProfissional(): string | null | undefined {
    return this._contato_profissional;
  }

  // SETTERS
  public set IdUsuario(value: number | undefined) {
    this._id_usuario = value;
  }

  public set UrlFotoCapa(value: string | null | undefined) {
    this._url_foto_capa = value;
  }

  public set Biografia(value: string | null | undefined) {
    this._biografia = value;
  }

  public set ContatoProfissional(value: string | null | undefined) {
    this._contato_profissional = value;
  }

  // DP => FACTORY
  public static criar(
    id_usuario: number,
    url_foto_capa?: string | null,
    biografia?: string | null,
    contato_profissional?: string | null,
  ): Artista {
    return new Artista(
      id_usuario,
      url_foto_capa,
      biografia,
      contato_profissional,
    );
  }

  public static editar(
    id_artista: number,
    url_foto_capa?: string | null,
    biografia?: string | null,
    contato_profissional?: string | null,
  ): Artista {
    return new Artista(
      undefined,
      url_foto_capa,
      biografia,
      contato_profissional,
      id_artista,
    );
  }
}
