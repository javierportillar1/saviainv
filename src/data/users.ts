import { User } from '../types';

interface UserCredential extends User {
  password: string;
}

export const USERS: UserCredential[] = [
  { username: 'admin', password: '299381Be@', role: 'admin' },
  { username: 'employee', password: 'Savia123', role: 'employee' },
];

export function authenticate(username: string, password: string): User | null {
  const user = USERS.find(u => u.username === username && u.password === password);
  return user ? { username: user.username, role: user.role } : null;
}
