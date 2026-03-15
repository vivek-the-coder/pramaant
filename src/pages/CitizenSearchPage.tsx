import { useState } from 'react';
import { Search, FileText, Clock, ArrowRight, Shield, User, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchFiles } from '../services/fileService';

interface SearchResult {
    id: string;
    citizenName: string;
    category: string;
    department: string;
    status: string;
    createdAt: string | null;
    movements: {
        id: string;
        action: string;
        fromUser: string;
        toUser: string;
        timestamp: string;
        notes?: string;
    }[];
}

const CitizenSearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<SearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setHasSearched(true);
        setSelectedRecord(null);

        try {
            const data = await searchFiles(searchQuery.trim());
            setResults(data.results || []);
        } catch (err) {
            console.error('Search failed:', err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTimestamp = (ts: string) => {
        const d = new Date(ts);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'ESCALATED': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Citizen File Search</h1>
                    <p className="text-sm text-slate-500 mt-1">Official Record Search — Rajpipla Ward Registry</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <Shield size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-wide">
                        Authorized Access Only
                    </p>
                </div>
            </div>

            {/* Search Box */}
            <div className="bg-white border border-slate-300 rounded p-6 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Search by Citizen Name, File Number, or Service Type</p>
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. Ramesh Kumar, PRM-2026-000001, Income Certificate..."
                            className="w-full border border-slate-300 rounded pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="bg-[#1D4E89] text-white px-6 py-2.5 rounded text-sm font-bold uppercase tracking-wide hover:bg-[#163d6e] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                    >
                        {isLoading ? 'Searching...' : <>
                            <Search size={14} />
                            Search Registry
                        </>}
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Results List */}
                <div className={`${selectedRecord ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-3`}>
                    {isLoading && (
                        <div className="bg-white border border-slate-300 rounded p-8 text-center">
                            <p className="text-sm text-slate-500">Searching records...</p>
                        </div>
                    )}

                    {!isLoading && hasSearched && results.length === 0 && (
                        <div className="bg-white border border-slate-300 rounded p-8 text-center">
                            <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                            <p className="text-sm font-bold text-slate-500">No Records Found</p>
                            <p className="text-xs text-slate-400 mt-1">Try a different search term or verify the file number</p>
                        </div>
                    )}

                    <AnimatePresence>
                        {results.map((record, i) => (
                            <motion.div
                                key={record.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSelectedRecord(record)}
                                className={`bg-white border rounded p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all ${
                                    selectedRecord?.id === record.id
                                        ? 'border-primary shadow-md ring-1 ring-primary/20'
                                        : 'border-slate-300'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-bold text-slate-800">{record.citizenName}</p>
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${getStatusColor(record.status)}`}>
                                                {record.status === 'PENDING_REVIEW' ? 'PENDING' : record.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-mono text-slate-500">{record.id}</p>
                                        <div className="flex gap-4 mt-2">
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <FileText size={10} />
                                                {(record.category || 'N/A').replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <MapPin size={10} />
                                                {record.department || 'N/A'}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock size={10} />
                                                {formatDate(record.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-400 mt-1" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Detail Panel */}
                {selectedRecord && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 bg-white border border-slate-300 rounded overflow-hidden shadow-sm"
                    >
                        {/* Detail Header */}
                        <div className="bg-[#1D4E89] text-white px-6 py-4">
                            <h3 className="text-lg font-bold uppercase tracking-wide">{selectedRecord.id}</h3>
                            <p className="text-[10px] opacity-80 uppercase tracking-wider mt-0.5">Official File Record — Government Property</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Registrant Info */}
                            <div className="bg-slate-50 border border-slate-200 rounded p-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Registrant Particulars</h4>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><User size={10} /> Applicant Name</p>
                                        <p className="font-bold text-slate-800">{selectedRecord.citizenName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><FileText size={10} /> Service Category</p>
                                        <p className="font-bold text-slate-800 uppercase">{(selectedRecord.category || 'N/A').replace(/_/g, ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Department</p>
                                        <p className="font-bold text-slate-800">{selectedRecord.department || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Registration Date</p>
                                        <p className="font-bold text-slate-800">{formatDate(selectedRecord.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Status</p>
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(selectedRecord.status)}`}>
                                            {selectedRecord.status === 'PENDING_REVIEW' ? 'PENDING' : selectedRecord.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Movement Timeline */}
                            <div className="bg-slate-50 border border-slate-200 rounded overflow-hidden">
                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                                        <Clock size={12} />
                                        File Movement Timeline
                                    </h4>
                                </div>
                                {selectedRecord.movements && selectedRecord.movements.length > 0 ? (
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-2 w-40">Timestamp</th>
                                                <th className="px-4 py-2">Action</th>
                                                <th className="px-4 py-2">From → To</th>
                                                <th className="px-4 py-2">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedRecord.movements.map((move) => (
                                                <tr key={move.id} className="odd:bg-white even:bg-slate-50">
                                                    <td className="px-4 py-3 text-slate-500 tabular-nums">{formatTimestamp(move.timestamp)}</td>
                                                    <td className="px-4 py-3 font-bold text-slate-800 uppercase">{move.action}</td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        <span className="font-medium">{move.fromUser}</span>
                                                        <ArrowRight size={10} className="inline mx-1 text-slate-400" />
                                                        <span className="font-medium">{move.toUser}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 italic">{move.notes || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="px-4 py-6 text-center text-slate-400 text-xs italic">
                                        No movement records available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center gap-2 text-slate-500">
                            <Shield size={12} />
                            <p className="text-[10px] font-bold uppercase tracking-wide">
                                Disclaimer: For Official Use Only. Unauthorized Access Punishable Under IT Act.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Empty state when nothing searched */}
            {!hasSearched && (
                <div className="bg-white border border-slate-300 rounded p-12 text-center shadow-sm">
                    <Search className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-lg font-bold text-slate-500 uppercase tracking-tight">Search Official Registry</p>
                    <p className="text-sm text-slate-400 mt-1">Enter a citizen name, file number, or service type to look up records</p>
                </div>
            )}
        </div>
    );
};

export default CitizenSearchPage;