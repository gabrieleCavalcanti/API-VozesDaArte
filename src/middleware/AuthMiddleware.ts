
import { Request, Response, NextFunction } from "express";
import { JwtService } from "../utils/JwtService";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id_autenticacao: number;
                username: string;
            };
        }
    }
}

export class AuthMiddleware {

    private jwtService = new JwtService();

    authenticate = (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {

        // BUSCAR TOKEN NO HEADER
        const authHeader = req.headers.authorization;

        let token: string | undefined;

        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        // BUSCAR TOKEN NO COOKIE
        if (!token) {
            token = req.cookies?.accessToken;
        }

        if (!token) {
            res.status(401).json({
                message: "Token não fornecido."
            });
            return;
        }

        try {

            const decoded =
                this.jwtService.verificarTokenAcesso(token);

            req.user = {
                id_autenticacao: decoded.id_autenticacao,
                username: decoded.username
            };

            next();

        } catch (error) {

            res.status(401).json({
                message: "Token inválido ou expirado."
            });

        }
    };
}
