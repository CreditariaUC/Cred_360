import type { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  parent?: Profile | null;
};

export type UserRole = Profile['role'];