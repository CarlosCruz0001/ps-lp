import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Autor } from "../entity/Autor";
import { Trabalho } from "../entity/Trabalho";

export default class TrabalhoController {
  // Função auxiliar para validar a área
  private static validarArea(area: string | undefined): boolean {
    const areasValidas = ["CAE", "CET", "CBS", "CHCSA", "MDIS"];
    return typeof area === "string" && areasValidas.includes(area);
  }

  // Endpoint POST /trabalhos
  async salvar(req: Request, res: Response) {
    const { titulo, area, codigo, autores } = req.body;
    console.log({ titulo, area, codigo, autores });
    const mensagensDeErro: string[] = [];

    // Validação do título
    if (!titulo || typeof titulo !== "string" || titulo.trim() === "") {
      mensagensDeErro.push("O título do trabalho não pode ser vazio");
    }

    // Validação da área
    if (!TrabalhoController.validarArea(area)) {
      mensagensDeErro.push(
        "A área do trabalho deve ser uma dentre as opções: CAE, CET, CBS, CHCSA e MDIS.",
      );
    }

    // Validação do código
    const areasValidas = ["CAE", "CET", "CBS", "CHCSA", "MDIS"];

    if (!codigo || typeof codigo !== "string") {
      mensagensDeErro.push("O código do trabalho deve ser uma string.");
    } else {
      const areaCodigo = codigo.slice(0, -2); // Pega a parte da área (primeiros caracteres)
      const digitos = codigo.slice(-2); // Pega os dois últimos caracteres

      // Verifica se a área é válida e se os dois últimos são dígitos
      if (!areasValidas.includes(areaCodigo) || !/^\d{2}$/.test(digitos)) {
        mensagensDeErro.push(
          "O código do trabalho deve ser composto pelo código da área seguido por 2 dígitos.",
        );
      }
    }

    // Validação dos autores
    if (
      !autores ||
      !Array.isArray(autores) ||
      autores.length < 2 ||
      autores.length > 7
    ) {
      mensagensDeErro.push("O trabalho deve conter entre 2 e 7 autores");
    } else {
      for (const autor of autores) {
        if (
          !autor.nome ||
          typeof autor.nome !== "string" ||
          autor.nome.split(" ").length < 2
        ) {
          mensagensDeErro.push(
            "Os nomes dos autores devem conter nome e sobrenome.",
          );
        }
        if (!autor.genero || (autor.genero !== "M" && autor.genero !== "F")) {
          mensagensDeErro.push(
            "O gênero de cada autor deve ser uma dentre as opções M ou F.",
          );
        }
        if (!autor.cpf || !/^\d{11}$/.test(autor.cpf)) {
          mensagensDeErro.push(
            "O CPF de cada autor deve conter 11 dígitos e não possuir máscara.",
          );
        }
      }
    }

    if (mensagensDeErro.length > 0) {
      return res.status(400).json({ mensagensDeErro });
    }

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const autoresSalvos: Autor[] = [];

      for (let i = 0; i < autores.length; i++) {
        const autor = new Autor();
        Object.assign(autor, autores[i]);
        const autorSalvo = await transactionalEntityManager.save(autor);
        autoresSalvos.push(autorSalvo);
      }

      const trabalho = new Trabalho();
      trabalho.area = area;
      trabalho.codigo = codigo;
      trabalho.titulo = titulo;
      trabalho.autores = autoresSalvos;

      const trabalhoSalvo = await transactionalEntityManager.save(trabalho);

      // Retornar o status HTTP 201 após o trabalho ser salvo com sucesso
      return res.status(201).json({ trabalho: trabalhoSalvo });
    });
  }

  async getTrabalhosByArea(req: Request, res: Response) {
    const { codArea } = req.params;
    const areasValidas = ["CAE", "CET", "CBS", "CHCSA", "MDIS"];

    // Verifica se a área é válida
    if (!areasValidas.includes(codArea)) {
      return res.status(400).json({ mensagem: "Área inválida." });
    }

    try {
      // Obtém o repositório usando AppDataSource
      const trabalhoRepository = AppDataSource.getRepository(Trabalho);
      const trabalhos = await trabalhoRepository.find({ where: { area: codArea } });

      if (trabalhos.length === 0) {
        return res.status(200).json({ trabalhos: [] });
      }

      return res.status(200).json({ trabalhos });
    } catch (error) {
      console.error("Erro ao buscar trabalhos:", error);
      return res.status(500).json({ mensagem: "Erro ao buscar trabalhos.", error });
    }
  }
  
}
