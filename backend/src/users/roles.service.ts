import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Role } from './interfaces';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RolesService {
  private getFilePath(): string {
    const projectRoot = (globalThis as any)['projectRoot'] || path.resolve(__dirname, '../../..');
    return path.resolve(projectRoot, 'data/roles.json');
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

  private getAllRoles(): Role[] {
    try {
      this.ensureFile();
      const raw = fs.readFileSync(this.getFilePath(), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error al leer roles:', err.message);
      throw err;
    }
  }

  private saveRoles(roles: Role[]) {
    try {
      this.ensureFile();
      fs.writeFileSync(this.getFilePath(), JSON.stringify(roles, null, 2));
    } catch (err) {
      console.error('Error al guardar roles:', err.message);
      throw err;
    }
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

  create(createRoleDto: CreateRoleDto): Role {
    const roles = this.getAllRoles();

    // Verificar que no exista un rol con el mismo nombre
    if (roles.some(r => r.name === createRoleDto.name)) {
      throw new Error(`El rol "${createRoleDto.name}" ya existe`);
    }

    const newRole: Role = {
      id: `role_${uuidv4()}`,
      name: createRoleDto.name,
      description: createRoleDto.description,
      default_permissions: createRoleDto.default_permissions || {
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

  update(id: string, updateRoleDto: UpdateRoleDto): Role {
    const roles = this.getAllRoles();
    const index = roles.findIndex(r => r.id === id);

    if (index === -1) {
      throw new Error(`El rol con id "${id}" no existe`);
    }

    const updatedRole = {
      ...roles[index],
      ...updateRoleDto,
    };

    roles[index] = updatedRole;
    this.saveRoles(roles);
    return updatedRole;
  }

  delete(id: string): boolean {
    const roles = this.getAllRoles();
    const index = roles.findIndex(r => r.id === id);

    if (index === -1) {
      throw new Error(`El rol con id "${id}" no existe`);
    }

    // Evitar eliminar roles especiales del sistema
    if (['admin', 'editor', 'moderador', 'viewer'].includes(roles[index].name)) {
      throw new Error(`No se puede eliminar el rol especial "${roles[index].name}"`);
    }

    roles.splice(index, 1);
    this.saveRoles(roles);
    return true;
  }
}
