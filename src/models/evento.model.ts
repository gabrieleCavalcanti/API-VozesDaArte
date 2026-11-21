
export interface IEvento {
    id_evento?: number;
    titulo: string;
    data_hora: Date | string;
    valor: number;
    descricao: string;
    destaque?: boolean;
    arquivado?: boolean;
    url_img?: string | null;
    id_artista: number;
    id_endereco: number;
}

export class Evento {

    private id_evento?: number;
    private titulo: string;
    private data_hora: Date | string;
    private valor: number;
    private descricao: string;
    private destaque: boolean;
    private arquivado: boolean;
    private url_img: string | null;
    private id_artista: number;
    private id_endereco: number;

    constructor(dados: IEvento) {
        this.id_evento = dados.id_evento;
        this.titulo = dados.titulo;
        this.data_hora = dados.data_hora;
        this.valor = dados.valor;
        this.descricao = dados.descricao;
        this.destaque = dados.destaque ?? false;
        this.arquivado = dados.arquivado ?? false;
        this.url_img = dados.url_img ?? null;
        this.id_artista = dados.id_artista;
        this.id_endereco = dados.id_endereco;
    }

    // CRIAR EVENTO
    static criar(dados: IEvento): Evento {
        return new Evento(dados);
    }

    // EDITAR EVENTO
    static editar(dados: IEvento): Evento {
        return new Evento(dados);
    }

    // GETTERS
    getIdEvento(): number | undefined {
        return this.id_evento;
    }

    getTitulo(): string {
        return this.titulo;
    }

    getDataHora(): Date | string {
        return this.data_hora;
    }

    getValor(): number {
        return this.valor;
    }

    getDescricao(): string {
        return this.descricao;
    }

    getDestaque(): boolean {
        return this.destaque;
    }

    getArquivado(): boolean {
        return this.arquivado;
    }

    getUrlImg(): string | null {
        return this.url_img;
    }

    getIdArtista(): number {
        return this.id_artista;
    }

    getIdEndereco(): number {
        return this.id_endereco;
    }

    // SETTERS
    setTitulo(titulo: string): void {
        this.titulo = titulo;
    }

    setDataHora(data_hora: Date | string): void {
        this.data_hora = data_hora;
    }

    setValor(valor: number): void {
        this.valor = valor;
    }

    setDescricao(descricao: string): void {
        this.descricao = descricao;
    }

    setDestaque(destaque: boolean): void {
        this.destaque = destaque;
    }

    setArquivado(arquivado: boolean): void {
        this.arquivado = arquivado;
    }

    setUrlImg(url_img: string | null): void {
        this.url_img = url_img;
    }

    // CONVERTER PARA JSON
    toJSON(): IEvento {
        return {
            id_evento: this.id_evento,
            titulo: this.titulo,
            data_hora: this.data_hora,
            valor: this.valor,
            descricao: this.descricao,
            destaque: this.destaque,
            arquivado: this.arquivado,
            url_img: this.url_img,
            id_artista: this.id_artista,
            id_endereco: this.id_endereco
        };
    }
}
