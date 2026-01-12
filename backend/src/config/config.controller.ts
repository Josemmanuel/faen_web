import { Controller, Get, Put, Body } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('api/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getConfig() {
    return this.configService.getConfig();
  }

  @Put()
  updateConfig(@Body() config: any) {
    return this.configService.updateConfig(config);
  }

  @Get('preinscripcion')
  getPreinscripcionConfig() {
    return this.configService.getPreinscripcionConfig();
  }

  @Put('preinscripcion')
  updatePreinscripcionConfig(@Body() data: { enabled: boolean; url: string }) {
    return this.configService.updatePreinscripcionConfig(data);
  }
}
