
import { db } from "../database/connection.database";
import { IFavorito } from "../models/favorito.model";
import { ResultSetHeader, PoolConnection } from "mysql2/promise";

export class FavoritoRepository {

    // Buscar favorito pelo ID
    async findById(id_favorito: number): Promise<IFavorito | null> {
        const [result] = await db.execute<IFavorito[]>(
            `SELECT * FROM favoritos
             WHERE id_favorito = ?`,
            [id_favorito]
        );

        return result.length > 0 ? result[0] : null;
    }

    // Buscar favorito de um usuário para um artista
    async findByUsuarioAndArtista(
        id_usuario: number,
        id_artista: number
    ): Promise<IFavorito | null> {

        const [result] = await db.execute<IFavorito[]>(
            `SELECT * FROM favoritos
             WHERE id_usuario = ?
             AND id_artista = ?`,
            [id_usuario, id_artista]
        );

        return result.length > 0 ? result[0] : null;
    }

    // Verificar se o artista está favoritado pelo usuário
    async exists(
        id_usuario: number,
        id_artista: number
    ): Promise<boolean> {

        const [result] = await db.execute<IFavorito[]>(
            `SELECT id_favorito FROM favoritos
             WHERE id_usuario = ?
             AND id_artista = ?`,
            [id_usuario, id_artista]
        );

        return result.length > 0;
    }

    // Listar todos os favoritos
    async findAll(): Promise<IFavorito[]> {
        const [result] = await db.execute<IFavorito[]>(
            `SELECT * FROM favoritos`
        );

        return result;
    }

    // Listar favoritos de um usuário
    async findByUsuario(id_usuario: number): Promise<IFavorito[]> {
        const [result] = await db.execute<IFavorito[]>(
            `SELECT * FROM favoritos
             WHERE id_usuario = ?`,
            [id_usuario]
        );

        return result;
    }

    // Listar usuários que favoritaram um artista
    async findByArtista(id_artista: number): Promise<IFavorito[]> {
        const [result] = await db.execute<IFavorito[]>(
            `SELECT * FROM favoritos
             WHERE id_artista = ?`,
            [id_artista]
        );

        return result;
    }

    // Criar favorito
    async create(
        id_artista: number,
        id_usuario: number,
        connection?: PoolConnection
    ): Promise<number> {

        const executor = connection ?? db;

        const [result] = await executor.execute<ResultSetHeader>(
            `INSERT INTO favoritos
                (id_artista, id_usuario)
             VALUES (?, ?)`,
            [id_artista, id_usuario]
        );

        return result.insertId;
    }

    // Excluir favorito
    async delete(
        id_favorito: number,
        connection?: PoolConnection
    ): Promise<boolean> {

        const executor = connection ?? db;

        const [result] = await executor.execute<ResultSetHeader>(
            `DELETE FROM favoritos
             WHERE id_favorito = ?`,
            [id_favorito]
        );

        return result.affectedRows > 0;
    }

    // Remover favorito pelo usuário e artista
    async deleteByUsuarioAndArtista(
        id_usuario: number,
        id_artista: number,
        connection?: PoolConnection
    ): Promise<boolean> {

        const executor = connection ?? db;

        const [result] = await executor.execute<ResultSetHeader>(
            `DELETE FROM favoritos
             WHERE id_usuario = ?
             AND id_artista = ?`,
            [id_usuario, id_artista]
        );

        return result.affectedRows > 0;
    }
}
