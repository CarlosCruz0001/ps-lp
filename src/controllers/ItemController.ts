import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Produto } from "../entity/Produto";
import { Item } from "../entity/Item";

export default class ItemController {
  async salvar(req: Request, res: Response) {
    const { quantidade, dataChegadaNoEstoque, produtoId } = req.body;
    const mensagensDeErro: string[] = [];
    console.log("dataChegadaNoEstoque", dataChegadaNoEstoque);

    if (!quantidade || quantidade <= 0) {
      mensagensDeErro.push("A quantidade deve ser maior que zero.");
    }
    if (!produtoId) {
      mensagensDeErro.push("O produtoId é obrigatório.");
    }
    if (!dataChegadaNoEstoque || !this.isValidDate(dataChegadaNoEstoque)) {
      mensagensDeErro.push(
        "A data de chegada no estoque deve ser uma data válida.",
      );
    }
    if (mensagensDeErro.length > 0) {
      return res
        .status(400)
        .json({ erro: "Um ou mais campos obrigatórios não foram enviados." });
    }

    const produtoRepo = AppDataSource.getRepository(Produto);
    const produto = await produtoRepo.findOne({ where: { id: produtoId } });
    if (!produto) {
      return res.status(400).json({ erro: "Produto não encontrado." });
    }

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const item = new Item();
      item.quantidade = quantidade;
      item.dataChegadaNoEstoque = dataChegadaNoEstoque;
      item.produto = produto;

      const itemSalvo = await transactionalEntityManager.save(item);

      return res.status(201).json({ item: itemSalvo });
    });
  }

  //buscar produto/itens
  async buscarProduto(req: Request, res: Response) {
    const { produtoId } = req.params;
    console.log("produtoId:", produtoId);

    if (!produtoId) {
      return res
        .status(400)
        .json({ erro: "O ID do produto deve ser fornecido." });
    }

    try {
      const produtoRepo = AppDataSource.getRepository(Produto);
      const itemRepo = AppDataSource.getRepository(Item);

      const produto = await produtoRepo.findOneBy({ id: Number(produtoId) });
      if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado." });
      }

      const itens = await itemRepo.find({ where: { produto: produto } });

      return res.status(200).json({ itens });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar itens." });
    }
  }
  //função que valida a data
  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    return regex.test(dateString);
  }
}
