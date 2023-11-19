import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocioModule } from './socio/socio.module';

@Module({
  imports: [SocioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
