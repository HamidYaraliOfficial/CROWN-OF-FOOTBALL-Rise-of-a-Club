import { Controller, Get } from '@nestjs/common';

@Controller('v1/game')
export class GameMetaController {
  @Get('meta')
  getMeta() {
    return { title: 'CROWN OF FOOTBALL', subtitle: 'Rise of a Club', version: '1.0.0', gameplayMode: 'single-player-local-first', multiplayer: 'future-ready-not-enabled', saveFormatVersion: 1, supportedLocales: ['fa', 'en', 'zh'], dataModel: 'fictional-clubs-and-players' };
  }
}
