
import { Usuario } from "../models/usuario.model";
import { UsuarioRepository } from "../repository/usuario.repository";

export class UsuarioService {

    private usuarioRepository = new UsuarioRepository();

    // Buscar usuário pelo ID
    async findById(id_usuario: number) {

        const usuario = await this.usuarioRepository.findById(id_usuario);

        if (!usuario) {
            throw new Error("Usuário não encontrado.");
        }

        return usuario;
    }

    // Buscar usuário pelo e-mail
    async findByEmail(email: string) {

        const usuario = await this.usuarioRepository.findByEmail(email);

        if (!usuario) {
            throw new Error("Usuário não encontrado.");
        }

        return usuario;
    }

    // Listar todos os usuários
    async findAll() {

        return await this.usuarioRepository.findAll();
    }

    // Criar usuário
    async create(nome: string, email: string, tipo: string) {

        if (!nome || !email || !tipo) {
            throw new Error("Preencha todos os campos obrigatórios.");
        }

        const usuarioExistente = await this.usuarioRepository.findByEmail(email);

        if (usuarioExistente) {
            throw new Error("Este e-mail já está cadastrado.");
        }

        const usuario = Usuario.criar(nome, email, tipo);

        return await this.usuarioRepository.create(
            usuario.Nome,
            usuario.Email,
            usuario.Tipo!
        );
    }

    // Atualizar usuário
    async update(
        id_usuario: number,
        nome: string,
        email: string,
        url_foto_perfil?: string,
        id_endereco?: number
    ) {

        await this.findById(id_usuario);

        const usuarioComEmail = await this.usuarioRepository.findByEmail(email);

        if (
            usuarioComEmail &&
            usuarioComEmail.id_usuario !== id_usuario
        ) {
            throw new Error("Este e-mail já está sendo utilizado.");
        }

        const usuario = Usuario.editar(
            id_usuario,
            nome,
            email,
            url_foto_perfil,
            id_endereco
        );

        return await this.usuarioRepository.update(
            usuario.Id!,
            usuario.Nome,
            usuario.Email,
            usuario.UrlFotoPerfil,
            usuario.IdEndereco
        );
    }

    // Atualizar foto de perfil
    async updateFotoPerfil(
        id_usuario: number,
        url_foto_perfil: string
    ): Promise<boolean> {

        await this.findById(id_usuario);

        if (!url_foto_perfil || !url_foto_perfil.trim()) {
            throw new Error("Informe a foto de perfil.");
        }

        return await this.usuarioRepository.updateFotoPerfil(
            id_usuario,
            url_foto_perfil
        );
    }

    // Excluir usuário
    async delete(id_usuario: number) {

        await this.findById(id_usuario);

        return await this.usuarioRepository.delete(id_usuario);
    }
}
