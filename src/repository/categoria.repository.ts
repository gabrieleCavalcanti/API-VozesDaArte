
import { db } from "../database/connection.database";
import { ICategoria } from "../models/categoria.model";
import { IUsuarioInteresseCategoria } from "../models/usuarioInteresseCategoria.model";
import { ResultSetHeader } from "mysql2/promise";

export class CategoriaRepository {

    // BUSCAR TODAS AS CATEGORIAS
    async findAll(): Promise<ICategoria[]> {
        const [rows] = await db.execute<ICategoria[]>(
            "SELECT * FROM categorias ORDER BY nome_categoria"
        );

        return rows;
    }

    // BUSCAR CATEGORIA POR ID
    async findById(id_categoria: number): Promise<ICategoria | null> {
        const [rows] = await db.execute<ICategoria[]>(
            "SELECT * FROM categorias WHERE id_categoria = ?",
            [id_categoria]
        );

        return rows[0] || null;
    }

    // CADASTRAR CATEGORIA
    async create(
        nome_categoria: string,
        descricao?: string | null
    ): Promise<number> {

        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO categorias
            (nome_categoria, descricao)
            VALUES (?, ?)`,
            [nome_categoria, descricao ?? null]
        );

        return result.insertId;
    }

    // ATUALIZAR CATEGORIA
    async update(
        id_categoria: number,
        nome_categoria: string,
        descricao?: string | null
    ): Promise<boolean> {

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE categorias
             SET nome_categoria = ?, descricao = ?
             WHERE id_categoria = ?`,
            [nome_categoria, descricao ?? null, id_categoria]
        );

        return result.affectedRows > 0;
    }

    // EXCLUIR CATEGORIA
    async delete(id_categoria: number): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            "DELETE FROM categorias WHERE id_categoria = ?",
            [id_categoria]
        );

        return result.affectedRows > 0;
    }

    // VERIFICAR SE O USUÁRIO EXISTE
    async usuarioExiste(id_usuario: number): Promise<boolean> {
        const [rows] = await db.execute(
            "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
            [id_usuario]
        );

        return (rows as unknown[]).length > 0;
    }

    // BUSCAR INTERESSES DO USUÁRIO
    async findInteressesByUsuario(
        id_usuario: number
    ): Promise<ICategoria[]> {

        const [rows] = await db.execute<ICategoria[]>(
            `SELECT c.id_categoria, c.nome_categoria, c.descricao
             FROM categorias c
             INNER JOIN usuario_interesse_categorias uic
             ON c.id_categoria = uic.id_categoria
             WHERE uic.id_usuario = ?
             ORDER BY c.nome_categoria`,
            [id_usuario]
        );

        return rows;
    }

    // VERIFICAR SE O INTERESSE JÁ EXISTE
    async findInteresse(
        id_usuario: number,
        id_categoria: number
    ): Promise<IUsuarioInteresseCategoria | null> {

        const [rows] = await db.execute<IUsuarioInteresseCategoria[]>(
            `SELECT id_categoria, id_usuario
             FROM usuario_interesse_categorias
             WHERE id_usuario = ? AND id_categoria = ?`,
            [id_usuario, id_categoria]
        );

        return rows[0] || null;
    }

    // ADICIONAR INTERESSE
    async addInteresse(
        id_usuario: number,
        id_categoria: number
    ): Promise<void> {

        await db.execute(
            `INSERT INTO usuario_interesse_categorias
            (id_categoria, id_usuario)
            VALUES (?, ?)`,
            [id_categoria, id_usuario]
        );
    }

    // REMOVER INTERESSE
    async removeInteresse(
        id_usuario: number,
        id_categoria: number
    ): Promise<boolean> {

        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM usuario_interesse_categorias
             WHERE id_usuario = ? AND id_categoria = ?`,
            [id_usuario, id_categoria]
        );

        return result.affectedRows > 0;
    }
}
