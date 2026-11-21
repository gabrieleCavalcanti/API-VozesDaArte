
import { db } from "../database/connection.database";
import { IPost } from "../models/post.model";
import { ResultSetHeader, PoolConnection } from "mysql2/promise";

export class PostRepository {

    // Buscar post pelo ID
    async findById(id_post: number): Promise<IPost | null> {
        const [result] = await db.execute<IPost[]>(
            `SELECT * FROM posts
             WHERE id_post = ?`,
            [id_post]
        );

        return result.length > 0 ? result[0] : null;
    }

    // Listar todos os posts
    async findAll(): Promise<IPost[]> {
        const [result] = await db.execute<IPost[]>(
            `SELECT * FROM posts`
        );

        return result;
    }

    // Listar posts de um artista
    async findByArtista(id_artista: number): Promise<IPost[]> {
        const [result] = await db.execute<IPost[]>(
            `SELECT * FROM posts
             WHERE id_artista = ?
             ORDER BY data_cadastro DESC`,
            [id_artista]
        );

        return result;
    }

    // Criar post
    async create(
        id_categoria: number,
        url_img: string | undefined,
        titulo: string,
        descricao: string,
        link_externo: string | undefined,
        id_artista: number,
        connection?: PoolConnection
    ): Promise<number> {

        const executor = connection ?? db;

        const [result] = await executor.execute<ResultSetHeader>(
            `INSERT INTO posts
                (id_categoria, url_img, titulo, descricao,
                 link_externo, destaque, arquivado, id_artista)
             VALUES (?, ?, ?, ?, ?, FALSE, FALSE, ?)`,
            [
                id_categoria,
                url_img ?? null,
                titulo,
                descricao,
                link_externo ?? null,
                id_artista
            ]
        );

        return result.insertId;
    }

    // Atualizar post
    async update(
        id_post: number,
        id_categoria: number,
        titulo: string,
        descricao: string,
        url_img?: string,
        link_externo?: string
    ): Promise<boolean> {

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE posts
             SET id_categoria = ?,
                 titulo = ?,
                 descricao = ?,
                 url_img = ?,
                 link_externo = ?
             WHERE id_post = ?`,
            [
                id_categoria,
                titulo,
                descricao,
                url_img ?? null,
                link_externo ?? null,
                id_post
            ]
        );

        return result.affectedRows > 0;
    }

    // Atualizar imagem do post
    async updateImagem(
        id_post: number,
        url_img: string
    ): Promise<boolean> {

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE posts
             SET url_img = ?
             WHERE id_post = ?`,
            [url_img, id_post]
        );

        return result.affectedRows > 0;
    }

    // Destacar post
    async destacar(
        id_post: number,
        id_artista: number
    ): Promise<boolean> {

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Remove o destaque dos outros posts do artista
            await connection.execute(
                `UPDATE posts
                 SET destaque = FALSE
                 WHERE id_artista = ?`,
                [id_artista]
            );

            // Destaca o post selecionado
            const [result] = await connection.execute<ResultSetHeader>(
                `UPDATE posts
                 SET destaque = TRUE
                 WHERE id_post = ?
                   AND id_artista = ?
                   AND arquivado = FALSE`,
                [id_post, id_artista]
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                return false;
            }

            await connection.commit();

            return true;

        } catch (error) {
            await connection.rollback();
            throw error;

        } finally {
            connection.release();
        }
    }

    // Remover destaque do post
    async removerDestaque(
        id_post: number,
        id_artista: number
    ): Promise<boolean> {

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE posts
             SET destaque = FALSE
             WHERE id_post = ?
               AND id_artista = ?`,
            [id_post, id_artista]
        );

        return result.affectedRows > 0;
    }

    // Arquivar post
    async arquivar(
        id_post: number,
        id_artista: number
    ): Promise<boolean> {

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE posts
             SET arquivado = TRUE,
                 destaque = FALSE
             WHERE id_post = ?
               AND id_artista = ?`,
            [id_post, id_artista]
        );

        return result.affectedRows > 0;
    }

    // Desarquivar post
    async desarquivar(
        id_post: number,
        id_artista: number
    ): Promise<boolean> {

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE posts
             SET arquivado = FALSE
             WHERE id_post = ?
               AND id_artista = ?`,
            [id_post, id_artista]
        );

        return result.affectedRows > 0;
    }

}
