import React, { useState, useMemo } from 'react';
import { Book, User } from '../types';
import { SearchIcon, BookIcon, CalendarIcon, PlusIcon, XIcon, EditIcon, TrashIcon, UserIcon } from './Icons';

interface CatalogProps {
  books: Book[];
  onBorrow: (id: string, details: { phoneNumber: string, registerNumber: string }) => void;
  onReturn: (id: string) => void;
  onlyBorrowed?: boolean;
  user?: User;
  onAddBook?: (book: Omit<Book, 'id' | 'status'>) => void;
  onEditBook?: (book: Book) => void;
  onDeleteBook?: (id: string) => void;
}

// Internal component to handle individual book state
const BookCard: React.FC<{ 
  book: Book; 
  onBorrowClick: (book: Book) => void; 
  onReturn: (id: string) => void; 
  onlyBorrowed: boolean;
  user?: User;
  onEdit?: (book: Book) => void;
  onDelete?: (id: string) => void;
}> = ({ book, onBorrowClick, onReturn, onlyBorrowed, user, onEdit, onDelete }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group bg-slate-800 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 flex flex-col h-full relative border border-slate-700 shadow-lg">
      
      {/* Cover Image - Aspect Ratio 2:3 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900 p-4">
         {/* Simulated book shadow for realism */}
         <div className="w-full h-full shadow-[5px_0_15px_rgba(0,0,0,0.5)] rounded-r-md overflow-hidden relative transform transition-transform duration-500 group-hover:-translate-y-1">
            {book.image && !imgError ? (
            <img 
                src={book.image} 
                alt={book.title} 
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
                loading="lazy"
            />
            ) : (
            <div className={`w-full h-full bg-gradient-to-br ${book.coverColor} flex items-center justify-center text-white/50`}>
                <BookIcon />
            </div>
            )}
         </div>

         {/* Status Badge */}
         <div className="absolute top-2 right-2 z-10">
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-md ${
                book.status === 'AVAILABLE' 
                ? 'bg-emerald-500/90 text-white' 
                : 'bg-amber-500/90 text-white'
            }`}>
                {book.status}
            </span>
         </div>

         {/* Admin Action Buttons */}
         {user?.role === 'ADMIN' && onEdit && onDelete && !onlyBorrowed && (
           <div className="absolute top-2 left-2 flex flex-col gap-2 z-20">
             <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(book); }}
                className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-300 rounded-full hover:bg-primary-600 hover:text-white transition-all shadow-md border border-slate-700"
                title="Edit Book"
             >
               <EditIcon />
             </button>
             <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete && onDelete(book.id); }}
                className="w-8 h-8 flex items-center justify-center bg-slate-800 text-red-400 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-md border border-slate-700"
                title="Delete Book"
             >
               <TrashIcon />
             </button>
           </div>
         )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-100 leading-tight mb-1 line-clamp-1" title={book.title}>{book.title}</h3>
        <p className="text-slate-400 text-xs mb-3 truncate">{book.author}</p>
        
        <div className="mt-auto flex flex-col gap-2">
          {book.status === 'AVAILABLE' ? (
             <button 
               onClick={() => onBorrowClick(book)}
               className="w-full py-2 bg-slate-200 hover:bg-white text-slate-900 rounded-lg transition-colors text-xs font-bold shadow-lg shadow-white/5"
             >
               Borrow
             </button>
          ) : (
            <div className="space-y-2">
              {book.status === 'BORROWED' && book.dueDate && (
                <div className="bg-amber-500/10 rounded-lg p-2 flex items-center justify-between border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-500">
                      <CalendarIcon />
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold tracking-wider opacity-70 leading-none mb-0.5">Due</span>
                        <span className="text-[10px] font-mono font-bold leading-none">{book.dueDate}</span>
                      </div>
                  </div>
                </div>
              )}

              {onlyBorrowed ? (
                <button 
                  onClick={() => onReturn(book.id)}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors text-xs font-bold"
                >
                  Return
                </button>
              ) : (
                <div className="text-center text-[10px] text-slate-500 py-1 italic">
                  Unavailable
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Catalog: React.FC<CatalogProps> = ({ books, onBorrow, onReturn, onlyBorrowed = false, user, onAddBook, onEditBook, onDeleteBook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  // Modal State for Borrowing
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [borrowingBook, setBorrowingBook] = useState<Book | null>(null);
  const [borrowForm, setBorrowForm] = useState({ registerNumber: '', phoneNumber: '' });
  
  const [bookForm, setBookForm] = useState({
    title: '',
    isbn: '',
    author: '',
    category: '',
    description: '',
    image: ''
  });

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(books.map(b => b.category)))];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (book.isbn && book.isbn.includes(searchTerm));
      const matchesCategory = categoryFilter === 'All' || book.category === categoryFilter;
      const matchesView = onlyBorrowed ? book.status === 'BORROWED' : true;
      
      return matchesSearch && matchesCategory && matchesView;
    });
  }, [books, searchTerm, categoryFilter, onlyBorrowed]);

  const handleOpenAdd = () => {
    setEditingBook(null);
    setBookForm({ title: '', isbn: '', author: '', category: '', description: '', image: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setBookForm({
        title: book.title,
        isbn: book.isbn || '',
        author: book.author,
        category: book.category,
        description: book.description,
        image: book.image || ''
    });
    setIsModalOpen(true);
  };

  const handleBorrowClick = (book: Book) => {
      setBorrowingBook(book);
      // Pre-fill form if user has data, otherwise empty
      setBorrowForm({
          registerNumber: user?.registerNumber || '',
          phoneNumber: user?.phoneNumber || ''
      });
      setIsBorrowModalOpen(true);
  };

  const handleConfirmBorrow = (e: React.FormEvent) => {
      e.preventDefault();
      if (borrowingBook && borrowForm.registerNumber && borrowForm.phoneNumber) {
          onBorrow(borrowingBook.id, borrowForm);
          setIsBorrowModalOpen(false);
          setBorrowingBook(null);
      }
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookForm.title && bookForm.author && bookForm.category) {
      if (editingBook) {
        if (onEditBook) {
            onEditBook({
                ...editingBook,
                title: bookForm.title,
                isbn: bookForm.isbn,
                author: bookForm.author,
                category: bookForm.category,
                description: bookForm.description,
                image: bookForm.image.trim() || undefined
            });
        }
      } else {
        if (onAddBook) {
            const gradients = [
                'from-primary-600 to-primary-900',
                'from-slate-700 to-slate-900',
                'from-amber-600 to-orange-800',
                'from-blue-600 to-indigo-800',
            ];
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

            onAddBook({
                title: bookForm.title,
                isbn: bookForm.isbn,
                author: bookForm.author,
                category: bookForm.category,
                description: bookForm.description || 'No description available.',
                coverColor: randomGradient,
                image: bookForm.image.trim() || undefined,
            });
        }
      }
      setIsModalOpen(false);
      setBookForm({ title: '', isbn: '', author: '', category: '', description: '', image: '' });
      setEditingBook(null);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
         <div>
            <h1 className="text-4xl font-bold text-white mb-2">
                {onlyBorrowed ? 'My Library' : 'Discover'}
            </h1>
            <p className="text-slate-400">
                {onlyBorrowed ? 'Manage your readings and due dates.' : 'Explore our vast collection of books.'}
            </p>
         </div>

         <div className="flex-1 max-w-2xl flex items-center gap-4">
             {/* Styled Search Bar */}
             <div className="flex-1 bg-slate-800 p-2 rounded-full shadow-lg shadow-black/20 border border-slate-700 flex items-center gap-2">
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent text-slate-400 text-sm font-medium px-4 py-2 border-r border-slate-700 outline-none cursor-pointer hover:text-white [&>option]:bg-slate-800 [&>option]:text-white"
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                <div className="flex-1 flex items-center px-2">
                    <div className="text-slate-500 mr-2">
                        <SearchIcon />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Find the book you like..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent text-white placeholder-slate-500 outline-none text-sm"
                    />
                </div>

                <button className="bg-primary-600 text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-primary-500 transition-colors shadow-md shadow-primary-500/20">
                    Search
                </button>
             </div>

             {/* Admin Add Button */}
             {!onlyBorrowed && user?.role === 'ADMIN' && (
                <button 
                    onClick={handleOpenAdd}
                    className="bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-black/20 transition-all active:scale-95"
                    title="Add Book"
                >
                    <PlusIcon />
                </button>
             )}
         </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-200">
             {onlyBorrowed ? 'Current Reads' : 'Book Recommendation'}
          </h2>
      </div>

      {/* Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-slate-800 rounded-full mb-4">
             <BookIcon />
          </div>
          <p className="">No books found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 lg:gap-8">
          {filteredBooks.map(book => (
            <BookCard 
              key={book.id} 
              book={book} 
              onBorrowClick={handleBorrowClick}
              onReturn={onReturn} 
              onlyBorrowed={onlyBorrowed}
              user={user}
              onEdit={handleOpenEdit}
              onDelete={onDeleteBook}
            />
          ))}
        </div>
      )}

      {/* Borrow Confirmation Modal */}
      {isBorrowModalOpen && borrowingBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700 animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Confirm Borrow</h3>
                    <button onClick={() => setIsBorrowModalOpen(false)} className="text-slate-400 hover:text-white">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleConfirmBorrow} className="p-6 space-y-4">
                    <div className="flex items-center gap-4 bg-slate-800 p-3 rounded-xl mb-2">
                        <div className="w-12 h-16 bg-slate-700 rounded flex-shrink-0 overflow-hidden">
                             {borrowingBook.image ? (
                                 <img src={borrowingBook.image} alt="" className="w-full h-full object-cover"/>
                             ) : (
                                 <div className={`w-full h-full bg-gradient-to-br ${borrowingBook.coverColor}`}></div>
                             )}
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm line-clamp-1">{borrowingBook.title}</p>
                            <p className="text-xs text-slate-400">{borrowingBook.author}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">USN</label>
                        <input 
                            type="text" 
                            required 
                            value={borrowForm.registerNumber}
                            onChange={(e) => setBorrowForm({...borrowForm, registerNumber: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="1hm23cs001"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Contact Number</label>
                        <input 
                            type="tel" 
                            required 
                            value={borrowForm.phoneNumber}
                            onChange={(e) => setBorrowForm({...borrowForm, phoneNumber: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="e.g. +91 98765 43210"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl mt-4 shadow-lg transition-colors"
                    >
                        Confirm & Borrow
                    </button>
                </form>
            </div>
          </div>
      )}

      {/* Add/Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white">
                  {editingBook ? 'Edit Book' : 'Add New Book'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors"
              >
                <XIcon />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Book Title</label>
                <input 
                  type="text" 
                  required
                  value={bookForm.title}
                  onChange={e => setBookForm({...bookForm, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. The Psychology of Money"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Author</label>
                    <input 
                    type="text" 
                    required
                    value={bookForm.author}
                    onChange={e => setBookForm({...bookForm, author: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ISBN</label>
                    <input 
                    type="text" 
                    required
                    value={bookForm.isbn}
                    onChange={e => setBookForm({...bookForm, isbn: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <input 
                  type="text" 
                  required
                  value={bookForm.category}
                  onChange={e => setBookForm({...bookForm, category: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Image URL</label>
                 <input 
                   type="url" 
                   value={bookForm.image}
                   onChange={e => setBookForm({...bookForm, image: e.target.value})}
                   className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                 />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea 
                  rows={3}
                  value={bookForm.description}
                  onChange={e => setBookForm({...bookForm, description: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg transition-colors"
                >
                  {editingBook ? 'Save Changes' : 'Add to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;