import { Test, TestingModule } from '@nestjs/testing';
import { ClubService } from './club.service';
import { faker } from '@faker-js/faker';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ClubEntity } from './club.entity';

describe('ClubService', () => {
  let service: ClubService;
  let repository: Repository<ClubEntity>;
  let clubsList;

  const seedDatabase = async () => {
    await repository.clear();
    clubsList = [];

    for (let i = 0; i < 5; i++) {
      const club: ClubEntity = await repository.save({
        name: faker.company.name(),
        foundationDate: faker.date.past(),
        image: faker.image.url(),
        description: faker.lorem.words(10),
      });
      clubsList.push(club);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubService],
    }).compile();

    service = module.get<ClubService>(ClubService);
    repository = module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should return all clubs', async () => {
    const clubs: ClubEntity[] = await service.findAll();
    expect(clubs).not.toBeNull();
    expect(clubs).toHaveLength(clubsList.length);
  });
  it('should return a club by id', async () => {
    const club: ClubEntity = await service.findOne(clubsList[0].id);
    expect(club).not.toBeNull();
    expect(club.id).toEqual(clubsList[0].id);
  });
  it('should throw an exception when the club does not exist', async () => {
    await expect(service.findOne('0')).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
  it('should create a club', async () => {
    const club: ClubEntity = await service.create({
      id: '',
      name: faker.company.name(),
      foundationDate: faker.date.past(),
      image: faker.image.url(),
      description: faker.lorem.words(10),
      socios: [],
    });
    expect(club).not.toBeNull();
    expect(club.id).not.toBeNull();
  });
  it('should create a club with a description of 100 characters', async () => {
    const clubData = {
      id: '',
      name: faker.company.name(),
      foundationDate: faker.date.past(),
      image: faker.image.url(),
      description: faker.lorem.words(101),
      socios: [],
    };
    await expect(service.create(clubData)).rejects.toHaveProperty(
      'message',
      'The description is too long',
    );
  });
  it('should update a club', async () => {
    const club: ClubEntity = clubsList[0];
    club.name = faker.company.name();

    const updatedClub = await service.update(club.id, club);
    expect(updatedClub).not.toBeNull();
    expect(updatedClub.id).toEqual(clubsList[0].id);
    expect(updatedClub.name).toEqual(club.name);
    expect(updatedClub.foundationDate).toEqual(club.foundationDate);
  });
  it('should update a club with a description of 100 characters', async () => {
    const club: ClubEntity = clubsList[0];
    club.description = faker.lorem.words(101);

    await expect(service.update(club.id, club)).rejects.toHaveProperty(
      'message',
      'The description is too long',
    );
  });
  it('should throw an exception when the club does not exist', async () => {
    const club: ClubEntity = clubsList[0];
    club.id = '0';

    await expect(service.update(club.id, club)).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
  it('should delete a club', async () => {
    const club: ClubEntity = clubsList[0];
    await service.delete(club.id);

    const deletedClub = await repository.findOne({ where: { id: club.id } });
    expect(deletedClub).toBeNull();
  });

  it('delete should throw an exception for an invalid club', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
});
