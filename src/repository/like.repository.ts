
import { db } from "../database/connection.database";
import { ILike } from "../models/like.model";
import { ResultSetHeader, PoolConnection } from "mysql2/promise";

export class LikeRepository {

    // Buscar like pelo ID
    async findById(id_like: number): Promise<ILike | null> {
        const [result] = await db.execute<ILike[]>(
            `SELECT * FROM likes
             WHERE id_like = ?`,
            [id_like]
        );

        return result.length > 0 ? result[0] : null;
    }

    // Buscar like de um usuário em um post
    async findByUsuarioAndPost(
        id_usuario: number,
        id_post: number
    ): Promise<ILike | null> {

        const [result] = await db.execute<ILike[]>(
            `SELECT * FROM likes
             WHERE id_usuario = ?
             AND id_post = ?`,
            [id_usuario, id_post]
        );

        return result.length > 0 ? result[0] : null;
    }

    // Verificar se o usuário curtiu o post
    async exists(
        id_usuario: number,
        id_post: number
    ): Promise<boolean> {

        const [result] = await db.execute<ILike[]>(
            `SELECT id_like FROM likes
             WHERE id_usuario = ?
             AND id_post = ?`,
            [id_usuario, id_post]
        );

        return result.length > 0;
    }

    // Listar todos os likes
    async findAll(): Promise<ILike[]> {
        const [result] = await db.execute<ILike[]>(
            `SELECT * FROM likes`
        );

        return result;
    }

    // Listar likes de um usuário
    async findByUsuario(id_usuario: number): Promise<ILike[]> {
        const [result] = await db.execute<ILike[]>(
            `SELECT * FROM likes
             WHERE id_usuario = ?`,
            [id_usuario]
        );

        return result;
    }

    // Listar likes de um post
    async findByPost(id_post: number): Promise<ILike[]> {
        const [result] = await db.execute<ILike[]>(
            `SELECT * FROM likes
             WHERE id_post = ?`,
            [id_post]
        );

        return result;
    }

    // Contar likes de um post
    async countByPost(id_post: number): Promise<number> {
        const [result] = await db.execute<any[]>(
            `SELECT COUNT(*) AS total
             FROM likes
             WHERE id_post = ?`,
            [id_post]
        );

        return Number(result[0].total);
    }

    // Criar like
    async create(
        id_usuario: number,
        id_post: number,
        connection?: PoolConnection
    ): Promise<number> {

        const executor = connection ?? db;

        const [result] = await executor.execute<ResultSetHeader>(
            `INSERT INTO likes
                (id_usuario, id_post, data_like)
             VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [id_usuario, id_post]
        );

        return result.insertId;
    }

    // Excluir like
    async delete(
        id_like: number,
        connection?: PoolConnection
    ): Promise<boolean> {

        const executor = connection ?? db;

        const [result] = await executor.execute<ResultSetHeader>(
            `DELETE FROM likes
             WHERE id_like = ?`,
            [id_like]
        );

        return result.affectedRows > 0;
    }

    // Descurtir post pelo usuário
    async deleteByUsuarioAndPost(
        id_usuario: number,
        id_post: number,
        connection?: PoolConnection
    ): Promise<boolean> {

        const executor = connection ?? db;

        const [result] = await executor.execute<ResultSetHeader>(
            `DELETE FROM likes
             WHERE id_usuario = ?
             AND id_post = ?`,
            [id_usuario, id_post]
        );

        return result.affectedRows > 0;
    }
}
