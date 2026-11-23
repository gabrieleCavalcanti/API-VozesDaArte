
import { db } from "../database/connection.database";
import { IUsuario } from "../models/usuario.model";
import { ResultSetHeader, PoolConnection } from "mysql2/promise";

export class UsuarioRepository {

    // Buscar usuário pelo ID
async findById(id_usuario: number): Promise<IUsuario | null> {
    const [result] = await db.execute<IUsuario[]>(
        `SELECT
            u.*,
            a.username
         FROM usuarios u
         LEFT JOIN autenticacao a
            ON a.id_usuario = u.id_usuario
         WHERE u.id_usuario = ?`,
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
    nome?: string,
    email?: string,
    url_foto_perfil?: string | null,
    id_endereco?: number | null
): Promise<boolean> {

    const campos: string[] = [];
    const valores: (string | number | null)[] = [];

    if (nome !== undefined) {
        campos.push("nome = ?");
        valores.push(nome);
    }

    if (email !== undefined) {
        campos.push("email = ?");
        valores.push(email);
    }

    if (url_foto_perfil !== undefined) {
        campos.push("url_foto_perfil = ?");
        valores.push(url_foto_perfil);
    }

    if (id_endereco !== undefined) {
        campos.push("id_endereco = ?");
        valores.push(id_endereco);
    }

    if (campos.length === 0) {
        return false;
    }

    valores.push(id_usuario);

    const [result] = await db.execute<ResultSetHeader>(
        `UPDATE usuarios
         SET ${campos.join(", ")}
         WHERE id_usuario = ?`,
        valores
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
