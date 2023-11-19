import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { SocioEntity } from '../socio/socio.entity';

@Entity()
export class ClubEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  foundationDate: Date;

  @Column()
  image: string;

  @Column({ length: 100 })
  description: string;

  // Relación con Socio
  @ManyToMany(() => SocioEntity, (socio) => socio.clubs)
  @JoinTable()
  socios: SocioEntity[];
}
