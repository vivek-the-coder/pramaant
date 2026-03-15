import { useState, useEffect, useCallback } from 'react';
import { Search, QrCode, X, ArrowRightLeft, FileCheck, RefreshCw } from 'lucide-react';
import OfficerPerformanceWidget from '../components/OfficerDashboard/OfficerPerformanceWidget';
import FileActionPanel from '../components/OfficerDashboard/FileActionPanel';
import { getOfficerDashboard } from '../services/fileService';
import type { FileRecord } from '../types/OfficerTypes';

const OfficerDashboardPage = () => {
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'DELAYED' | 'ESCALATED'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [_stats, setStats] = useState<any>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getOfficerDashboard();
            setFiles(data.myFiles || []);
            setStats(data.stats || null);
        } catch (err) {
            console.error('Failed to load officer dashboard:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Filter Logic
    const filteredFiles = files.filter(file => {
        const matchesSearch =
            (file.fileId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (file.citizenName || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        switch (activeFilter) {
            case 'DELAYED': return file.isDelayed;
            case 'ESCALATED': return file.escalationLevel > 0;
            case 'ALL':
            default: return true;
        }
    });

    const delayedCount = files.filter(f => f.isDelayed).length;
    const escalatedCount = files.filter(f => f.escalationLevel > 0).length;

    const handleAction = (action: string, notes: string) => {
        console.log(`Action: ${action} on file ${selectedFile?.fileId} with notes: ${notes}`);
        setSelectedFile(null);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Verification Queue</h1>
                    <p className="text-sm text-slate-500">
                        You have <span className="font-bold text-[#1D4E89]">{files.length} files</span> assigned
                        {delayedCount > 0 && <>, <span className="font-bold text-red-600">{delayedCount} delayed</span></>}.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 text-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>

                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 bg-white text-slate-700 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
                    >
                        <RefreshCw size={16} />
                    </button>

                    <button
                        onClick={() => setIsQRModalOpen(true)}
                        className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors font-bold text-sm shadow-sm"
                    >
                        <QrCode size={18} />
                        <span>Scan QR</span>
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                    onClick={() => setActiveFilter('ALL')}
                    className={`p-4 rounded-xl border shadow-sm text-left transition-all ${
                        activeFilter === 'ALL'
                            ? 'border-[#1D4E89] bg-blue-50 ring-1 ring-[#1D4E89]/30'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">All Files</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">{files.length}</p>
                </button>
                <button
                    onClick={() => setActiveFilter('DELAYED')}
                    className={`p-4 rounded-xl border shadow-sm text-left transition-all ${
                        activeFilter === 'DELAYED'
                            ? 'border-red-500 bg-red-50 ring-1 ring-red-500/30'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Delayed / SLA Breach</p>
                    <p className="text-3xl font-black text-red-700 mt-1">{delayedCount}</p>
                </button>
                <button
                    onClick={() => setActiveFilter('ESCALATED')}
                    className={`p-4 rounded-xl border shadow-sm text-left transition-all ${
                        activeFilter === 'ESCALATED'
                            ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500/30'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Escalated</p>
                    <p className="text-3xl font-black text-amber-700 mt-1">{escalatedCount}</p>
                </button>
            </div>

            {/* Performance Widget */}
            <div className="mb-6">
                <OfficerPerformanceWidget />
            </div>

            {/* ── Verification Queue Table ── */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        {activeFilter === 'ALL' ? 'All Assigned Files' 
                            : activeFilter === 'DELAYED' ? 'Delayed Files' 
                            : 'Escalated Files'}
                        <span className="text-slate-400 ml-2">({filteredFiles.length})</span>
                    </h3>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs uppercase bg-[#1D4E89] text-white sticky top-0 z-10 font-bold">
                            <tr>
                                <th className="px-5 py-3 tracking-widest">File ID</th>
                                <th className="px-5 py-3 tracking-widest">Citizen</th>
                                <th className="px-5 py-3 tracking-widest">Category</th>
                                <th className="px-5 py-3 tracking-widest">Department</th>
                                <th className="px-5 py-3 tracking-widest">Status</th>
                                <th className="px-5 py-3 tracking-widest text-right">Days Pending</th>
                                <th className="px-5 py-3 tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                                        Loading verification queue...
                                    </td>
                                </tr>
                            ) : filteredFiles.length > 0 ? (
                                filteredFiles.map((file) => {
                                    const createdDate = file.createdDate ? new Date(file.createdDate) : null;
                                    const daysPending = createdDate 
                                        ? Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                                        : '-';
                                    const isDelayed = file.isDelayed;

                                    return (
                                        <tr
                                            key={file.fileId}
                                            className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                                                isDelayed ? 'bg-red-50/50 border-l-4 border-l-red-500' : ''
                                            } ${file.escalationLevel > 0 ? 'bg-amber-50/30' : ''}`}
                                            onClick={() => setSelectedFile(file)}
                                        >
                                            <td className="px-5 py-3">
                                                <span className="font-bold text-[#1D4E89] bg-blue-50 px-2 py-0.5 rounded font-mono text-xs">
                                                    {file.fileId}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-slate-800">
                                                {file.citizenName}
                                            </td>
                                            <td className="px-5 py-3 text-xs uppercase text-slate-500">
                                                {(file.category || '').replace(/_/g, ' ')}
                                            </td>
                                            <td className="px-5 py-3 text-xs uppercase text-slate-500">
                                                {(file.department || '').replace(/_/g, ' ')}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                                                    file.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' :
                                                    file.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    file.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    file.status === 'ESCALATED' ? 'bg-red-100 text-red-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {(file.status || '').replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className={`px-5 py-3 text-right tabular-nums ${
                                                isDelayed ? 'text-red-600 font-bold' : ''
                                            }`}>
                                                {daysPending}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedFile(file); }}
                                                    className="text-xs px-3 py-1 border border-[#1D4E89] text-[#1D4E89] rounded font-bold hover:bg-[#1D4E89] hover:text-white transition-colors"
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileCheck size={32} className="text-slate-300" />
                                            <p>No files match the current filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-over Panel */}
            {selectedFile && (
                <>
                    <div
                        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedFile(null)}
                    />
                    <FileActionPanel
                        file={selectedFile}
                        onClose={() => setSelectedFile(null)}
                        onAction={handleAction}
                    />
                </>
            )}

            {/* QR Scan Modal */}
            {isQRModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden">
                        <div className="bg-[#1D4E89] p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold tracking-wide">File Custody Scanner</h3>
                            <button onClick={() => setIsQRModalOpen(false)} className="hover:text-blue-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col items-center justify-center space-y-6">
                            <div className="w-48 h-48 border-4 border-dashed border-blue-200 rounded-xl flex items-center justify-center bg-blue-50 relative">
                                <QrCode size={64} className="text-[#1D4E89] opacity-50 animate-pulse" />
                            </div>
                            <p className="text-sm font-bold text-slate-500 text-center uppercase tracking-widest">
                                Scan Physical File QR Code
                            </p>
                            <div className="flex gap-2 w-full">
                                <button className="flex-1 flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded hover:bg-blue-50 hover:border-[#1D4E89] hover:text-[#1D4E89] transition-all group">
                                    <FileCheck size={20} className="mb-2 text-slate-400 group-hover:text-[#1D4E89]" />
                                    <span className="text-[10px] font-bold uppercase">Receive</span>
                                </button>
                                <button className="flex-1 flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded hover:bg-blue-50 hover:border-[#1D4E89] hover:text-[#1D4E89] transition-all group">
                                    <ArrowRightLeft size={20} className="mb-2 text-slate-400 group-hover:text-[#1D4E89]" />
                                    <span className="text-[10px] font-bold uppercase">Transfer</span>
                                </button>
                                <button className="flex-1 flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded hover:bg-blue-50 hover:border-[#1D4E89] hover:text-[#1D4E89] transition-all group">
                                    <QrCode size={20} className="mb-2 text-slate-400 group-hover:text-[#1D4E89]" />
                                    <span className="text-[10px] font-bold uppercase">Verify</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfficerDashboardPage;
