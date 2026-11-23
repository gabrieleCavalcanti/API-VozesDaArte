import { db } from "../database/connection.database";
import { IAuth } from "../models/auth.model";
import { ResultSetHeader, PoolConnection } from "mysql2/promise";


export class AuthRepository {
  // Buscar autenticação pelo ID
async findById(id_autenticacao: number): Promise<IAuth | null> {
    const [result] = await db.execute<IAuth[]>(
        `SELECT 
            a.id_autenticacao,
            a.id_usuario,
            a.username,
            u.nome,
            u.email,
            u.tipo
         FROM autenticacao a
         INNER JOIN usuarios u 
            ON u.id_usuario = a.id_usuario
         WHERE a.id_autenticacao = ?`,
        [id_autenticacao]
    );

    return result.length > 0 ? result[0] : null;
}

  // Buscar autenticação pelo username
  async findByUsername(username: string): Promise<IAuth | null> {
    const [result] = await db.execute<IAuth[]>(
      `SELECT * FROM autenticacao
             WHERE username = ?`,
      [username],
    );

    return result.length > 0 ? result[0] : null;
  }

  // Buscar autenticação pelo ID do usuário
  async findByUsuario(id_usuario: number): Promise<IAuth | null> {
    const [result] = await db.execute<IAuth[]>(
      `SELECT * FROM autenticacao
             WHERE id_usuario = ?`,
      [id_usuario],
    );

    return result.length > 0 ? result[0] : null;
  }

  // Criar autenticação
  // A senha deve chegar criptografada (hash).
  async create(
    id_usuario: number,
    username: string,
    password_hash: string,
    connection?: PoolConnection,
  ): Promise<number> {
    const executor = connection ?? db;

    const [result] = await executor.execute<ResultSetHeader>(
      `INSERT INTO autenticacao
                (id_usuario, username, password_hash)
             VALUES (?, ?, ?)`,
      [id_usuario, username, password_hash],
    );

    return result.insertId;
  }

  // Atualizar senha
  // Recebe a nova senha já criptografada.
  async updatePassword(
    id_usuario: number,
    password_hash: string,
  ): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE autenticacao
             SET password_hash = ?
             WHERE id_usuario = ?`,
      [password_hash, id_usuario],
    );

    return result.affectedRows > 0;
  }

  // Atualizar username
  async updateUsername(id_usuario: number, username: string): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE autenticacao
             SET username = ?
             WHERE id_usuario = ?`,
      [username, id_usuario],
    );

    return result.affectedRows > 0;
  }

  // Excluir autenticação
  async delete(id_usuario: number): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      `DELETE FROM autenticacao
             WHERE id_usuario = ?`,
      [id_usuario],
    );

    return result.affectedRows > 0;
  }
}
