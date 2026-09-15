
import React from 'react';
import { BorrowRecord, User } from '../types';
import { UserIcon, ClipboardIcon, TrashIcon, CheckCircleIcon } from './Icons';

interface BorrowedLogProps {
  history: BorrowRecord[];
  onDeleteBook?: (id: string) => void;
  onReturnBook?: (id: string) => void;
  user?: User;
}

const BorrowedLog: React.FC<BorrowedLogProps> = ({ history, onDeleteBook, onReturnBook, user }) => {
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
            <div className="text-primary-400 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-sm">
                <ClipboardIcon />
            </div>
            <h2 className="text-3xl font-bold text-white">Borrow Log</h2>
        </div>
        <p className="text-slate-400 text-sm">
            Complete history of all borrowed and returned books.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-slate-800 rounded-3xl border border-slate-700 border-dashed">
            <p className="text-slate-500">No transaction history available.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700 shadow-sm bg-slate-800">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/50 text-slate-500 uppercase font-bold text-xs tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Book Details</th>
                        <th className="px-6 py-4">Borrower Info</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Dates</th>
                        {user?.role === 'ADMIN' && (onDeleteBook || onReturnBook) && <th className="px-6 py-4 text-right">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {history.map(item => (
                        <tr key={item.id} className="hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                                    item.status === 'BORROWED' 
                                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' 
                                    : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20'
                                }`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-14 bg-slate-700 rounded overflow-hidden flex-shrink-0 shadow-sm">
                                        {item.bookImage ? (
                                            <img src={item.bookImage} alt={item.bookTitle} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={`w-full h-full bg-gradient-to-br ${item.bookCoverColor}`}></div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-200">{item.bookTitle}</p>
                                        <p className="text-xs text-slate-500">{item.bookAuthor}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-300 font-bold">
                                        <UserIcon />
                                        {item.borrowerName}
                                    </div>
                                    <div className="text-xs bg-slate-900 inline-block px-2 py-0.5 rounded text-slate-500 border border-slate-700">
                                        USN: {item.borrowerRegisterNumber}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1 text-xs">
                                    <span className="text-slate-400 font-medium">{item.borrowerEmail || 'N/A'}</span>
                                    <span className="text-slate-600">{item.borrowerPhoneNumber}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-slate-600 uppercase font-bold w-12">Out:</span>
                                        <span className="font-mono text-slate-400">{item.borrowDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-slate-600 uppercase font-bold w-12">Due:</span>
                                        <span className={`font-mono font-bold ${
                                            item.status === 'BORROWED' && new Date(item.dueDate) < new Date() 
                                            ? 'text-red-400' 
                                            : 'text-slate-400'
                                        }`}>
                                            {item.dueDate}
                                        </span>
                                    </div>
                                    {item.returnDate && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-slate-600 uppercase font-bold w-12">Ret:</span>
                                            <span className="font-mono text-emerald-400 font-bold">{item.returnDate}</span>
                                        </div>
                                    )}
                                </div>
                            </td>
                            {user?.role === 'ADMIN' && (onDeleteBook || onReturnBook) && (
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {item.status === 'BORROWED' && onReturnBook && (
                                            <button
                                                onClick={() => onReturnBook(item.bookId)}
                                                className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"
                                                title="Confirm Return"
                                            >
                                                <CheckCircleIcon />
                                            </button>
                                        )}
                                        {onDeleteBook && (
                                            <button 
                                                onClick={() => onDeleteBook(item.bookId)}
                                                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                                title="Delete Book From Library"
                                            >
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default BorrowedLog;