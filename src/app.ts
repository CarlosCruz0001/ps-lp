import express from "express";
import cors from "cors";
import logger from "morgan";

import produtosRouter from "./routes/produto";
import itensRouter from "./routes/item";
import { AppDataSource } from "./data-source";

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger("dev"));

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("Data source inicializado");

    app.use("/produtos", produtosRouter);
    app.use("/itens", itensRouter);

    app.listen(3000, () => {
      console.log("Servidor rodando na porta 3000");
    });
  } catch (erro) {
    console.error("Erro ao tentar inicializar o data source", erro);
  }
}

startServer();

export default app;
