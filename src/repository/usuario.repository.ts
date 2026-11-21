
import { db } from "../database/connection.database";
import { IUsuario } from "../models/usuario.model";
import { ResultSetHeader, PoolConnection } from "mysql2/promise";

export class UsuarioRepository {

    // Buscar usuário pelo ID
    async findById(id_usuario: number): Promise<IUsuario | null> {
        const [result] = await db.execute<IUsuario[]>(
            `SELECT * FROM usuarios
             WHERE id_usuario = ?`,
            [id_usuario]
        );

        return result.length > 0 ? result[0] : null;
    }

    // Buscar usuário pelo e-mail
    async findByEmail(email: string): Promise<IUsuario | null> {
        const [result] = await db.execute<IUsuario[]>(
            `SELECT * FROM usuarios
             WHERE email = ?`,
            [email]
        );

        return result.length > 0 ? result[0] : null;
    }

    // Listar todos os usuários
    async findAll(): Promise<IUsuario[]> {
        const [result] = await db.execute<IUsuario[]>(
            `SELECT * FROM usuarios`
        );

        return result;
    }

    // Criar usuário
    async create(
        nome: string,
        email: string,
        tipo: string,
        connection?: PoolConnection
    ): Promise<number> {

        const executor = connection ?? db;

        const [result] = await executor.execute<ResultSetHeader>(
            `INSERT INTO usuarios
                (nome, email, tipo)
             VALUES (?, ?, ?)`,
            [nome, email, tipo]
        );

        return result.insertId;
    }

    // Atualizar usuário
    async update(
        id_usuario: number,
        nome: string,
        email: string,
        url_foto_perfil?: string,
        id_endereco?: number
    ): Promise<boolean> {

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE usuarios
             SET nome = ?,
                 email = ?,
                 url_foto_perfil = ?,
                 id_endereco = ?
             WHERE id_usuario = ?`,
            [
                nome,
                email,
                url_foto_perfil ?? null,
                id_endereco ?? null,
                id_usuario
            ]
        );

        return result.affectedRows > 0;
    }

    // Atualizar foto de perfil
    async updateFotoPerfil(
        id_usuario: number,
        url_foto_perfil: string
    ): Promise<boolean> {

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE usuarios
             SET url_foto_perfil = ?
             WHERE id_usuario = ?`,
            [url_foto_perfil, id_usuario]
        );

        return result.affectedRows > 0;
    }


    // Excluir usuário
    async delete(id_usuario: number): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            `DELETE FROM usuarios
             WHERE id_usuario = ?`,
            [id_usuario]
        );

        return result.affectedRows > 0;
    }
}
