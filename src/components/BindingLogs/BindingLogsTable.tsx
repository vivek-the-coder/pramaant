import { useState, useEffect } from 'react';
import { Filter, FileText } from 'lucide-react';
import FileDetailsModal from './FileDetailsModal';
import { getDashboardStats } from '../../services/fileService';

interface FileRow {
    srNo: number;
    refNo: string;
    fileId: string;
    applicantName: string;
    serviceType: string;
    officeWard: string;
    timestamp: string;
    status: string;
}

const BindingLogsPage = () => {
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [rows, setRows] = useState<FileRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const data = await getDashboardStats();
                if (data.recentFiles && Array.isArray(data.recentFiles)) {
                    const mapped: FileRow[] = data.recentFiles.map((file: any, i: number) => {
                        const date = file.createdAt ? new Date(file.createdAt) : new Date();
                        const formatted = date.toLocaleDateString('en-IN', {
                            day: '2-digit', month: '2-digit', year: 'numeric'
                        }) + ' ' + date.toLocaleTimeString('en-IN', {
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                        });

                        return {
                            srNo: i + 1,
                            refNo: `TX-${date.getFullYear()}-X${String(900 + i).padStart(3, '0')}`,
                            fileId: file.id || 'N/A',
                            applicantName: (file.citizenName || 'Unknown').toUpperCase(),
                            serviceType: (file.category || 'GENERAL').toUpperCase().replace(/_/g, ' '),
                            officeWard: file.department || 'N/A',
                            timestamp: formatted,
                            status: file.status || 'REGISTERED',
                        };
                    });
                    setRows(mapped);
                }
            } catch (err) {
                console.error('Failed to load registration register:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, []);

    const handleViewDetails = (log: any) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const filteredData = rows.filter(log =>
        log.fileId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.refNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Action Bar */}
            <div className="bg-white border border-slate-300 rounded p-4 flex justify-between items-center shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Registration Register</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Master Record of All Binding Activities</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find File Ref / Applicant..."
                            className="bg-slate-50 border border-slate-300 rounded px-3 py-1.5 w-64 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-slate-100 border border-slate-300 px-4 py-1.5 rounded text-sm font-bold text-slate-600 hover:bg-slate-200">
                        <Filter size={14} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-primary-dark shadow-sm">
                        <FileText size={14} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Main Table Grid */}
            <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#1D4E89] text-white">
                        <tr>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center w-16">Sr.</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-l border-white/20">Digital Ref No.</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-l border-white/20">File Reference</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-l border-white/20">Applicant Name</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-l border-white/20">Service Type</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-l border-white/20">Authority Ward</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-l border-white/20">Timestamp</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center border-l border-white/20 w-32">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic text-xs">
                                    Loading records...
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((log, i) => (
                                <tr
                                    key={i}
                                    onClick={() => handleViewDetails(log)}
                                    className="odd:bg-white even:bg-slate-50 hover:bg-yellow-50 cursor-pointer border-b border-slate-200 last:border-0 transition-colors"
                                >
                                    <td className="px-4 py-3 text-center font-medium">{log.srNo}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.refNo}</td>
                                    <td className="px-4 py-3 font-bold text-slate-900 underline decoration-slate-300 underline-offset-2">{log.fileId}</td>
                                    <td className="px-4 py-3 font-bold">{log.applicantName}</td>
                                    <td className="px-4 py-3 uppercase text-xs">{log.serviceType}</td>
                                    <td className="px-4 py-3">{log.officeWard}</td>
                                    <td className="px-4 py-3 tabular-nums">{log.timestamp}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                            log.status === 'PENDING_REVIEW'
                                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                : log.status === 'APPROVED'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : log.status === 'REJECTED'
                                                ? 'bg-red-100 text-red-700 border border-red-200'
                                                : 'bg-green-100 text-green-700 border border-green-200'
                                        }`}>
                                            {log.status === 'PENDING_REVIEW' ? 'PENDING' : log.status || 'REGISTERED'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic text-xs">
                                    No records found. Create a file to see entries here.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <FileDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedLog}
            />
        </div>
    );
};

export default BindingLogsPage;
