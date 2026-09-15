
import React, { useState } from 'react';
import Catalog from './components/Catalog';
import Auth from './components/Auth';
import Penalties from './components/Penalties';
import BorrowedLog from './components/BorrowedLog';
import { ViewMode, Book, User, BorrowRecord } from './types';
import { BookIcon, UserIcon, LogOutIcon, AlertIcon, ClipboardIcon, AthenaLogo } from './components/Icons';
import { INITIAL_BOOKS } from './services/data';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<ViewMode>(ViewMode.CATALOG);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [borrowHistory, setBorrowHistory] = useState<BorrowRecord[]>([]);

  const handleBorrow = (id: string, details: { phoneNumber: string, registerNumber: string }) => {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 14);
    
    const dateString = dueDate.toISOString().split('T')[0];
    const borrowDateString = today.toISOString().split('T')[0];

    // Find the book to create the record
    const bookToBorrow = books.find(b => b.id === id);

    if (bookToBorrow) {
      // Create a new log entry
      const newRecord: BorrowRecord = {
        id: Math.random().toString(36).substr(2, 9),
        bookId: bookToBorrow.id,
        bookTitle: bookToBorrow.title,
        bookAuthor: bookToBorrow.author,
        bookImage: bookToBorrow.image,
        bookCoverColor: bookToBorrow.coverColor,
        borrowerName: user?.name || 'Unknown',
        borrowerPhoneNumber: details.phoneNumber,
        borrowerRegisterNumber: details.registerNumber,
        borrowerEmail: user?.email,
        borrowDate: borrowDateString,
        dueDate: dateString,
        status: 'BORROWED'
      };
      setBorrowHistory(prev => [newRecord, ...prev]);
    }

    // Update Book State
    setBooks(prev => prev.map(book => 
      book.id === id ? { 
        ...book, 
        status: 'BORROWED', 
        dueDate: dateString, 
        borrowDate: borrowDateString,
        borrowedBy: user?.id,
        borrowerName: user?.name,
        borrowerPhoneNumber: details.phoneNumber,
        borrowerRegisterNumber: details.registerNumber
      } : book
    ));
  };

  const handleReturn = (id: string) => {
    const todayString = new Date().toISOString().split('T')[0];

    // Update History Log
    setBorrowHistory(prev => prev.map(record => 
      (record.bookId === id && record.status === 'BORROWED') 
        ? { ...record, status: 'RETURNED', returnDate: todayString } 
        : record
    ));

    // Update Book State
    setBooks(prev => prev.map(book => 
      book.id === id ? { 
        ...book, 
        status: 'AVAILABLE', 
        dueDate: undefined, 
        borrowDate: undefined, 
        borrowedBy: undefined,
        borrowerName: undefined,
        borrowerPhoneNumber: undefined,
        borrowerRegisterNumber: undefined
      } : book
    ));
  };

  const handleAddBook = (bookData: Omit<Book, 'id' | 'status'>) => {
    const newBook: Book = {
      ...bookData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'AVAILABLE'
    };
    setBooks(prev => [newBook, ...prev]);
  };

  const handleEditBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(book =>
      book.id === updatedBook.id ? updatedBook : book
    ));
  };

  const handleDeleteBook = (id: string) => {
    // Remove the book from the catalog
    setBooks(prev => prev.filter(book => book.id !== id));
    // Also remove the history records for this book so it disappears from the Borrow Log
    setBorrowHistory(prev => prev.filter(record => record.bookId !== id));
  };

  const handleLogout = () => {
    setUser(null);
    setMode(ViewMode.CATALOG);
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const overdueCount = books.filter(b => {
      if (b.status !== 'BORROWED' || !b.dueDate) return false;
      const due = new Date(b.dueDate);
      due.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      return today > due;
  }).length;

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans overflow-hidden selection:bg-primary-500 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0 z-20 shadow-xl">
        <div className="p-8 flex items-center gap-3 justify-center lg:justify-start">
           {/* Logo Area */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
             <AthenaLogo className="w-5 h-5 text-white" />
          </div>
          <span className="hidden lg:block font-bold text-xl tracking-tight text-white">Athena</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2 px-6 mt-4">
          <p className="hidden lg:block text-xs font-bold text-slate-500 mb-2 px-3 uppercase tracking-wider">Menu</p>
          
          <button
            onClick={() => setMode(ViewMode.CATALOG)}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
              mode === ViewMode.CATALOG
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookIcon />
            <span className="hidden lg:block font-medium">Discover</span>
          </button>

          <button
            onClick={() => setMode(ViewMode.MY_BOOKS)}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
              mode === ViewMode.MY_BOOKS
                 ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserIcon />
            <span className="hidden lg:block font-medium">My Library</span>
            {books.filter(b => b.status === 'BORROWED' && b.borrowedBy === user.id).length > 0 && (
               <span className={`ml-auto text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                 mode === ViewMode.MY_BOOKS ? 'bg-white text-primary-600' : 'bg-slate-700 text-slate-300'
               }`}>
                 {books.filter(b => b.status === 'BORROWED' && b.borrowedBy === user.id).length}
               </span>
            )}
          </button>

          {/* Admin Only: Penalties & Log */}
          {user.role === 'ADMIN' && (
            <>
              <button
                onClick={() => setMode(ViewMode.PENALTIES)}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
                  mode === ViewMode.PENALTIES
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <AlertIcon />
                <span className="hidden lg:block font-medium">Penalties</span>
                {overdueCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {overdueCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMode(ViewMode.BORROW_LOG)}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
                  mode === ViewMode.BORROW_LOG
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ClipboardIcon />
                <span className="hidden lg:block font-medium">Borrow Log</span>
              </button>
            </>
          )}
        </nav>
        
        {/* User Profile in Sidebar Bottom */}
        <div className="p-6 border-t border-slate-800">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                {user.name.charAt(0).toUpperCase()}
             </div>
             <div className="hidden lg:block overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
             </div>
           </div>
           
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 p-2 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
           >
              <LogOutIcon />
              <span className="hidden lg:block font-medium text-sm">Log out</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-slate-900">
         {/* Mobile Header */}
         <header className="lg:hidden h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <AthenaLogo className="w-5 h-5 text-white" />
               </div>
               <span className="font-bold text-white text-xl">Athena</span>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
                 <LogOutIcon />
               </button>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto relative scroll-smooth p-0 lg:p-0">
            {mode === ViewMode.CATALOG && (
              <Catalog 
                books={books} 
                onBorrow={handleBorrow} 
                onReturn={handleReturn}
                user={user}
                onAddBook={handleAddBook}
                onEditBook={handleEditBook}
                onDeleteBook={handleDeleteBook}
              />
            )}
            
            {mode === ViewMode.MY_BOOKS && (
              <Catalog 
                books={books} 
                onBorrow={handleBorrow} 
                onReturn={handleReturn}
                onlyBorrowed={true}
                user={user}
                onAddBook={handleAddBook}
              />
            )}

            {mode === ViewMode.PENALTIES && (
              <Penalties 
                books={books}
                onResolve={handleReturn}
              />
            )}

            {mode === ViewMode.BORROW_LOG && (
              <BorrowedLog 
                history={borrowHistory}
                user={user}
                onDeleteBook={handleDeleteBook}
                onReturnBook={handleReturn}
              />
            )}
         </div>
      </main>
    </div>
  );
};

export default App;
