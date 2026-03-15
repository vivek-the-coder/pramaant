import { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, FileText, LayoutList, ShieldCheck, Filter, Download, Printer } from 'lucide-react';
import type { FileRecord } from '../../types/OfficerTypes';
import FileActionPanel from '../../components/OfficerDashboard/FileActionPanel';
import { getOfficerDashboard } from '../../services/fileService';

const MyDecisionsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('ALL');
    const [department, setDepartment] = useState('ALL');
    const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
    const [decisionFiles, setDecisionFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getOfficerDashboard();
                setDecisionFiles(data.decisionFiles || []);
            } catch (err) {
                console.error('Failed to load decision data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredFiles = decisionFiles.filter(file => {
        const matchesSearch = file.fileId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.citizenName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = department === 'ALL' || (file.category || '').includes(department);

        let matchesDate = true;
        if (dateRange !== 'ALL') {
            const fileDate = new Date(file.decisionTimestamp || file.lastActionDate);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - fileDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (dateRange === '7D') matchesDate = diffDays <= 7;
            if (dateRange === '30D') matchesDate = diffDays <= 30;
        }

        return matchesSearch && matchesDept && matchesDate;
    });

    const approvedCount = decisionFiles.filter(f => f.status === 'APPROVED').length;
    const rejectedCount = decisionFiles.filter(f => f.status === 'REJECTED').length;

    const handleAction = (action: string, notes: string) => {
        console.log(`Action: ${action} on file ${selectedFile?.fileId} with notes: ${notes}`);
        setSelectedFile(null);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <LayoutList className="text-[#1D4E89]" size={24} />
                        My Decisions Ledger
                    </h1>
                    <p className="text-sm text-slate-500">A historical ledger of files you have explicitly approved or rejected.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition-colors">
                        <Download size={16} />
                        Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-700 shadow-sm transition-colors">
                        <Printer size={16} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-lg text-green-600">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Approved</p>
                        <p className="text-2xl font-bold text-slate-800">{approvedCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-lg text-red-600">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Rejected</p>
                        <p className="text-2xl font-bold text-slate-800">{rejectedCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Decisions Rendered</p>
                        <p className="text-2xl font-bold text-slate-800">{decisionFiles.length}</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="Search decisions by File ID or Citizen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D4E89]/20 text-sm shadow-sm"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                        <div className="flex gap-4">
                            <div className="relative flex items-center bg-white border border-slate-200 rounded-lg px-3 shadow-sm hover:border-slate-300 transition-colors focus-within:ring-2 focus-within:ring-[#1D4E89]/20">
                                <Filter size={14} className="text-slate-400 mr-2" />
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="bg-transparent py-2 text-sm text-slate-700 outline-none w-32 cursor-pointer font-medium"
                                >
                                    <option value="ALL">All Time</option>
                                    <option value="7D">Last 7 Days</option>
                                    <option value="30D">Last 30 Days</option>
                                </select>
                            </div>
                            <div className="relative flex items-center bg-white border border-slate-200 rounded-lg px-3 shadow-sm hover:border-slate-300 transition-colors focus-within:ring-2 focus-within:ring-[#1D4E89]/20">
                                <Filter size={14} className="text-slate-400 mr-2" />
                                <select
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="bg-transparent py-2 text-sm text-slate-700 outline-none w-40 cursor-pointer font-medium"
                                >
                                    <option value="ALL">All Departments</option>
                                    <option value="Certificate">Certificates</option>
                                    <option value="Land">Land Records</option>
                                    <option value="Pension">Pensions</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs uppercase bg-slate-50 text-slate-500 sticky top-0 z-10 border-b border-slate-200 font-bold">
                            <tr>
                                <th className="px-6 py-4 font-display tracking-widest">Date Rendered</th>
                                <th className="px-6 py-4 font-display tracking-widest">File Details</th>
                                <th className="px-6 py-4 font-display tracking-widest">Decision</th>
                                <th className="px-6 py-4 font-display tracking-widest">Your Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading decisions...</td>
                                </tr>
                            ) : filteredFiles.length > 0 ? (
                                filteredFiles.sort((a, b) => new Date(b.lastActionDate).getTime() - new Date(a.lastActionDate).getTime()).map((file) => (
                                    <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-700">
                                                {new Date(file.decisionTimestamp || file.lastActionDate).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                                                {new Date(file.decisionTimestamp || file.lastActionDate).toLocaleTimeString('en-IN', {
                                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => setSelectedFile(file)}
                                                    className="font-bold text-[#1D4E89] bg-blue-50 px-2 py-0.5 rounded w-fit hover:underline focus:outline-none"
                                                >
                                                    {file.fileId}
                                                </button>
                                                <span className="font-semibold text-slate-800 line-clamp-1">{file.subject || file.category}</span>
                                                <span className="text-[11px] text-slate-500">Citizen: {file.citizenName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                {file.status === 'APPROVED' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold shadow-sm">
                                                        <CheckCircle2 size={14} /> APPROVED
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold shadow-sm">
                                                        <XCircle size={14} /> REJECTED
                                                    </span>
                                                )}
                                                {file.digitalSignatureToken && (
                                                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1 whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis" title={file.digitalSignatureToken}>
                                                        <ShieldCheck size={10} className="text-[#1D4E89] flex-shrink-0" />
                                                        {file.digitalSignatureToken.substring(0, 10)}...
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 min-w-[300px]">
                                            <p className="text-slate-600 text-sm line-clamp-2 italic">
                                                "{file.notes || 'No remarks provided.'}"
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        <LayoutList size={32} className="mx-auto mb-3 text-slate-300" />
                                        <p>No past decisions found matching your search.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
        </div>
    );
};

export default MyDecisionsPage;
