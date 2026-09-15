import { Book, User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Rehman (Student)',
    email: 'rehman@athena.com',
    role: 'USER',
    phoneNumber: '+91 98765 43210',
    registerNumber: '1hm23cs001'
  },
  {
    id: 'u2',
    name: 'Afnan',
    email: 'afnan@athena.com',
    role: 'USER',
    phoneNumber: '+91 98765 12345',
    registerNumber: '1hm23cs042'
  }
];

export const INITIAL_BOOKS: Book[] = [];