import { db } from "../database/connection.database";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { IEvento } from "../models/evento.model";

export class EventoRepository {
  // BUSCAR EVENTO PELO ID
  async findById(id_evento: number): Promise<IEvento | null> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT *
             FROM eventos
             WHERE id_evento = ?`,
      [id_evento],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as IEvento;
  }

  // LISTAR TODOS OS EVENTOS
  async findAll(): Promise<IEvento[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT *
             FROM eventos
             ORDER BY data_hora ASC`,
    );

    return rows as IEvento[];
  }

  // LISTAR EVENTOS DE UM ARTISTA
  async findByArtista(id_artista: number): Promise<IEvento[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT *
             FROM eventos
             WHERE id_artista = ?
             ORDER BY data_hora ASC`,
      [id_artista],
    );

    return rows as IEvento[];
  }

  // CADASTRAR EVENTO
  async create(evento: IEvento): Promise<number> {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO eventos (
                titulo,
                data_hora,
                valor,
                descricao,
                arquivado,
                url_img,
                id_artista,
                id_endereco
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        evento.titulo,
        evento.data_hora,
        evento.valor,
        evento.descricao,
        evento.arquivado ?? false,
        evento.url_img ?? null,
        evento.id_artista,
        evento.id_endereco,
      ],
    );

    return result.insertId;
  }

  // ATUALIZAR EVENTO
  async update(id_evento: number, evento: IEvento): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE eventos
             SET titulo = ?,
                 data_hora = ?,
                 valor = ?,
                 descricao = ?,
                 url_img = ?,
                 id_endereco = ?
             WHERE id_evento = ?
             AND id_artista = ?
             AND arquivado = 0`,
      [
        evento.titulo,
        evento.data_hora,
        evento.valor,
        evento.descricao,
        evento.url_img ?? null,
        evento.id_endereco,
        id_evento,
        evento.id_artista,
      ],
    );

    return result.affectedRows > 0;
  }

  // DESTACAR EVENTO
  async destacar(id_evento: number, id_artista: number): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE eventos
         SET destaque = 1
         WHERE id_evento = ?
         AND id_artista = ?
         AND arquivado = 0
         AND destaque = 0`,
      [id_evento, id_artista],
    );

    return result.affectedRows > 0;
  }

  // RETIRAR DESTAQUE
  async retirarDestaque(
    id_evento: number,
    id_artista: number,
  ): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE eventos
         SET destaque = 0
         WHERE id_evento = ?
         AND id_artista = ?
         AND destaque = 1`,
      [id_evento, id_artista],
    );

    return result.affectedRows > 0;
  }

  // ATUALIZAR IMAGEM DO EVENTO
  async updateImagem(
    id_evento: number,
    id_artista: number,
    url_img: string,
  ): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE eventos
             SET url_img = ?
             WHERE id_evento = ?
             AND id_artista = ?
             AND arquivado = 0`,
      [url_img, id_evento, id_artista],
    );

    return result.affectedRows > 0;
  }

  // ARQUIVAR EVENTO
  async arquivar(id_evento: number, id_artista: number): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE eventos
             SET arquivado = 1
             WHERE id_evento = ?
             AND id_artista = ?
             AND arquivado = 0`,
      [id_evento, id_artista],
    );

    return result.affectedRows > 0;
  }

  // DESARQUIVAR EVENTO
  async desarquivar(id_evento: number, id_artista: number): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE eventos
             SET arquivado = 0
             WHERE id_evento = ?
             AND id_artista = ?
             AND arquivado = 1`,
      [id_evento, id_artista],
    );

    return result.affectedRows > 0;
  }
}
