
import bcrypt from "bcryptjs";

import { db } from "../database/connection.database";
import { AuthRepository } from "../repository/auth.repository";
// import { UsuarioRepository } from "../repository/usuario.repository";

export class AuthService {

    private authRepository = new AuthRepository();
    // private usuarioRepository = new UsuarioRepository();

    // Buscar usuário autenticado pelo ID da autenticação
async findById(id_autenticacao: number) {
    const autenticacao = await this.authRepository.findById(id_autenticacao);

    if (!autenticacao) {
        throw new Error("Autenticação não encontrada.");
    }

    return {
        id_autenticacao: autenticacao.id_autenticacao,
        id_usuario: autenticacao.id_usuario,
        username: autenticacao.username,
        nome: autenticacao.nome,
        email: autenticacao.email,
        tipo: autenticacao.tipo
    };
}

    // Buscar autenticação pelo username
    async findByUsername(username: string) {
        const autenticacao = await this.authRepository.findByUsername(username);

        if (!autenticacao) {
            throw new Error("Credenciais não encontradas.");
        }

        return autenticacao;
    }

    // Cadastrar credenciais usuário - Auth
    async register(
        id_usuario: number,
        username: string,
        password: string
    ) {

        if (!id_usuario || !username || !password) {
            throw new Error("Preencha todos os campos obrigatórios.");
        }

        const usernameExistente = await this.authRepository.findByUsername(username);

        if (usernameExistente) {
            throw new Error("Este username já está em uso.");
        }

        const password_hash = await bcrypt.hash(password, 10);

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            await this.authRepository.create(
                id_usuario,
                username,
                password_hash,
                connection
            );

            await connection.commit();

            return {
                id_usuario,
                username
            };

        } catch (error) {
            await connection.rollback();
            throw error;

        } finally {
            connection.release();
        }
    }

    // Realizar login
    async login(username: string, password: string) {

        if (!username || !password) {
            throw new Error("Informe o username e a senha.");
        }

        const autenticacao = await this.authRepository.findByUsername(username);

        if (!autenticacao) {
            throw new Error("Username ou senha incorretos.");
        }

        const senhaValida = await bcrypt.compare(
            password,
            autenticacao.password_hash
        );

        if (!senhaValida) {
            throw new Error("Username ou senha incorretos.");
        }

        return {
            id_usuario: autenticacao.id_usuario,
            id_autenticacao: autenticacao.id_autenticacao,
            username: autenticacao.username,
            nome: autenticacao.nome,
            email: autenticacao.email,
            tipo: autenticacao.tipo
        };
    }

    // Atualizar senha
    async updatePassword(
        id_usuario: number,
        password: string
    ) {

        if (!password) {
            throw new Error("Informe a nova senha.");
        }

        const autenticacao = await this.authRepository.findByUsuario(id_usuario);

        if (!autenticacao) {
            throw new Error("Autenticação não encontrada.");
        }

        const password_hash = await bcrypt.hash(password, 10);

        return await this.authRepository.updatePassword(
            id_usuario,
            password_hash
        );
    }

    // Atualizar username
    async updateUsername(
        id_usuario: number,
        username: string
    ) {

        if (!username) {
            throw new Error("Informe o novo username.");
        }

        const autenticacao = await this.authRepository.findByUsuario(id_usuario);

        if (!autenticacao) {
            throw new Error("Autenticação não encontrada.");
        }

        const usernameExistente = await this.authRepository.findByUsername(username);

        if (usernameExistente && usernameExistente.id_usuario !== id_usuario) {
            throw new Error("Este username já está em uso.");
        }

        return await this.authRepository.updateUsername(
            id_usuario,
            username
        );
    }
}
