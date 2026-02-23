import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { Role } from './interfaces';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { v4 as uuidv4 } from 'uuid';
import { DATA_DIR } from '../utils/paths'; // Usamos la constante centralizada

@Injectable()
export class RolesService {
  
  // 1. Ruta limpia al JSON usando DATA_DIR
  private getFilePath(): string {
    return join(DATA_DIR, 'roles.json');
  }

  // 2. Asegura que la carpeta y el archivo existan
  private ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  }

  // 3. Lectura de datos
  private getAllRoles(): Role[] {
    this.ensureFile();
    try {
      const raw = fs.readFileSync(this.getFilePath(), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error al leer roles:', err.message);
      return [];
    }
  }

  // 4. Escritura de datos
  private saveRoles(roles: Role[]) {
    fs.writeFileSync(this.getFilePath(), JSON.stringify(roles, null, 2));
  }

  findAll(): Role[] {
    return this.getAllRoles();
  }

  findOne(name: string): Role | undefined {
    return this.findAll().find(r => r.name === name);
  }

  findById(id: string): Role | undefined {
    return this.findAll().find(r => r.id === id);
  }

  create(dto: CreateRoleDto): Role {
    const roles = this.getAllRoles();

    if (roles.some(r => r.name === dto.name)) {
      throw new BadRequestException(`El rol "${dto.name}" ya existe`);
    }

    const newRole: Role = {
      id: `role_${uuidv4()}`,
      name: dto.name,
      description: dto.description,
      default_permissions: dto.default_permissions || {
        noticias: 'none',
        autoridades: 'none',
        carreras: 'none',
        documentos: 'none',
        galeria: 'none',
        mensajes: 'none',
        config: 'none',
        usuarios: 'none',
      },
    };

    roles.push(newRole);
    this.saveRoles(roles);
    return newRole;
  }

  update(id: string, dto: UpdateRoleDto): Role {
    const roles = this.getAllRoles();
    const index = roles.findIndex(r => r.id === id);

    if (index === -1) {
      throw new NotFoundException(`El rol con id "${id}" no existe`);
    }

    const updatedRole = {
      ...roles[index],
      ...dto,
    };

    roles[index] = updatedRole;
    this.saveRoles(roles);
    return updatedRole;
  }

  delete(id: string): boolean {
    const roles = this.getAllRoles();
    const index = roles.findIndex(r => r.id === id);

    if (index === -1) {
      throw new NotFoundException(`El rol con id "${id}" no existe`);
    }

    // Seguridad: Evitar eliminar roles vitales del sistema
    const protectedRoles = ['admin', 'editor', 'moderador', 'viewer'];
    if (protectedRoles.includes(roles[index].name)) {
      throw new BadRequestException(`No se puede eliminar el rol especial "${roles[index].name}"`);
    }

    roles.splice(index, 1);
    this.saveRoles(roles);
    return true;
  }
}