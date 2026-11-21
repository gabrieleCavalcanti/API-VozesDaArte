import { Request, Response } from "express";
import { UsuarioService } from "../services/usuario.service";
import { CadastroService } from "../services/cadastro.service";
import { AuthService } from "../services/auth.service";

// VALIDAR TEXTO
const validarTexto = (
  valor: unknown,
  minimo: number,
  maximo: number,
): boolean => {
  return (
    typeof valor === "string" &&
    valor.trim().length >= minimo &&
    valor.trim().length <= maximo
  );
};

// VALIDAR E-MAIL
const validarEmail = (email: unknown): boolean => {
  if (typeof email !== "string" || email.length > 254) {
    return false;
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

// VALIDAR USERNAME
const validarUsername = (username: unknown): boolean => {
  if (typeof username !== "string") {
    return false;
  }

  const regex = /^[a-zA-Z0-9._-]{3,30}$/;
  return regex.test(username.trim());
};

// VALIDAR CAMPO OPCIONAL
const validarCampoOpcional = (valor: unknown, maximo: number): boolean => {
  return (
    valor === undefined ||
    valor === null ||
    (typeof valor === "string" && valor.trim().length <= maximo)
  );
};

// VALIDAR ID OPCIONAL
const validarIdOpcional = (id: unknown): boolean => {
  return (
    id === undefined ||
    id === null ||
    (Number.isInteger(Number(id)) && Number(id) > 0)
  );
};

export class UsuarioController {
  private usuarioService = new UsuarioService();
  private cadastroService = new CadastroService();
  private authService = new AuthService();

  // BUSCAR USUÁRIO PELO ID
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_usuario = Number(req.params.id);

      if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
        res.status(400).json({
          message: "ID inválido.",
        });
        return;
      }

      const usuario = await this.usuarioService.findById(id_usuario);

      res.status(200).json(usuario);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao buscar usuário.";

      res
        .status(mensagem.includes("não encontrado") ? 404 : 500)
        .json({ message: mensagem });
    }
  };

  // BUSCAR USUÁRIO PELO E-MAIL
  findByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const email = req.query.email;

      if (!validarEmail(email)) {
        res.status(400).json({
          message: "Informe um e-mail válido.",
        });
        return;
      }

      const usuario = await this.usuarioService.findByEmail(
        (email as string).trim().toLowerCase(),
      );

      res.status(200).json(usuario);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao buscar usuário.";

      res
        .status(mensagem.includes("não encontrado") ? 404 : 500)
        .json({ message: mensagem });
    }
  };

  // LISTAR TODOS OS USUÁRIOS
  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarios = await this.usuarioService.findAll();

      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao listar usuários.",
      });
    }
  };

  // CADASTRAR USUÁRIO OU ARTISTA
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        nome,
        email,
        tipo,
        username,
        password,
        url_foto_capa,
        biografia,
        contato_profissional,
      } = req.body;

      // VALIDAR CAMPOS OBRIGATÓRIOS
      if (!nome || !email || !tipo || !username || !password) {
        res.status(400).json({
          message: "Preencha todos os campos obrigatórios.",
        });
        return;
      }

      // VALIDAR NOME
      if (!validarTexto(nome, 2, 100)) {
        res.status(400).json({
          message: "O nome deve possuir entre 2 e 100 caracteres.",
        });
        return;
      }

      // VALIDAR E-MAIL
      if (!validarEmail(email)) {
        res.status(400).json({
          message: "Informe um e-mail válido.",
        });
        return;
      }

      // VALIDAR TIPO
      if (!["USUARIO", "ARTISTA"].includes(tipo)) {
        res.status(400).json({
          message: "O tipo deve ser USUARIO ou ARTISTA.",
        });
        return;
      }

      // VALIDAR USERNAME
      if (!validarUsername(username)) {
        res.status(400).json({
          message:
            "O username deve possuir entre 3 e 30 caracteres e conter apenas letras, números, ponto, hífen ou underline.",
        });
        return;
      }

      // VALIDAR SENHA
      if (
        typeof password !== "string" ||
        password.length < 8 ||
        password.length > 72
      ) {
        res.status(400).json({
          message: "A senha deve possuir entre 8 e 72 caracteres.",
        });
        return;
      }

      // VALIDAR CAMPOS OPCIONAIS DO ARTISTA
      if (tipo === "ARTISTA") {
        if (!validarCampoOpcional(url_foto_capa, 500)) {
          res.status(400).json({
            message: "A URL da foto de capa deve possuir até 500 caracteres.",
          });
          return;
        }

        if (!validarCampoOpcional(biografia, 1000)) {
          res.status(400).json({
            message: "A biografia deve possuir até 1000 caracteres.",
          });
          return;
        }

        if (!validarCampoOpcional(contato_profissional, 150)) {
          res.status(400).json({
            message: "O contato profissional deve possuir até 150 caracteres.",
          });
          return;
        }
      }

      // REALIZAR CADASTRO
      const resultado = await this.cadastroService.create(
        nome.trim(),
        email.trim().toLowerCase(),
        tipo,
        username.trim(),
        password,
        url_foto_capa,
        biografia,
        contato_profissional,
      );

      res.status(201).json({
        message:
          tipo === "ARTISTA"
            ? "Artista cadastrado com sucesso."
            : "Usuário cadastrado com sucesso.",
        ...resultado,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao realizar cadastro.";

      const status =
        mensagem.includes("já está cadastrado") ||
        mensagem.includes("já está em uso")
          ? 409
          : mensagem.includes("obrigatórios") || mensagem.includes("inválido")
            ? 400
            : 500;

      res.status(status).json({
        message: mensagem,
      });
    }
  };

  // ATUALIZAR USUÁRIO
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_usuario = Number(req.params.id);

      if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
        res.status(400).json({
          message: "ID inválido. Informe um número inteiro positivo.",
        });
        return;
      }

      const { nome, email, url_foto_perfil, id_endereco } = req.body;

      // VALIDAR CAMPOS OBRIGATÓRIOS
      if (!nome || !email) {
        res.status(400).json({
          message: "Nome e e-mail são obrigatórios.",
        });
        return;
      }

      // VALIDAR NOME
      if (!validarTexto(nome, 2, 100)) {
        res.status(400).json({
          message: "O nome deve possuir entre 2 e 100 caracteres.",
        });
        return;
      }

      // VALIDAR E-MAIL
      if (!validarEmail(email)) {
        res.status(400).json({
          message: "Informe um e-mail válido.",
        });
        return;
      }

      // VALIDAR FOTO DE PERFIL
      if (!validarCampoOpcional(url_foto_perfil, 500)) {
        res.status(400).json({
          message: "A URL da foto de perfil deve possuir até 500 caracteres.",
        });
        return;
      }

      // VALIDAR ID DO ENDEREÇO
      if (!validarIdOpcional(id_endereco)) {
        res.status(400).json({
          message: "O ID do endereço deve ser um número inteiro positivo.",
        });
        return;
      }

      // REALIZAR ATUALIZAÇÃO
      const atualizado = await this.usuarioService.update(
        id_usuario,
        nome.trim(),
        email.trim().toLowerCase(),
        url_foto_perfil,
        id_endereco === undefined || id_endereco === null
          ? undefined
          : Number(id_endereco),
      );

      if (!atualizado) {
        res.status(400).json({
          message: "Não foi possível atualizar o usuário.",
        });
        return;
      }

      res.status(200).json({
        message: "Usuário atualizado com sucesso.",
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao atualizar usuário.";

      const status = mensagem.includes("não encontrado")
        ? 404
        : mensagem.includes("sendo utilizado")
          ? 409
          : 400;

      res.status(status).json({
        message: mensagem,
      });
    }
  };

  // ATUALIZAR FOTO DE PERFIL
