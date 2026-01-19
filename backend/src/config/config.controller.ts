import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { BasicAuthGuard } from '../auth/basic-auth.guard';

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

  @Get('student-links')
  getStudentLinks() {
    return this.configService.getStudentLinks();
  }

  @UseGuards(BasicAuthGuard)
  @Post('student-links')
  addStudentLink(@Body() data: { title: string; url: string; icon: string }) {
    return this.configService.addStudentLink(data);
  }

  @UseGuards(BasicAuthGuard)
  @Put('student-links/:id')
  updateStudentLink(@Param('id') id: string, @Body() data: Partial<{ title: string; url: string; icon: string }>) {
    return this.configService.updateStudentLink(id, data);
  }

  @UseGuards(BasicAuthGuard)
  @Delete('student-links/:id')
  removeStudentLink(@Param('id') id: string) {
    return this.configService.removeStudentLink(id);
  }
}
