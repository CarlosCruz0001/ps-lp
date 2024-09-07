/* eslint-disable prettier/prettier */
import { Repository } from "typeorm";
import { Autor } from "../entity/Autor";
import { AppDataSource } from "../data-source";

export default class AutorDAO {
    autorRepo: Repository<Autor>;

    constructor(){
        this.autorRepo= AppDataSource.getMongoRepository(Autor);
    }

    async salvar(autor:Partial<Autor>){
        const autorSalvo = await this.autorRepo.save(autor);
        return autorSalvo
    }
}