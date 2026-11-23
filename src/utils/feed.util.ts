
interface FeedItem {
    id_artista: number;
    endereco_latitude?: number | string | null;
    endereco_longitude?: number | string | null;
}

function calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const raioTerra = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return 2 * raioTerra * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );
}

export function organizarFeed<T extends FeedItem>(
    publicacoes: T[],
    pagina: number = 1,
    latitudeUsuario?: number,
    longitudeUsuario?: number
) {
    const limite = 10;
    const paginaValida = Math.max(1, Math.floor(Number(pagina) || 1));

    const temLocalizacao =
        Number.isFinite(latitudeUsuario) &&
        Number.isFinite(longitudeUsuario);

    // Agrupar publicações por artista
    const grupos = new Map<number, {
        publicacoes: T[];
        distancia: number;
    }>();

    for (const publicacao of publicacoes) {
        const id = publicacao.id_artista;

        if (!grupos.has(id)) {
            grupos.set(id, {
                publicacoes: [],
                distancia: Infinity
            });
        }

        const grupo = grupos.get(id)!;

        grupo.publicacoes.push(publicacao);

        if (
            temLocalizacao &&
            publicacao.endereco_latitude != null &&
            publicacao.endereco_longitude != null
        ) {
            const lat = Number(publicacao.endereco_latitude);
            const lon = Number(publicacao.endereco_longitude);

            if (Number.isFinite(lat) && Number.isFinite(lon)) {
                const distancia = calcularDistancia(
                    latitudeUsuario!,
                    longitudeUsuario!,
                    lat,
                    lon
                );

                grupo.distancia = Math.min(
                    grupo.distancia,
                    distancia
                );
            }
        }
    }

    // Priorizar artistas mais próximos
    const artistas = Array.from(grupos.values());

    if (temLocalizacao) {
        artistas.sort((a, b) => a.distancia - b.distancia);
    }

    // Intercalar publicações dos artistas
    const feedOrganizado: T[] = [];

    const maiorQuantidade = Math.max(
        0,
        ...artistas.map(a => a.publicacoes.length)
    );

    for (let i = 0; i < maiorQuantidade; i++) {
        for (const artista of artistas) {
            const publicacao = artista.publicacoes[i];

            if (publicacao) {
                feedOrganizado.push(publicacao);
            }
        }
    }

    // Aplicar paginação após organizar o feed
    const inicio = (paginaValida - 1) * limite;
    const dados = feedOrganizado.slice(inicio, inicio + limite);

    return {
        dados,
        pagina: paginaValida,
        limite,
        total: feedOrganizado.length,
        temMais: inicio + limite < feedOrganizado.length
    };
}
