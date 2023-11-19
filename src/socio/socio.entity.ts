import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { ClubEntity } from '../club/club.entity';

@Entity()
export class SocioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ type: 'date' })
  birthdate: Date;

  @ManyToMany(() => ClubEntity, (club) => club.socios)
  clubs: ClubEntity[];
}
