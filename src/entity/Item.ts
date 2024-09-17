import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Produto } from "./Produto";

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantidade: number;

  @Column()
  dataChegadaNoEstoque: Date;

  @ManyToOne(() => Produto)
  produto: Produto;

}
