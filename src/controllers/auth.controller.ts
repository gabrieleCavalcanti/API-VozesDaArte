import { Request, Response } from "express";

import { AuthService } from "../services/auth.service";
import { JwtService } from "../utils/JwtService";

export class AuthController {
  private authService = new AuthService();
  private jwtService = new JwtService();

  private cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  // CADASTRAR USUÁRIO
  //   register = async (req: Request, res: Response): Promise<void> => {
  //     try {
  //       const { nome, email, tipo, username, password } = req.body;

  //       const usuario = await this.authService.register(
  //         nome,
  //         email,
  //         tipo,
  //         username,
  //         password,
  //       );

  //       res.status(201).json({
  //         message: "Usuário cadastrado com sucesso.",
  //         usuario,
  //       });
  //     } catch (error) {
  //       res.status(400).json({
  //         message:
  //           error instanceof Error ? error.message : "Erro ao cadastrar usuário.",
  //       });
  //     }
  //   };

  // REALIZAR LOGIN
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      const usuario = await this.authService.login(username, password);
      if (usuario.id_autenticacao === undefined) {
        throw new Error("ID da autenticação não encontrado.");
      }

      const dadosToken = {
        id_autenticacao: usuario.id_autenticacao,
        username: usuario.username,
      };

      const accessToken = this.jwtService.gerarTokenAcesso(dadosToken);

      const refreshToken = this.jwtService.gerarRefreshToken(dadosToken);

      res.cookie("accessToken", accessToken, {
        ...this.cookieOptions,
        maxAge: 5 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        ...this.cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Login realizado com sucesso.",
        accessToken,
        refreshToken,
        usuario: {
          id_usuario: usuario.id_usuario,
          id_autenticacao: usuario.id_autenticacao,
          nome: usuario.nome,
          email: usuario.email,
          username: usuario.username,
          tipo: usuario.tipo,
        },
      });
    } catch (error) {
      res.status(401).json({
        message:
          error instanceof Error ? error.message : "Erro ao realizar login.",
      });
    }
  };

  // RENOVAR ACCESS TOKEN

  // RENOVAR ACCESS TOKEN
  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken || typeof refreshToken !== "string") {
        res.status(401).json({
          message: "Refresh token não fornecido.",
        });
        return;
      }

      const dadosToken = this.jwtService.verificarRefreshToken(refreshToken);

      const novoAccessToken = this.jwtService.gerarTokenAcesso(dadosToken);

      res.status(200).json({
        message: "Token renovado com sucesso.",
        accessToken: novoAccessToken,
      });
    } catch (error) {
      res.status(401).json({
        message: "Refresh token inválido ou expirado.",
      });
    }
  };

  me = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Usuário não autenticado",
        });
      }

      const user = await this.authService.findById(req.user.id_autenticacao);

      return res.status(200).json({
        message: "Usuário encontrado",
        user,
      });
    } catch (error: unknown) {
      console.error(error);

      return res.status(500).json({
        message: "Ocorreu um erro no servidor",
        errorMessage:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  };

  // REALIZAR LOGOUT
  logout = (req: Request, res: Response): void => {
    res.clearCookie("accessToken", this.cookieOptions);
    res.clearCookie("refreshToken", this.cookieOptions);

    res.status(200).json({
      message: "Logout realizado com sucesso.",
    });
  };
}
