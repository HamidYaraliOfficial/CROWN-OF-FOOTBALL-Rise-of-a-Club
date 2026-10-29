import { Controller, Get } from '@nestjs/common';

@Controller('v1/health')
export class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok', service: 'crown-of-football-api', version: '1.0.0', storage: 'in-memory-development-adapter', timestamp: new Date().toISOString() };
  }
}
