import { Website } from './website';

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  provider: 'email' | 'google';
  resetToken?: string;
  websites: Website[];
  createdAt: Date;
  updatedAt: Date;
};
