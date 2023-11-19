import { Test, TestingModule } from '@nestjs/testing';
import { SocioService } from './socio.service';
import { faker } from '@faker-js/faker';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { SocioEntity } from './socio.entity';

describe('SocioService', () => {
  let service: SocioService;
  let repository: Repository<SocioEntity>;
  let sociosList;

  const seedDatabase = async () => {
    await repository.clear();
    sociosList = [];

    for (let i = 0; i < 5; i++) {
      const socio: SocioEntity = await repository.save({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        birthdate: faker.date.past(),
      });
      sociosList.push(socio);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SocioService],
    }).compile();

    service = module.get<SocioService>(SocioService);
    repository = module.get<Repository<SocioEntity>>(
      getRepositoryToken(SocioEntity),
    );

    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all socios', async () => {
    const socios: SocioEntity[] = await service.findAll();
    expect(socios).not.toBeNull();
    expect(socios).toHaveLength(sociosList.length);
  });
  it('should return a socio by id', async () => {
    const socio: SocioEntity = await service.findOne(sociosList[0].id);
    expect(socio).not.toBeNull();
    expect(socio.id).toEqual(sociosList[0].id);
  });
  it('should throw an exception when the socio does not exist', async () => {
    await expect(service.findOne('0')).rejects.toHaveProperty(
      'message',
      'The socio with the given id was not found',
    );
  });

  it('should create a socio', async () => {
    const socioData = {
      id: '',
      username: faker.internet.userName(),
      email: faker.internet.email(),
      birthdate: faker.date.past(),
      clubs: [],
    };
    const newSocio = await service.create(socioData);

    expect(newSocio).not.toBeNull();
    expect(newSocio.id).toBeDefined();
    expect(newSocio.username).toEqual(socioData.username);
    expect(newSocio.email).toEqual(socioData.email);
  });
  it('should throw an exception when the email is invalid', async () => {
    const socioData = {
      id: '',
      username: faker.internet.userName(),
      email: 'invalid',
      birthdate: faker.date.past(),
      clubs: [],
    };
    await expect(service.create(socioData)).rejects.toHaveProperty(
      'message',
      'email must be an email',
    );
  });
  it('should update a socio', async () => {
    const socio: SocioEntity = sociosList[0];
    socio.username = faker.internet.userName();

    const updatedSocio = await service.update(socio.id, socio);

    expect(updatedSocio).not.toBeNull();
    expect(updatedSocio.id).toEqual(sociosList[0].id);
    expect(updatedSocio.username).toEqual(socio.username);
    expect(updatedSocio.email).toEqual(socio.email);
  });
  it('should throw an exception when the socio does not exist', async () => {
    const socio: SocioEntity = sociosList[0];
    socio.id = '0';

    await expect(service.update(socio.id, socio)).rejects.toHaveProperty(
      'message',
      'The socio with the given id was not found',
    );
  });
  it('should delete a socio', async () => {
    const socio: SocioEntity = sociosList[0];
    await service.delete(socio.id);
    const deletedSocio: SocioEntity = await repository.findOne({
      where: { id: socio.id },
    });
    expect(deletedSocio).toBeNull();
  });
  it('delete should throw an exception for an invalid socio', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'The socio with the given id was not found',
    );
  });
});
