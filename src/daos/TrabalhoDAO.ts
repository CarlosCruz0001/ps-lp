/* eslint-disable prettier/prettier */
import { Repository } from "typeorm";
import { Trabalho } from "../entity/Trabalho";
import { AppDataSource } from "../data-source";

export default class TrabalhoDAO {
    trabalhoRepo: Repository<Trabalho>;

    constructor(){
        this.trabalhoRepo = AppDataSource.getRepository(Trabalho);
    }

    async salvar(trabalho:Partial<Trabalho>){
        const trabalhoSalvo = await this.trabalhoRepo.save(trabalho);
        return trabalhoSalvo
    }
}