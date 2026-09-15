
export enum ViewMode {
  CATALOG = 'CATALOG',
  MY_BOOKS = 'MY_BOOKS',
  PENALTIES = 'PENALTIES',
  BORROW_LOG = 'BORROW_LOG',
}

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  registerNumber?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  coverColor: string;
  status: 'AVAILABLE' | 'BORROWED';
  dueDate?: string;
  borrowDate?: string;
  image?: string;
  borrowedBy?: string;
  isbn?: string;
  // Transaction specific borrower info
  borrowerName?: string;
  borrowerPhoneNumber?: string;
  borrowerRegisterNumber?: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookImage?: string;
  bookCoverColor: string;
  borrowerName: string;
  borrowerPhoneNumber: string;
  borrowerRegisterNumber: string;
  borrowerEmail?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'BORROWED' | 'RETURNED';
}
