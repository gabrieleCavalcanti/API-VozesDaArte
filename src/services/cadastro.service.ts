
import { db } from "../database/connection.database";
import { UsuarioRepository } from "../repository/usuario.repository";
import { AuthRepository } from "../repository/auth.repository";
import { ArtistaRepository } from "../repository/artista.repository";

import { Usuario } from "../models/usuario.model";
import { Artista } from "../models/artista.model";

import bcrypt from "bcryptjs";

export class CadastroService {

    private usuarioRepository = new UsuarioRepository();
    private authRepository = new AuthRepository();
    private artistaRepository = new ArtistaRepository();

    // CADASTRAR USUÁRIO OU ARTISTA
    async create(
        nome: string,
        email: string,
        tipo: string,
        username: string,
        password: string,
        url_foto_capa?: string,
        biografia?: string,
        contato_profissional?: string
    ) {

        if (!nome || !email || !tipo || !username || !password) {
            throw new Error("Preencha todos os campos obrigatórios.");
        }

        if (tipo !== "USUARIO" && tipo !== "ARTISTA") {
            throw new Error("Tipo de cadastro inválido.");
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Verificar e-mail
            const usuarioExistente =
                await this.usuarioRepository.findByEmail(email);

            if (usuarioExistente) {
                throw new Error("Este e-mail já está cadastrado.");
            }

            // 2. Verificar username
            const usernameExistente =
                await this.authRepository.findByUsername(username);

            if (usernameExistente) {
                throw new Error("Este username já está em uso.");
            }

            // 3. Criar usuário
            const usuario = Usuario.criar(nome, email, tipo);

            const id_usuario = await this.usuarioRepository.create(
                usuario.Nome,
                usuario.Email,
                usuario.Tipo!,
                connection
            );

            // 4. Criar credenciais
            const password_hash = await bcrypt.hash(password, 10);

            await this.authRepository.create(
                id_usuario,
                username,
                password_hash,
                connection
            );

            // 5. Criar artista, se necessário
            if (tipo === "ARTISTA") {

                const artista = Artista.criar(
                    id_usuario,
                    url_foto_capa,
                    biografia,
                    contato_profissional
                );

                await this.artistaRepository.create(
                    artista.IdUsuario!,
                    artista.UrlFotoCapa,
                    artista.Biografia,
                    artista.ContatoProfissional,
                    connection
                );
            }

            // Se tudo der certo, salvar
            await connection.commit();

            return {
                id_usuario,
                tipo
            };

        } catch (error) {

            // Se qualquer etapa falhar, desfazer tudo
            await connection.rollback();

            throw error;

        } finally {
            connection.release();
        }
    }
}
