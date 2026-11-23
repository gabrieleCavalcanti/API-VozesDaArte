
import { db } from "../database/connection.database";
import { IArtista } from "../models/artista.model";
import { ResultSetHeader, PoolConnection } from "mysql2/promise";

export class ArtistaRepository {

    // Buscar artista pelo ID
    async findById(id_artista: number): Promise<IArtista | null> {
        const [result] = await db.execute<IArtista[]>(
            `SELECT * FROM artistas
             WHERE id_artista = ?`,
            [id_artista]
        );

        return result.length > 0 ? result[0] : null;
    }

    // Buscar artista pelo ID do usuário
    async findByUsuario(id_usuario: number): Promise<IArtista | null> {
        const [result] = await db.execute<IArtista[]>(
            `SELECT * FROM artistas
             WHERE id_usuario = ?`,
            [id_usuario]
        );

        return result.length > 0 ? result[0] : null;
    }

    // Listar todos os artistas
    async findAll(): Promise<IArtista[]> {
        const [result] = await db.execute<IArtista[]>(
            `SELECT * FROM artistas`
        );

        return result;
    }

    // Criar artista
    async create(
        id_usuario: number,
        url_foto_capa?: string | null,
        biografia?: string | null,
        contato_profissional?: string | null,
        connection?: PoolConnection
    ): Promise<number> {

        const executor = connection ?? db;

        const [result] = await executor.execute<ResultSetHeader>(
            `INSERT INTO artistas
                (id_usuario, url_foto_capa, biografia, contato_profissional)
             VALUES (?, ?, ?, ?)`,
            [
                id_usuario,
                url_foto_capa ?? null,
                biografia ?? null,
                contato_profissional ?? null
            ]
        );

        return result.insertId;
    }

    // Atualizar artista
    async update(
        id_artista: number,
        url_foto_capa?: string | null,
        biografia?: string | null,
        contato_profissional?: string | null
    ): Promise<boolean> {

        const campos: string[] = [];
        const valores: (string | number | null)[] = [];

        if (url_foto_capa !== undefined) {
            campos.push("url_foto_capa = ?");
            valores.push(url_foto_capa);
        }

        if (biografia !== undefined) {
            campos.push("biografia = ?");
            valores.push(biografia);
        }

        if (contato_profissional !== undefined) {
            campos.push("contato_profissional = ?");
            valores.push(contato_profissional);
        }

        if (campos.length === 0) {
            return false;
        }

        valores.push(id_artista);

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE artistas
             SET ${campos.join(", ")}
             WHERE id_artista = ?`,
            valores
        );

        return result.affectedRows > 0;
    }

    // Atualizar foto de capa do artista
    async updateFotoCapa(
        id_artista: number,
        nomeArquivo: string
    ): Promise<boolean> {

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE artistas
             SET url_foto_capa = ?
             WHERE id_artista = ?`,
            [nomeArquivo, id_artista]
        );

        return result.affectedRows > 0;
    }

    // Excluir artista
    async delete(id_artista: number): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM artistas
             WHERE id_artista = ?`,
            [id_artista]
        );

        return result.affectedRows > 0;
    }
}
