import {
  Controller,
  UseInterceptors,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
} from '@nestjs/common';
import { ClubService } from './club.service';
import { ClubDto } from './club.dto';
import { ClubEntity } from './club.entity';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';

@Controller('clubs')
@UseInterceptors(BusinessErrorsInterceptor)
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Get()
  async findAll(): Promise<ClubEntity[]> {
    return await this.clubService.findAll();
  }

  @Get(':clubId')
  async findOne(@Param('clubId') id: string): Promise<ClubEntity> {
    return await this.clubService.findOne(id);
  }

  @Post()
  async create(@Body() clubDto: ClubDto) {
    const club: ClubEntity = plainToInstance(ClubEntity, clubDto);
    return await this.clubService.create(club);
  }

  @Put(':clubId')
  async update(
    @Param('clubId') id: string,
    @Body() clubDto: ClubDto,
  ): Promise<ClubEntity> {
    const club = plainToInstance(ClubEntity, clubDto);
    return await this.clubService.update(id, club);
  }

  @Delete(':clubId')
  @HttpCode(204)
  async delete(@Param('clubId') id: string) {
    return await this.clubService.delete(id);
  }
}