atualizarFoto = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "Usuário não autenticado."
            });
            return;
        }

        if (!req.file) {
            res.status(400).json({
                message: "Envie uma imagem."
            });
            return;
        }

        // BUSCAR AUTENTICAÇÃO
        const autenticacao = await this.authService.findById(
            req.user.id_autenticacao
        );

        // ATUALIZAR FOTO UTILIZANDO ID DO USUÁRIO
        const atualizado = await this.usuarioService.updateFotoPerfil(
            autenticacao.id_usuario,
            req.file.filename
        );

        if (!atualizado) {
            res.status(404).json({
                message: "Usuário não encontrado."
            });
            return;
        }

        res.status(200).json({
            message: "Foto de perfil atualizada com sucesso.",
            foto: req.file.filename
        });

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao atualizar foto de perfil.";

        res.status(
            mensagem.includes("não encontrado") ? 404 : 500
        ).json({
            message: mensagem
        });
    }
};

  // EXCLUIR USUÁRIO
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_usuario = Number(req.params.id);

      if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
        res.status(400).json({
          message: "ID inválido.",
        });
        return;
      }

      const excluido = await this.usuarioService.delete(id_usuario);

      if (!excluido) {
        res.status(404).json({
          message: "Usuário não encontrado.",
        });
        return;
      }

      res.status(200).json({
        message: "Usuário excluído com sucesso.",
      });
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao excluir usuário.";

      const status = mensagem.includes("não encontrado") ? 404 : 500;

      res.status(status).json({
        message: mensagem,
      });
    }
  };
}
