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
import { SocioClubService } from './socio-club.service';
import { SocioEntity } from '../socio/socio.entity';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';

@Controller('clubs')
@UseInterceptors(BusinessErrorsInterceptor)
export class SocioClubController {
  constructor(private readonly socioClubService: SocioClubService) {}

  @Post(':clubId/members/:socioId')
  async addMemberToClub(
    @Param('clubId') clubId: string,
    @Param('socioId') socioId: string,
  ) {
    return await this.socioClubService.addMemberToClub(socioId, clubId);
  }
  @Get(':clubId/members')
  async findMembersFromClub(
    @Param('clubId') clubId: string,
  ): Promise<SocioEntity[]> {
    return await this.socioClubService.findMembersFromClub(clubId);
  }

  @Get(':clubId/members/:socioId')
  async findMemberFromClub(
    @Param('clubId') clubId: string,
    @Param('socioId') socioId: string,
  ): Promise<SocioEntity> {
    return await this.socioClubService.findMemberFromClub(socioId, clubId);
  }

  @Put(':clubId/members')
  async updateMembersFromClub(
    @Param('clubId') clubId: string,
    @Body() sociosIds: string[],
  ) {
    return await this.socioClubService.updateMembersFromClub(clubId, sociosIds);
  }

  @Delete(':clubId/members/:socioId')
  @HttpCode(204)
  async deleteMemberFromClub(
    @Param('clubId') clubId: string,
    @Param('socioId') socioId: string,
  ) {
    return await this.socioClubService.deleteMemberFromClub(clubId, socioId);
  }
}
