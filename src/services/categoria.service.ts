
import { CategoriaRepository } from "../repository/categoria.repository";
import { Categoria } from "../models/categoria.model";
import { UsuarioInteresseCategoria } from "../models/usuarioInteresseCategoria.model";

export class CategoriaService {

    private categoriaRepository = new CategoriaRepository();

    // BUSCAR TODAS AS CATEGORIAS
    async findAll() {
        return await this.categoriaRepository.findAll();
    }

    // BUSCAR CATEGORIA POR ID
    async findById(id_categoria: number) {

        if (!Number.isInteger(id_categoria) || id_categoria <= 0) {
            throw new Error("ID da categoria inválido.");
        }

        const categoria = await this.categoriaRepository.findById(id_categoria);

        if (!categoria) {
            throw new Error("Categoria não encontrada.");
        }

        return categoria;
    }

    // CADASTRAR CATEGORIA
    async create(nome_categoria: string, descricao?: string | null) {

        if (!nome_categoria?.trim()) {
            throw new Error("O nome da categoria é obrigatório.");
        }

        const categoria = Categoria.criar(
            nome_categoria.trim(),
            descricao?.trim() || null
        );

        const id_categoria = await this.categoriaRepository.create(
            categoria.NomeCategoria,
            categoria.Descricao
        );

        return await this.findById(id_categoria);
    }

    // ATUALIZAR CATEGORIA
    async update(
        id_categoria: number,
        nome_categoria: string,
        descricao?: string | null
    ) {

        await this.findById(id_categoria);

        if (!nome_categoria?.trim()) {
            throw new Error("O nome da categoria é obrigatório.");
        }

        const categoria = Categoria.editar(
            id_categoria,
            nome_categoria.trim(),
            descricao?.trim() || null
        );

        await this.categoriaRepository.update(
            categoria.Id!,
            categoria.NomeCategoria,
            categoria.Descricao
        );

        return await this.findById(id_categoria);
    }

    // EXCLUIR CATEGORIA
    async delete(id_categoria: number) {

        await this.findById(id_categoria);

        return await this.categoriaRepository.delete(id_categoria);
    }

    // BUSCAR INTERESSES DO USUÁRIO
    async findInteressesByUsuario(id_usuario: number) {

        if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
            throw new Error("ID do usuário inválido.");
        }

        const usuarioExiste = await this.categoriaRepository.usuarioExiste(
            id_usuario
        );

        if (!usuarioExiste) {
            throw new Error("Usuário não encontrado.");
        }

        return await this.categoriaRepository.findInteressesByUsuario(
            id_usuario
        );
    }

    // ADICIONAR INTERESSE
    async addInteresse(id_usuario: number, id_categoria: number) {

        if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
            throw new Error("ID do usuário inválido.");
        }

        await this.findById(id_categoria);

        const usuarioExiste = await this.categoriaRepository.usuarioExiste(
            id_usuario
        );

        if (!usuarioExiste) {
            throw new Error("Usuário não encontrado.");
        }

        const interesse = UsuarioInteresseCategoria.criar(
            id_categoria,
            id_usuario
        );

        const interesseExiste = await this.categoriaRepository.findInteresse(
            interesse.IdUsuario,
            interesse.IdCategoria
        );

        if (interesseExiste) {
            throw new Error("Esta categoria já está nos interesses do usuário.");
        }

        await this.categoriaRepository.addInteresse(
            interesse.IdUsuario,
            interesse.IdCategoria
        );

        return {
            mensagem: "Categoria adicionada aos interesses com sucesso."
        };
    }

    // REMOVER INTERESSE
    async removeInteresse(id_usuario: number, id_categoria: number) {

        if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
            throw new Error("ID do usuário inválido.");
        }

        const usuarioExiste = await this.categoriaRepository.usuarioExiste(
            id_usuario
        );

        if (!usuarioExiste) {
            throw new Error("Usuário não encontrado.");
        }

        const removido = await this.categoriaRepository.removeInteresse(
            id_usuario,
            id_categoria
        );

        if (!removido) {
            throw new Error("Interesse não encontrado.");
        }

        return {
            mensagem: "Categoria removida dos interesses com sucesso."
        };
    }
}
