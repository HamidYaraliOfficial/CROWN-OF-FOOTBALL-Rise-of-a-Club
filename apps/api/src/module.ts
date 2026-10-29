import { Module } from '@nestjs/common';
import { HealthController } from './routes/health.controller';
import { CareerController } from './routes/career.controller';
import { CareerService } from './services/career.service';
import { GameMetaController } from './routes/meta.controller';

@Module({ controllers: [HealthController, CareerController, GameMetaController], providers: [CareerService] })
export class ApiModule {}
