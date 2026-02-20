import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

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

  @UseGuards(JwtAuthGuard)
  @Post('student-links')
  addStudentLink(@Body() data: { title: string; url: string; icon: string }) {
    return this.configService.addStudentLink(data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('student-links/:id')
  updateStudentLink(@Param('id') id: string, @Body() data: Partial<{ title: string; url: string; icon: string }>) {
    return this.configService.updateStudentLink(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('student-links/:id')
  removeStudentLink(@Param('id') id: string) {
    return this.configService.removeStudentLink(id);
  }

  @Get('claustros')
  getClaustros() {
    return this.configService.getClaustros();
  }

  @Get('claustros/:id')
  getClaustroById(@Param('id') id: string) {
    return this.configService.getClaustroById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('claustros/:id/links')
  addLinkToClaustro(@Param('id') claustroId: string, @Body() data: { title: string; url: string; icon: string }) {
    return this.configService.addLinkToClaustro(claustroId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('claustros/:id/links/:linkId')
  updateClaustroLink(
    @Param('id') claustroId: string,
    @Param('linkId') linkId: string,
    @Body() data: Partial<{ title: string; url: string; icon: string }>
  ) {
    return this.configService.updateClaustroLink(claustroId, linkId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('claustros/:id/links/:linkId')
  removeLinkFromClaustro(@Param('id') claustroId: string, @Param('linkId') linkId: string) {
    return this.configService.removeLinkFromClaustro(claustroId, linkId);
  }
}
