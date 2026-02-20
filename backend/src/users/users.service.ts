import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { User } from './interfaces';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesService } from './roles.service';

@Injectable()
export class UsersService {
  constructor(private rolesService: RolesService) {}

  private getFilePath(): string {
    const projectRoot = (globalThis as any)['projectRoot'] || path.resolve(__dirname, '../../..');
    return path.resolve(projectRoot, 'data/users.json');
  }

  private ensureFile() {
    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify([]));
    }
  }

  findAll(): User[] {
    try {
      this.ensureFile();
      const raw = fs.readFileSync(this.getFilePath(), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error en findAll():', err.message);
      throw err;
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

    // Validar que el username sea único
    if (users.some(u => u.username === dto.username)) {
      throw new BadRequestException('El usuario ya existe');
    }

    // Validar que el email sea único
    if (users.some(u => u.email === dto.email)) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Obtener el rol (por defecto "viewer")
    const role = dto.role || 'viewer';
    const roleData = this.rolesService.findOne(role);
    if (!roleData) {
      throw new BadRequestException(`El rol "${role}" no existe`);
    }

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(dto.password, 10);

    // Crear el usuario
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

    // Retornar sin el hash de contraseña
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password_hash'>> {
    const users = this.findAll();
    const idx = users.findIndex(u => u.id === id);

    if (idx === -1) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se actualiza el email, validar que sea único
    if (dto.email && dto.email !== users[idx].email) {
      if (users.some(u => u.email === dto.email)) {
        throw new BadRequestException('El email ya está registrado');
      }
    }

    // Si se actualiza el rol, obtener los permisos por defecto del nuevo rol
    if (dto.role) {
      const roleData = this.rolesService.findOne(dto.role);
      if (!roleData) {
        throw new BadRequestException(`El rol "${dto.role}" no existe`);
      }
      users[idx].role = dto.role;
      users[idx].permissions = { ...roleData.default_permissions };
    }

    if (dto.email) {
      users[idx].email = dto.email;
    }

    if (dto.enabled !== undefined) {
      users[idx].enabled = dto.enabled;
    }

    users[idx].updated_at = new Date().toISOString();
    fs.writeFileSync(this.getFilePath(), JSON.stringify(users, null, 2));

    const { password_hash: _, ...userWithoutPassword } = users[idx];
    return userWithoutPassword;
  }

  async remove(id: string): Promise<boolean> {
    const users = this.findAll();
    const idx = users.findIndex(u => u.id === id);

    if (idx === -1) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // No permitir eliminar al admin principal
    if (users[idx].username === 'admin' && users[idx].role === 'admin') {
      throw new BadRequestException('No se puede eliminar al administrador principal');
    }

    users.splice(idx, 1);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(users, null, 2));
    return true;
  }

  async assignPermission(id: string, module: string, permission: 'create' | 'read' | 'update' | 'delete' | 'none'): Promise<Omit<User, 'password_hash'>> {
    const users = this.findAll();
    const idx = users.findIndex(u => u.id === id);

    if (idx === -1) {
      throw new NotFoundException('Usuario no encontrado');
    }

    users[idx].permissions[module] = permission;
    users[idx].updated_at = new Date().toISOString();
    fs.writeFileSync(this.getFilePath(), JSON.stringify(users, null, 2));

    const { password_hash: _, ...userWithoutPassword } = users[idx];
    return userWithoutPassword;
  }

  async validateCredentials(username: string, password: string): Promise<User | null> {
    const user = this.findByUsername(username);
    if (!user || !user.enabled) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
