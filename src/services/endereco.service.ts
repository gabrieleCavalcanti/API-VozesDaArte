
import { Endereco, IEndereco } from "../models/endereco.model";
import { EnderecoRepository } from "../repository/endereco.repository";

export class EnderecoService {

    private enderecoRepository = new EnderecoRepository();

    // Buscar endereço do usuário
    async findByUsername(username: string) {

        if (!username) {
            throw new Error("Usuário não identificado.");
        }

        const endereco =
            await this.enderecoRepository.findByUsername(username);

        if (!endereco) {
            throw new Error("Endereço não encontrado.");
        }

        return endereco;
    }

    // Cadastrar ou atualizar endereço
    async saveOrUpdate(username: string, dados: IEndereco) {

        if (!username) {
            throw new Error("Usuário não identificado.");
        }

        if (!dados || typeof dados !== "object") {
            throw new Error("Dados do endereço inválidos.");
        }

        // Validar campos obrigatórios
        const camposObrigatorios = [
            dados.cep,
            dados.rua,
            dados.uf,
            dados.estado,
            dados.cidade,
            dados.bairro,
            dados.numero
        ];

        if (
            camposObrigatorios.some(
                campo => typeof campo !== "string" || !campo.trim()
            )
        ) {
            throw new Error("Preencha todos os campos obrigatórios.");
        }

        // Validar CEP
        const cep = dados.cep.replace(/\D/g, "");

        if (!/^\d{8}$/.test(cep)) {
            throw new Error("CEP inválido.");
        }

        // Validar tamanho dos campos
        if (
            dados.rua.length > 150 ||
            (dados.complemento?.length ?? 0) > 100 ||
            dados.estado.length > 100 ||
            dados.cidade.length > 100 ||
            dados.bairro.length > 100 ||
            dados.numero.length > 10
        ) {
            throw new Error("Um ou mais campos ultrapassaram o limite permitido.");
        }

        // Validar UF
        const uf = dados.uf.trim().toUpperCase();

        if (!/^[A-Z]{2}$/.test(uf)) {
            throw new Error("UF inválida.");
        }

        // Validar latitude
        if (
            dados.latitude != null &&
            (!Number.isFinite(dados.latitude) ||
                dados.latitude < -90 ||
                dados.latitude > 90)
        ) {
            throw new Error("Latitude inválida.");
        }

        // Validar longitude
        if (
            dados.longitude != null &&
            (!Number.isFinite(dados.longitude) ||
                dados.longitude < -180 ||
                dados.longitude > 180)
        ) {
            throw new Error("Longitude inválida.");
        }

        // Criar objeto de endereço
        const endereco = Endereco.criar({
            cep,
            rua: dados.rua.trim(),
            complemento: dados.complemento?.trim() || null,
            uf,
            estado: dados.estado.trim(),
            cidade: dados.cidade.trim(),
            bairro: dados.bairro.trim(),
            numero: dados.numero.trim(),
            latitude: dados.latitude ?? null,
            longitude: dados.longitude ?? null
        });

        // Salvar no banco
        const idEndereco =
            await this.enderecoRepository.saveOrUpdate(
                username,
                endereco.toJSON()
            );

        return {
            mensagem: "Endereço salvo com sucesso.",
            id_endereco: idEndereco
        };
    }
}
