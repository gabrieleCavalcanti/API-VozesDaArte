
import jwt, { SignOptions } from "jsonwebtoken";
import "dotenv/config";

export interface JwtDados {
    id_autenticacao: number;
    username: string;
}

export class JwtService {

    private readonly secret: string;
    private readonly expiresIn: SignOptions["expiresIn"];

    private readonly refreshSecret: string;
    private readonly refreshExpiresIn: SignOptions["expiresIn"];

    constructor() {

        if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
            throw new Error("JWT secrets não configurados no .env.");
        }

        this.secret = process.env.JWT_SECRET;
        this.expiresIn =
            (process.env.JWT_EXPIRES_IN || "5m") as SignOptions["expiresIn"];

        this.refreshSecret = process.env.JWT_REFRESH_SECRET;
        this.refreshExpiresIn =
            (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
    }

    // ACCESS TOKEN
    gerarTokenAcesso(dados: JwtDados): string {
        return jwt.sign(
            dados,
            this.secret,
            {
                expiresIn: this.expiresIn
            }
        );
    }

    verificarTokenAcesso(token: string): JwtDados {

        const decoded = jwt.verify(token, this.secret);

        if (
            typeof decoded === "string" ||
            typeof decoded.id_autenticacao !== "number" ||
            typeof decoded.username !== "string"
        ) {
            throw new Error("Payload do token inválido.");
        }

        return {
            id_autenticacao: decoded.id_autenticacao,
            username: decoded.username
        };
    }

    // REFRESH TOKEN
    gerarRefreshToken(dados: JwtDados): string {
        return jwt.sign(
            dados,
            this.refreshSecret,
            {
                expiresIn: this.refreshExpiresIn
            }
        );
    }

    verificarRefreshToken(token: string): JwtDados {

        const decoded = jwt.verify(token, this.refreshSecret);

        if (
            typeof decoded === "string" ||
            typeof decoded.id_autenticacao !== "number" ||
            typeof decoded.username !== "string"
        ) {
            throw new Error("Payload do refresh token inválido.");
        }

        return {
            id_autenticacao: decoded.id_autenticacao,
            username: decoded.username
        };
    }

    // DECODIFICAR TOKEN
    decodificarToken(token: string): JwtDados | null {

        const decoded = jwt.decode(token);

        if (
            !decoded ||
            typeof decoded === "string" ||
            typeof decoded.id_autenticacao !== "number" ||
            typeof decoded.username !== "string"
        ) {
            return null;
        }

        return {
            id_autenticacao: decoded.id_autenticacao,
            username: decoded.username
        };
    }
}
