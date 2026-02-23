import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

// Importación de DTOs de Roles
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

// Importación de DTOs de Usuarios (Asegúrate de que estos archivos existan en tu carpeta dto)
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  // ==========================================
  // RUTAS DE ROLES (Fijas primero)
  // ==========================================

  @Get('roles')
  async getRoles() {
    return this.rolesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('roles')
  async createRole(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('roles/:id')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string) {
    await this.rolesService.delete(id);
    return { success: true };
  }

  // ==========================================
  // RUTAS DE USUARIOS
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/permissions')
  async assignPermission(@Param('id') id: string, @Body() dto: AssignPermissionDto) {
    return this.usersService.assignPermission(id, dto.module, dto.permission);
  }
}