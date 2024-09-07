import express from "express";
import cors from "cors";
import logger from "morgan";

import trabalhosRouter from "./routes/trabalhos";
import { AppDataSource } from "./data-source";

AppDataSource.initialize()
  .then(() => console.log("Data source inicializado"))
  .catch((erro) =>
    console.error("Erro ao tentar inicializar o data source", erro),
  );

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger("dev"));

app.use("/trabalhos", trabalhosRouter);
app.get("/", (req, res) => res.send("Feciaq API"));

export default app;
