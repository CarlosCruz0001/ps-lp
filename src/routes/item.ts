import { Router } from "express";
import ItemController from "../controllers/ItemController";

const itensRouter = Router();

const itemCtrl = new ItemController();

console.log("entrou itensRounter");

itensRouter.post("/", (req, res) => itemCtrl.salvar(req, res));

itensRouter.get("/produto/:produtoId", (req, res) =>
  itemCtrl.buscarProduto(req, res),
);

export default itensRouter;
