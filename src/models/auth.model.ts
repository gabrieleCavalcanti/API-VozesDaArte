import { RowDataPacket } from "mysql2";

export interface IAuth extends RowDataPacket {
    id_autenticacao?: number;
    id_usuario: number;
    username: string;
    password_hash: string;
}