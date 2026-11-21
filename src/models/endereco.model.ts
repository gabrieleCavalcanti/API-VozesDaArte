
export interface IEndereco {
    id_endereco?: number;
    cep: string;
    rua: string;
    complemento?: string | null;
    uf: string;
    estado: string;
    cidade: string;
    bairro: string;
    numero: string;
    latitude?: number | null;
    longitude?: number | null;
}

export class Endereco {

    private id_endereco?: number;
    private cep: string;
    private rua: string;
    private complemento: string | null;
    private uf: string;
    private estado: string;
    private cidade: string;
    private bairro: string;
    private numero: string;
    private latitude: number | null;
    private longitude: number | null;

    constructor(dados: IEndereco) {
        this.id_endereco = dados.id_endereco;
        this.cep = dados.cep;
        this.rua = dados.rua;
        this.complemento = dados.complemento ?? null;
        this.uf = dados.uf;
        this.estado = dados.estado;
        this.cidade = dados.cidade;
        this.bairro = dados.bairro;
        this.numero = dados.numero;
        this.latitude = dados.latitude ?? null;
        this.longitude = dados.longitude ?? null;
    }

    static criar(dados: IEndereco): Endereco {
        return new Endereco(dados);
    }

    static editar(dados: IEndereco): Endereco {
        return new Endereco(dados);
    }

    getIdEndereco(): number | undefined {
        return this.id_endereco;
    }

    getCep(): string {
        return this.cep;
    }

    getRua(): string {
        return this.rua;
    }

    getComplemento(): string | null {
        return this.complemento;
    }

    getUf(): string {
        return this.uf;
    }

    getEstado(): string {
        return this.estado;
    }

    getCidade(): string {
        return this.cidade;
    }

    getBairro(): string {
        return this.bairro;
    }

    getNumero(): string {
        return this.numero;
    }

    getLatitude(): number | null {
        return this.latitude;
    }

    getLongitude(): number | null {
        return this.longitude;
    }

    toJSON(): IEndereco {
        return {
            id_endereco: this.id_endereco,
            cep: this.cep,
            rua: this.rua,
            complemento: this.complemento,
            uf: this.uf,
            estado: this.estado,
            cidade: this.cidade,
            bairro: this.bairro,
            numero: this.numero,
            latitude: this.latitude,
            longitude: this.longitude
        };
    }
}
