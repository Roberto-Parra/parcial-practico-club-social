import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubEntity } from './club.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,
  ) {}

  async findAll(): Promise<ClubEntity[]> {
    return await this.clubRepository.find({
      relations: ['socios'],
    });
  }
  async findOne(id: string): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id },
      relations: ['socios'],
    });
    if (!club) {
      throw new BusinessLogicException(
        'The club with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }
    return club;
  }
  async create(club: ClubEntity): Promise<ClubEntity> {
    if (club.description.length > 100) {
      throw new BusinessLogicException(
        'The description is too long',
        BusinessError.BAD_REQUEST,
      );
    }
    return await this.clubRepository.save(club);
  }

  async update(id: string, clubData: ClubEntity): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id },
    });
    if (!club) {
      throw new BusinessLogicException(
        'The club with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }
    if (clubData.description && clubData.description.length > 100) {
      throw new BusinessLogicException(
        'The description is too long',
        BusinessError.BAD_REQUEST,
      );
    }
    return await this.clubRepository.save({ ...club, ...clubData });
  }

  async delete(id: string) {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id },
    });
    if (!club) {
      throw new BusinessLogicException(
        'The club with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    }
    await this.clubRepository.remove(club);
  }
}
