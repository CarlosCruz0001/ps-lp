/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable node/no-unpublished-import */
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-import
import { defineConfig } from "cypress";
import { fakerPT_BR as faker } from "@faker-js/faker";

import { AppDataSource } from "./src/data-source";
import { Produto } from "./src/entity/Produto";
import { Item } from "./src/entity/Item";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3001",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {
      on("task", {
        async limparBancoDeDados() {
          await AppDataSource.initialize();
          const produtoRepo = AppDataSource.getRepository(Produto);
          const itemRepo = AppDataSource.getRepository(Item);

          let itens = await itemRepo.find();
          await itemRepo.remove(itens);
          itens = await itemRepo.find();
          console.log(itens);

          let produtos = await produtoRepo.find();
          await produtoRepo.remove(produtos);
          produtos = await produtoRepo.find();
          console.log(produtos);

          await AppDataSource.destroy();

          return null;
        },

        async popularBancoDeDadosProduto() {
          await AppDataSource.initialize();
          const produtoRepo = AppDataSource.getRepository(Produto);
          const QTDE_PRODUTOS = 10;

          const produtos: Produto[] = [];

          const categoriasDeProduto = [
            "Electronics",
            "Books",
            "Clothing",
            "Home & Kitchen",
            "Sports",
            "Toys",
          ];

          for (let i = 0; i < QTDE_PRODUTOS; i++) {
            const produto = new Produto();
            const categoriaAleatoria =
              categoriasDeProduto[
                Math.floor(Math.random() * categoriasDeProduto.length)
              ];
            const descricao = `${faker.commerce.productAdjective()} ${categoriaAleatoria} - ${faker.commerce.productMaterial()}`;
            produto.descricao = descricao;
            produto.perecivel = faker.datatype.boolean();

            const produtoSalvo = await produtoRepo.save(produto);
            produtos.push(produtoSalvo);
          }

          await AppDataSource.destroy();

          return produtos;
        },

        async popularBancoDeDadosItem() {
          await AppDataSource.initialize();
          const itemRepo = AppDataSource.getRepository(Item);
          const produtoRepo = AppDataSource.getRepository(Produto);
          const produtos = await produtoRepo.find();
          const QTDE_ITENS = 3;

          if (produtos.length === 0) {
            throw new Error(
              "Nenhum produto foi encontrado para popular os itens.",
            );
          }

          for (const produto of produtos) {
            for (let i = 0; i < QTDE_ITENS; i++) {
              const item = new Item();
              item.quantidade = faker.number.int({ min: 1, max: 100 });
              item.dataChegadaNoEstoque = faker.date.past();
              item.produto = produto;

              await itemRepo.save(item);
            }
          }

          await AppDataSource.destroy();

          return null;
        },
      });
    },
  },
});
