import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Produto } from "../entity/Produto";

export default class ProdutoController {
  async salvar(req: Request, res: Response) {
    const { descricao, perecivel } = req.body;
    const mensagensDeErro: string[] = [];

    if (!descricao || descricao.trim() === "") {
      mensagensDeErro.push("A propriedade descricao não pode ser vazia");
    }

    if (mensagensDeErro.length > 0) {
      return res
        .status(400)
        .json({ erro: "Um ou mais campos obrigatórios não foram enviados." });
    }

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const produto = new Produto();
      produto.descricao = descricao;
      produto.perecivel = perecivel;

      const produtoSalvo = await transactionalEntityManager.save(produto);

      return res.status(201).json({ produto: produtoSalvo });
    });
  }
}
