import { Router } from "express";
import ProdutoController from "../controllers/ProdutoController";

const produtosRouter = Router();

const produtoCtrl = new ProdutoController();

produtosRouter.post("/", (req, res) => produtoCtrl.salvar(req, res));

export default produtosRouter;
