export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  permissions: {
    [module: string]: PermissionLevel;
  };
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  default_permissions: {
    [module: string]: PermissionLevel;
  };
}

// Soporta valores en español (sistema actual) y en inglés (legacy)
export type PermissionLevel =
  | 'completo'
  | 'solo ver'
  | 'nada'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'none';
