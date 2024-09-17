/* eslint-disable import/prefer-default-export */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  descricao: string;

  @Column({ default: false })
  perecivel: boolean;
}
