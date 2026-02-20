export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  permissions: {
    [module: string]: 'create' | 'read' | 'update' | 'delete' | 'none';
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
    [module: string]: 'create' | 'read' | 'update' | 'delete' | 'none';
  };
}

export type PermissionLevel = 'create' | 'read' | 'update' | 'delete' | 'none';
