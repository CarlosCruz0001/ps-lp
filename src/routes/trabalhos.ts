import { Router } from "express";
import TrabalhoController from "../controllers/TrabalhoController";

const trabalhosRouter = Router();


const trabalhoCtrl = new TrabalhoController();


trabalhosRouter.post("/", (req, res) => trabalhoCtrl.salvar(req, res));


export default trabalhosRouter;