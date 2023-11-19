import { Test, TestingModule } from '@nestjs/testing';
import { SocioClubService } from './socio-club.service';
import { faker } from '@faker-js/faker';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { SocioEntity } from '../socio/socio.entity';
import { ClubEntity } from '../club/club.entity';

describe('SocioClubService', () => {
  let service: SocioClubService;
  let socioRepository: Repository<SocioEntity>;
  let clubRepository: Repository<ClubEntity>;
  let listaClubes: ClubEntity[];
  let listaSocios: SocioEntity[];

  const seedDatabase = async (
    clubRepository: Repository<ClubEntity>,
    socioRepository: Repository<SocioEntity>,
  ) => {
    await socioRepository.clear();
    await clubRepository.clear();

    listaClubes = [];
    for (let i = 0; i < 5; i++) {
      const club: ClubEntity = await clubRepository.save({
        name: faker.company.name(),
        foundationDate: faker.date.past(),
        image: faker.image.url(),
        description: faker.lorem.sentence(),
      });
      listaClubes.push(club);
    }

    listaSocios = [];
    for (let i = 0; i < 5; i++) {
      const socio: SocioEntity = await socioRepository.save({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        birthdate: faker.date.past(),
        clubs: listaClubes,
      });
      listaSocios.push(socio);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SocioClubService],
    }).compile();

    service = module.get<SocioClubService>(SocioClubService);
    socioRepository = module.get<Repository<SocioEntity>>(
      getRepositoryToken(SocioEntity),
    );
    clubRepository = module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );

    await seedDatabase(clubRepository, socioRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a member to a club', async () => {
    const nuevoSocio: SocioEntity = await socioRepository.save({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.past(),
    });

    const nuevoClub: ClubEntity = await clubRepository.save({
      name: faker.company.name(),
      foundationDate: faker.date.past(),
      image: faker.image.url(),
      description: faker.lorem.sentence(),
    });

    const result: ClubEntity = await service.addMemberToClub(
      nuevoSocio.id,
      nuevoClub.id,
    );

    expect(result.socios.length).toBe(1);
    expect(result.socios[0]).not.toBeNull();
    expect(result.socios[0].username).toBe(nuevoSocio.username);
    expect(result.socios[0].email).toBe(nuevoSocio.email);
  });
  it('should throw an exception when the socio does not exist', async () => {
    await expect(service.addMemberToClub('0', '0')).rejects.toHaveProperty(
      'message',
      'The socio with the given id was not found',
    );
  });
  it('should throw an exception when the club does not exist', async () => {
    await expect(
      service.addMemberToClub(listaSocios[0].id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
  it('should throw an exception when the socio is already a member of the club', async () => {
    await expect(
      service.addMemberToClub(listaSocios[0].id, listaClubes[0].id),
    ).rejects.toHaveProperty(
      'message',
      'The socio is already a member of the club',
    );
  });
  it('should return all members from a club', async () => {
    const result: SocioEntity[] = await service.findMembersFromClub(
      listaClubes[0].id,
    );
    expect(result).not.toBeNull();
    expect(result).toHaveLength(5);
  });
  it('should throw an exception when the club does not exist', async () => {
    await expect(service.findMembersFromClub('0')).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
  it('should return a member from a club', async () => {
    const result: SocioEntity = await service.findMemberFromClub(
      listaSocios[0].id,
      listaClubes[0].id,
    );
    expect(result).not.toBeNull();
    expect(result.id).toEqual(listaSocios[0].id);
  });
  it('should throw an exception when the club does not exist', async () => {
    await expect(
      service.findMemberFromClub(listaSocios[0].id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
  it('should throw an exception when the socio does not exist', async () => {
    await expect(
      service.findMemberFromClub('0', listaClubes[0].id),
    ).rejects.toHaveProperty(
      'message',
      'The socio with the given id was not found',
    );
  });
  it('should update the club members successfully', async () => {
    const club = listaClubes[0];
    const newMemberIds = listaSocios.slice(0, 3).map((socio) => socio.id);

    const updatedClub = await service.updateMembersFromClub(
      club.id,
      newMemberIds,
    );

    expect(updatedClub.socios.length).toBe(3);
    expect(updatedClub.socios.map((s) => s.id)).toEqual(
      expect.arrayContaining(newMemberIds),
    );
  });
  it('should throw an exception if the club is not found', async () => {
    const newMemberIds = listaSocios.map((socio) => socio.id);

    await expect(
      service.updateMembersFromClub('0', newMemberIds),
    ).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
  it('should throw an exception if any member is not found', async () => {
    const club = listaClubes[0];
    const newMemberIds = [
      'invalid-socio-id',
      ...listaSocios.slice(1, 3).map((socio) => socio.id),
    ];

    await expect(
      service.updateMembersFromClub(club.id, newMemberIds),
    ).rejects.toHaveProperty(
      'message',
      'The following members were not found: invalid-socio-id',
    );
  });
  it('should successfully delete a member from a club', async () => {
    const club = listaClubes[0];
    const socio = listaSocios[0];

    await service.deleteMemberFromClub(club.id, socio.id);

    const updatedClub = await clubRepository.findOne({
      where: { id: club.id },
      relations: ['socios'],
    });

    expect(updatedClub.socios.find((s) => s.id === socio.id)).toBeUndefined();
  });
  it('should throw an exception if the member is not found', async () => {
    const club = listaClubes[0];

    await expect(
      service.deleteMemberFromClub(club.id, 'invalid-socio-id'),
    ).rejects.toHaveProperty(
      'message',
      'The member with the given id was not found',
    );
  });
  it('should throw an exception if the club is not found', async () => {
    const socio = listaSocios[0];

    await expect(
      service.deleteMemberFromClub('invalid-club-id', socio.id),
    ).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });
  it('should throw an exception if the member is not associated with the club', async () => {
    const newClub = await clubRepository.save({
      name: faker.company.name(),
      foundationDate: faker.date.past(),
      image: faker.image.url(),
      description: faker.lorem.sentence(),
    });

    const existingSocio = listaSocios[0];

    await expect(
      service.deleteMemberFromClub(newClub.id, existingSocio.id),
    ).rejects.toHaveProperty(
      'message',
      'The member with the given id is not associated with the club',
    );
  });
});
