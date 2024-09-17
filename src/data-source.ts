/* eslint-disable import/prefer-default-export */
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Produto } from "./entity/Produto";
import { Item } from "./entity/Item";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "loja.db",
  synchronize: true,
  logging: true,
  entities: [Produto, Item],
  migrations: [],
  subscribers: [],
});
