import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Autor } from "../entity/Autor";
import { Trabalho } from "../entity/Trabalho";
import TrabalhoDAO from "../daos/TrabalhoDAO";

export default class TrabalhoController {
  async salvar(req: Request, res: Response) {
    const { titulo, area, codigo, autores } = req.body;
    const mensagensDeErro: string[] = [];
    const areasValidas = ["CAE", "CET", "CBS", "CHCSA", "MDIS"];

    if (!titulo || typeof titulo !== "string" || titulo.trim() === "") {
      mensagensDeErro.push("O título do trabalho não pode ser vazio");
    }

    if (!area || typeof area !== "string" || !areasValidas.includes(area)) {
      mensagensDeErro.push("A área do trabalho deve ser uma dentre as opções: CAE, CET, CBS, CHCSA e MDIS.");
    }

    if (!codigo || typeof codigo !== "string") {
      mensagensDeErro.push("O código do trabalho deve ser composto pelo código da área seguido por 2 dígitos.");
    } else {
      const area = codigo.slice(0, -2);
      const digitos = codigo.slice(-2);

      if (!areasValidas.includes(area) || !/^\d{2}$/.test(digitos)) {
        mensagensDeErro.push("O código do trabalho deve ser composto pelo código da área seguido por 2 dígitos.");
      }
    }

    if (!autores || autores.length < 2 || autores.length > 7
    ) {
      mensagensDeErro.push("O trabalho deve conter entre 2 e 7 autores");
    } else {
      for (let i = 0; i < autores.length; i++) {
        const autor = autores[i]
        
        if (!autor.nome || typeof autor.nome !== "string" || autor.nome.split(" ").length < 2) {
          mensagensDeErro.push( "Os nomes dos autores devem conter nome e sobrenome.");
        }

        if (!autor.genero || (autor.genero !== "M" && autor.genero !== "F")) {
          mensagensDeErro.push("O gênero de cada autor deve ser uma dentre as opções M ou F.");
        }
        
        if (!autor.cpf || !/^\d{11}$/.test(autor.cpf)) {
          mensagensDeErro.push("O CPF de cada autor deve conter 11 dígitos e não possuir máscara.");
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

      return res.status(201).json({ trabalho: trabalhoSalvo });
    });
  }

  async buscarPorArea(req: Request, res: Response) {
    const { codArea } = req.params;
    const areasValidas = ["CAE", "CET", "CBS", "CHCSA", "MDIS"];
  
    console.log("Área requisitada:", codArea);
  
    
    if (!areasValidas.includes(codArea.toUpperCase())) {
      console.log("Área inválida detectada. Retornando array vazio.");
      return res.status(200).json({ trabalhos: [] });
    } else {
      
      try {
        const trabalhoDAO = new TrabalhoDAO();
        const trabalhosArray = await trabalhoDAO.buscarTrabalhos();
  
        console.log("Trabalhos encontrados:", trabalhosArray);
  
        
        const trabalhos = trabalhosArray.filter((trabalho: Trabalho) =>
          trabalho.area.trim().toUpperCase() === codArea.trim().toUpperCase()
        );
  
        console.log("Trabalhos filtrados:", trabalhos);
  
        return res.status(200).json({ trabalhos });
      } catch (error) {
        console.error("Erro ao buscar trabalhos por área:", error);
        return res.status(500).json({ mensagem: "Erro interno do servidor." });
      }
    }
  }
}