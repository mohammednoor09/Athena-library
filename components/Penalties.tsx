import React, { useMemo } from 'react';
import { Book } from '../types';
import { MOCK_USERS } from '../services/data';
import { AlertIcon, CalendarIcon, CashIcon, UserIcon } from './Icons';

interface PenaltiesProps {
  books: Book[];
  onResolve: (id: string) => void;
}

const Penalties: React.FC<PenaltiesProps> = ({ books, onResolve }) => {
  const overdueBooks = useMemo(() => {
    const today = new Date();
    return books.filter(book => {
      if (book.status !== 'BORROWED' || !book.dueDate) return false;
      const due = new Date(book.dueDate);
      due.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return today > due;
    }).map(book => {
      const due = new Date(book.dueDate!);
      const today = new Date();
      due.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today.getTime() - due.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Penalty logic: ₹2 flat fee + ₹1 per day
      const fine = 2 + (diffDays * 1);
      
      const borrower = MOCK_USERS.find(u => u.id === book.borrowedBy);

      return {
        ...book,
        daysOverdue: diffDays,
        fine,
        // Use stored name or fallback to lookup
        displayBorrowerName: book.borrowerName || (borrower ? borrower.name : 'Unknown User')
      };
    });
  }, [books]);

  const totalFines = overdueBooks.reduce((acc, curr) => acc + curr.fine, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="text-red-500 p-2 bg-red-500/10 rounded-lg">
                <AlertIcon />
             </div>
             <h2 className="text-3xl font-bold text-white">Penalty Management</h2>
          </div>
          <p className="text-slate-400 text-sm">
            Review overdue books and collect outstanding fines from users.
          </p>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 px-6 py-4 rounded-xl flex flex-col items-end shadow-sm">
             <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Outstanding</span>
             <span className="text-3xl font-mono font-bold text-red-500">₹{totalFines.toFixed(2)}</span>
        </div>
      </div>

      {overdueBooks.length === 0 ? (
        <div className="text-center py-20 bg-slate-800 rounded-3xl border border-slate-700 border-dashed">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center text-primary-400 mx-auto mb-4">
             <CashIcon />
          </div>
          <h3 className="text-xl font-bold text-white">No Outstanding Penalties</h3>
          <p className="text-slate-500 mt-2">All books are within their borrowing period.</p>
        </div>
      ) : (
        <div className="grid gap-4">
           {overdueBooks.map(item => (
             <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col lg:flex-row gap-6 items-center hover:shadow-lg transition-all shadow-sm">
                {/* Book Info */}
                <div className="flex items-center gap-4 flex-1 w-full lg:w-auto">
                   <div className="w-12 h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0 shadow-sm">
                      {item.image ? (
                        <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${item.coverColor}`}></div>
                      )}
                   </div>
                   <div>
                      <h4 className="text-lg font-bold text-white">{item.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                        <UserIcon />
                        <span>Borrowed by: <span className="text-slate-300 font-bold">{item.displayBorrowerName}</span></span>
                      </div>
                   </div>
                </div>

                {/* Dates & Fine */}
                <div className="flex flex-wrap gap-4 lg:gap-8 w-full lg:w-auto justify-between lg:justify-end bg-slate-900 p-3 rounded-xl lg:bg-transparent lg:p-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700 rounded-lg text-slate-400 shadow-sm">
                            <CalendarIcon />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Due Date</span>
                            <span className="text-sm font-mono text-slate-300">{item.dueDate}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                            <AlertIcon />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-red-400 uppercase font-bold">Overdue</span>
                            <span className="text-sm font-bold text-red-500">{item.daysOverdue} Days</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pl-0 lg:pl-6 lg:border-l border-slate-700">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Penalty Fee</span>
                            <span className="text-xl font-mono font-bold text-white">₹{item.fine.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <button 
                  onClick={() => onResolve(item.id)}
                  className="w-full lg:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 whitespace-nowrap"
                >
                  Mark Paid & Return
                </button>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default Penalties;