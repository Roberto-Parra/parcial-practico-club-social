import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubEntity } from '../club/club.entity';
import { SocioEntity } from '../socio/socio.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { In } from 'typeorm';

@Injectable()
export class SocioClubService {
  constructor(
    @InjectRepository(SocioEntity)
    private readonly socioRepository: Repository<SocioEntity>,

    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,
  ) {}

  async addMemberToClub(socioId: string, clubId: string): Promise<ClubEntity> {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio) {
      throw new BusinessLogicException(
        'The socio with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club) {
      throw new BusinessLogicException(
        'The club with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }
    const isMember = club.socios.some((s) => s.id === socioId);
    if (isMember) {
      throw new BusinessLogicException(
        'The socio is already a member of the club',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    club.socios = [...club.socios, socio];
    return await this.clubRepository.save(club);
  }

  async findMembersFromClub(clubId: string): Promise<SocioEntity[]> {
    const club = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club) {
      throw new BusinessLogicException(
        'The club with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    return club.socios;
  }
  async findMemberFromClub(
    socioId: string,
    clubId: string,
  ): Promise<SocioEntity> {
    const club = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club) {
      throw new BusinessLogicException(
        'The club with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    const socio = club.socios.find((s) => s.id === socioId);
    if (!socio) {
      throw new BusinessLogicException(
        'The socio with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    return socio;
  }
  async updateMembersFromClub(
    clubId: string,
    sociosIds: string[],
  ): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club) {
      throw new BusinessLogicException(
        'The club with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    const updatedSocios = await this.socioRepository.findBy({
      id: In(sociosIds),
    });
    if (updatedSocios.length !== sociosIds.length) {
      const foundIds = new Set(updatedSocios.map((socio) => socio.id));
      const notFoundIds = sociosIds.filter((id) => !foundIds.has(id));
      throw new BusinessLogicException(
        `The following members were not found: ${notFoundIds.join(', ')}`,
        BusinessError.NOT_FOUND,
      );
    }
    club.socios = updatedSocios;
    return await this.clubRepository.save(club);
  }
  async deleteMemberFromClub(clubId: string, socioId: string) {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio) {
      throw new BusinessLogicException(
        'The member with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club) {
      throw new BusinessLogicException(
        'The club with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }

    const clubSocio: SocioEntity = club.socios.find((s) => s.id === socio.id);
    if (!clubSocio) {
      throw new BusinessLogicException(
        'The member with the given id is not associated with the club',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    club.socios = club.socios.filter((s) => s.id !== socioId);
    await this.clubRepository.save(club);
  }
}
