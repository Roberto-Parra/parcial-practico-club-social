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
import { SocioService } from './socio.service';
import { SocioDto } from './socio.dto';
import { SocioEntity } from './socio.entity';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';

@Controller('members')
@UseInterceptors(BusinessErrorsInterceptor)
export class SocioController {
  constructor(private readonly socioService: SocioService) {}

  @Get()
  async findAll(): Promise<SocioEntity[]> {
    return await this.socioService.findAll();
  }

  @Get(':socioId')
  async findOne(@Param('socioId') id: string): Promise<SocioEntity> {
    return await this.socioService.findOne(id);
  }

  @Post()
  async create(@Body() socioDto: SocioDto) {
    const socio: SocioEntity = plainToInstance(SocioEntity, socioDto);
    return await this.socioService.create(socio);
  }

  @Put(':socioId')
  async update(
    @Param('socioId') id: string,
    @Body() socioDto: SocioDto,
  ): Promise<SocioEntity> {
    const socio = plainToInstance(SocioEntity, socioDto);
    return await this.socioService.update(id, socio);
  }

  @Delete(':socioId')
  @HttpCode(204)
  async delete(@Param('socioId') id: string) {
    return await this.socioService.delete(id);
  }
}
