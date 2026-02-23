import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import { User } from './interfaces';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesService } from './roles.service';
import { DATA_DIR } from '../utils/paths';

@Injectable()
export class UsersService {
  constructor(private rolesService: RolesService) {}

  private getFilePath(): string {
    return join(DATA_DIR, 'users.json');
  }

  private ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }
  }

  findAll(): User[] {
    this.ensureFile();
    try {
      const raw = fs.readFileSync(this.getFilePath(), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      return [];
    }
  }

  findOne(id: string): User | undefined {
    return this.findAll().find(u => u.id === id);
  }

  findByUsername(username: string): User | undefined {
    return this.findAll().find(u => u.username === username);
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
    const users = this.findAll();

    if (users.some(u => u.username === dto.username)) {
      throw new BadRequestException('El usuario ya existe');
    }

    const role = dto.role || 'viewer';
    const roleData = this.rolesService.findOne(role);
    if (!roleData) {
      throw new BadRequestException(`El rol "${role}" no existe`);
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    const user: User = {
      id: Date.now().toString(),
      username: dto.username,
      email: dto.email,
      password_hash,
      role,
      permissions: { ...roleData.default_permissions },
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(user);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(users, null, 2));

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password_hash'>> {
    const users = this.findAll();
    const idx = users.findIndex(u => u.id === id);

    if (idx === -1) throw new NotFoundException('Usuario no encontrado');

    if (dto.role) {
      const roleData = this.rolesService.findOne(dto.role);
      if (roleData) {
        users[idx].role = dto.role;
        users[idx].permissions = { ...roleData.default_permissions };
      }
    }

    if (dto.email) users[idx].email = dto.email;
    if (dto.enabled !== undefined) users[idx].enabled = dto.enabled;

    users[idx].updated_at = new Date().toISOString();
    fs.writeFileSync(this.getFilePath(), JSON.stringify(users, null, 2));

    const { password_hash: _, ...userWithoutPassword } = users[idx];
    return userWithoutPassword;
  }

  async remove(id: string): Promise<boolean> {
    const users = this.findAll();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new NotFoundException('Usuario no encontrado');

    if (users[idx].username === 'admin') {
      throw new BadRequestException('No se puede eliminar al admin principal');
    }

    users.splice(idx, 1);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(users, null, 2));
    return true;
  }

  async validateCredentials(username: string, password: string): Promise<User | null> {
    const user = this.findByUsername(username);
    if (!user || !user.enabled) return null;
    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid ? user : null;
  }

  async assignPermission(id: string, module: string, permission: any): Promise<any> {
    const users = this.findAll();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new NotFoundException('Usuario no encontrado');

    users[idx].permissions[module] = permission;
    fs.writeFileSync(this.getFilePath(), JSON.stringify(users, null, 2));
    const { password_hash, ...u } = users[idx];
    return u;
  }
}