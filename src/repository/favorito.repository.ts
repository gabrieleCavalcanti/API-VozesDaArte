import { db } from "../database/connection.database";
import { IFavorito } from "../models/favorito.model";
import {
    ResultSetHeader,
    PoolConnection,
    RowDataPacket
} from "mysql2/promise";

// INTERFACE DOS FAVORITOS COM DADOS DO ARTISTA
export interface FavoritoArtista extends RowDataPacket {
    id_favorito: number;
    id_usuario: number;
    id_artista: number;

    nome: string;
    url_foto_perfil: string | null;
    url_foto_capa: string | null;
    biografia: string | null;
    contato_profissional: string | null;
}

export class FavoritoRepository {

    // BUSCAR FAVORITO PELO ID
    async findById(id_favorito: number): Promise<IFavorito | null> {
        const [result] = await db.execute<IFavorito[]>(
            `SELECT *
             FROM favoritos
             WHERE id_favorito = ?`,
            [id_favorito]
        );

        return result.length > 0 ? result[0] : null;
    }

    // BUSCAR FAVORITO DE UM USUÁRIO PARA UM ARTISTA
    async findByUsuarioAndArtista(
        id_usuario: number,
        id_artista: number
    ): Promise<IFavorito | null> {

        const [result] = await db.execute<IFavorito[]>(
            `SELECT *
             FROM favoritos
             WHERE id_usuario = ?
             AND id_artista = ?`,
            [id_usuario, id_artista]
        );

        return result.length > 0 ? result[0] : null;
    }

    // VERIFICAR SE O ARTISTA ESTÁ FAVORITADO PELO USUÁRIO
    async exists(
        id_usuario: number,
        id_artista: number
    ): Promise<boolean> {

        const [result] = await db.execute<IFavorito[]>(
            `SELECT id_favorito
             FROM favoritos
             WHERE id_usuario = ?
             AND id_artista = ?`,
            [id_usuario, id_artista]
        );

        return result.length > 0;
    }

    // LISTAR TODOS OS FAVORITOS
    async findAll(): Promise<IFavorito[]> {
        const [result] = await db.execute<IFavorito[]>(
            `SELECT *
             FROM favoritos`
        );

        return result;
    }

    // LISTAR FAVORITOS DO USUÁRIO COM DADOS COMPLETOS DOS ARTISTAS
    async findByUsuario(
        id_usuario: number
    ): Promise<FavoritoArtista[]> {

        const [result] = await db.execute<FavoritoArtista[]>(
            `SELECT
                f.id_favorito,
                f.id_usuario,
                f.id_artista,

                u.nome,
                u.url_foto_perfil,

                a.url_foto_capa,
                a.biografia,
                a.contato_profissional

             FROM favoritos f

             INNER JOIN artistas a
                ON a.id_artista = f.id_artista

             INNER JOIN usuarios u
                ON u.id_usuario = a.id_usuario

             WHERE f.id_usuario = ?

             ORDER BY f.id_favorito DESC`,
            [id_usuario]
        );

        return result;
    }

    // LISTAR USUÁRIOS QUE FAVORITARAM UM ARTISTA
    async findByArtista(id_artista: number): Promise<IFavorito[]> {
        const [result] = await db.execute<IFavorito[]>(
            `SELECT *
             FROM favoritos
             WHERE id_artista = ?`,
            [id_artista]
        );

        return result;
    }

    // CRIAR FAVORITO
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

    // EXCLUIR FAVORITO
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

    // REMOVER FAVORITO PELO USUÁRIO E ARTISTA
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