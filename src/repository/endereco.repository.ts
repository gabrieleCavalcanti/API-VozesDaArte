import { db } from "../database/connection.database";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { IEndereco } from "../models/endereco.model";

export class EnderecoRepository {
  // BUSCAR ENDEREÇO DO USUÁRIO
  async findByUsername(username: string): Promise<IEndereco | null> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT e.*
             FROM autenticacao a
             INNER JOIN usuarios u
                ON a.id_usuario = u.ID_Usuario
             INNER JOIN enderecos e
                ON u.id_endereco = e.id_endereco
             WHERE a.username = ?`,
      [username],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as IEndereco;
  }

  // CADASTRAR OU ATUALIZAR ENDEREÇO
  async saveOrUpdate(username: string, endereco: IEndereco): Promise<number> {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [usuarios] = await connection.execute<RowDataPacket[]>(
        `SELECT u.ID_Usuario, u.id_endereco
                 FROM autenticacao a
                 INNER JOIN usuarios u
                    ON a.id_usuario = u.ID_Usuario
                 WHERE a.username = ?
                 FOR UPDATE`,
        [username],
      );

      if (usuarios.length === 0) {
        throw new Error("Usuário não encontrado.");
      }

      const usuario = usuarios[0];

      let idEndereco: number;

      if (usuario.id_endereco) {
        // ATUALIZAR ENDEREÇO EXISTENTE
        await connection.execute(
          `UPDATE enderecos
                     SET cep = ?,
                         rua = ?,
                         complemento = ?,
                         uf = ?,
                         estado = ?,
                         cidade = ?,
                         bairro = ?,
                         numero = ?,
                         latitude = ?,
                         longitude = ?
                     WHERE id_endereco = ?`,
          [
            endereco.cep,
            endereco.rua,
            endereco.complemento,
            endereco.uf,
            endereco.estado,
            endereco.cidade,
            endereco.bairro,
            endereco.numero,
            endereco.latitude,
            endereco.longitude,
            usuario.id_endereco,
          ],
        );

        idEndereco = usuario.id_endereco;
      } else {
        // CADASTRAR NOVO ENDEREÇO
        const [result] = await connection.query<ResultSetHeader>(
          `INSERT INTO enderecos (
        cep, rua, complemento, uf, estado,
        cidade, bairro, numero, latitude, longitude
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            endereco.cep,
            endereco.rua,
            endereco.complemento,
            endereco.uf,
            endereco.estado,
            endereco.cidade,
            endereco.bairro,
            endereco.numero,
            endereco.latitude,
            endereco.longitude,
          ],
        );

        idEndereco = result.insertId;

        // VINCULAR ENDEREÇO AO USUÁRIO
        await connection.execute(
          `UPDATE usuarios
                     SET id_endereco = ?
                     WHERE ID_Usuario = ?`,
          [idEndereco, usuario.ID_Usuario],
        );
      }

      await connection.commit();

      return idEndereco;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
