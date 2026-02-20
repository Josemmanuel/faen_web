import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('api/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const users = this.usersService.findAll();
    // Retornar sin password hashes
    return users.map(({ password_hash, ...u }) => u);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = this.usersService.findOne(id);
    if (!user) {
      return { error: 'Usuario no encontrado' };
    }
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return await this.usersService.update(id, dto);
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
    return await this.usersService.assignPermission(id, dto.module, dto.permission);
  }

  @Get('roles')
  async getRoles() {
    return this.rolesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('roles')
  async createRole(@Body() dto: CreateRoleDto) {
    try {
      return await this.rolesService.create(dto);
    } catch (error) {
      return { error: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('roles/:id')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    try {
      return await this.rolesService.update(id, dto);
    } catch (error) {
      return { error: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string) {
    try {
      await this.rolesService.delete(id);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }
}
