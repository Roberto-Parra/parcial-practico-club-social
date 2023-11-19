import { Module } from '@nestjs/common';
import { SocioClubService } from './socio-club.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubEntity } from '../club/club.entity';
import { SocioEntity } from '../socio/socio.entity';
import { SocioClubController } from './socio-club.controller';

@Module({
  providers: [SocioClubService],
  imports: [TypeOrmModule.forFeature([ClubEntity, SocioEntity])],
  controllers: [SocioClubController],
})
export class SocioClubModule {}
