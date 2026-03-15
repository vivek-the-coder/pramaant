import React, { useState, useEffect } from 'react';
import { QrCode, AlertTriangle, ArrowUpRight, ArrowDownLeft, Search, ShieldAlert, ShieldCheck, Info, ChevronDown, ChevronUp, History } from 'lucide-react';
import QrLogStatusBadge from '../../components/OfficerDashboard/QrLogStatusBadge';
import { getOfficerDashboard } from '../../services/fileService';

interface QrLog {
    id: string;
    fileId: string;
    scanType: string;
    timestamp: string;
    scannedBy: string;
    status: string;
    details?: string;
    fromUser?: string;
    toUser?: string;
    action?: string;
}

const QrLogsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const [qrLogs, setQrLogs] = useState<QrLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getOfficerDashboard();
                setQrLogs(data.qrLogs || []);
            } catch (err) {
                console.error('Failed to load QR logs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredLogs = qrLogs.filter(log =>
        log.fileId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.scanType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const receivedCount = qrLogs.filter(l => l.scanType === 'RECEIVE' && l.status === 'SUCCESS').length;
    const forwardedCount = qrLogs.filter(l => l.scanType === 'FORWARD' && l.status === 'SUCCESS').length;
    const mismatchCount = qrLogs.filter(l => l.status === 'FAILED_MISMATCH').length;

    // Calculate Custody Risk Score
    let riskScore = 'LOW';
    let riskColor = 'text-green-600';
    let riskBg = 'bg-green-100';
    let RiskIcon = ShieldCheck;

    if (mismatchCount > 2) {
        riskScore = 'HIGH';
        riskColor = 'text-red-700';
        riskBg = 'bg-red-100';
        RiskIcon = ShieldAlert;
    } else if (mismatchCount > 0) {
        riskScore = 'MEDIUM';
        riskColor = 'text-amber-600';
        riskBg = 'bg-amber-100';
        RiskIcon = AlertTriangle;
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">QR & Transfer Logs</h1>
                    <p className="text-sm text-slate-500">Track physical custody transfers and scan history.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-[#1D4E89] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-bold text-sm shadow-md">
                        <QrCode size={18} />
                        <span>Scan Physical File</span>
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4 relative overflow-hidden group/card`}>
                    <div className={`absolute inset-0 opacity-20 transition-opacity group-hover/card:opacity-40 ${riskBg}`} />
                    <div className={`p-3 rounded-lg relative z-10 ${riskBg} ${riskColor}`}>
                        <RiskIcon size={24} />
                    </div>
                    <div className="relative z-10 w-full">
                        <div className="flex justify-between items-start">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Custody Risk<br />Score</p>
                            <div className="relative flex items-center group/tooltip">
                                <Info size={14} className="text-slate-400 hover:text-slate-600 cursor-help" />
                                <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 text-slate-200 text-xs p-3 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 border border-slate-700 pointer-events-none">
                                    <p className="font-bold text-slate-100 mb-1 border-b border-slate-700 pb-1">Score Calculation</p>
                                    <ul className="list-disc pl-4 space-y-1 mt-1 font-medium text-slate-300">
                                        <li><span className="text-green-400">LOW:</span> 0 transfer mismatches</li>
                                        <li><span className="text-amber-400">MEDIUM:</span> 1-2 transfer mismatches</li>
                                        <li><span className="text-red-400">HIGH:</span> &gt;2 transfer mismatches</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p className={`text-xl font-bold ${riskColor} mt-1`}>{riskScore}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-lg text-green-600">
                        <ArrowDownLeft size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Received</p>
                        <p className="text-2xl font-bold text-slate-800">{receivedCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-[#1D4E89]">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Forwarded</p>
                        <p className="text-2xl font-bold text-slate-800">{forwardedCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-50/50" />
                    <div className="p-3 bg-red-100 rounded-lg text-red-600 relative z-10">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Mismatches</p>
                        <p className="text-2xl font-bold text-red-700">{mismatchCount}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-72">
                        <input
                            type="text"
                            placeholder="Search by File ID or Action..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs uppercase bg-slate-50 text-slate-500 sticky top-0 z-10 shadow-sm font-bold">
                            <tr>
                                <th className="px-6 py-4 font-display tracking-widest">Timestamp</th>
                                <th className="px-6 py-4 font-display tracking-widest">File ID</th>
                                <th className="px-6 py-4 font-display tracking-widest">Action Status</th>
                                <th className="px-6 py-4 font-display tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading QR logs...</td>
                                </tr>
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log) => {
                                    const isExpanded = expandedLogId === log.id;
                                    return (
                                        <React.Fragment key={log.id}>
                                            <tr className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-700">
                                                        {new Date(log.timestamp).toLocaleDateString('en-IN', {
                                                            day: '2-digit', month: 'short', year: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-[#1D4E89] bg-blue-50 px-2 py-1 rounded">
                                                        {log.fileId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <QrLogStatusBadge type={log.scanType as any} status={log.status as any} />
                                                </td>
                                                <td className="px-6 py-4 flex flex-col items-start gap-2">
                                                    <span className={`text-sm ${log.status === 'FAILED_MISMATCH' ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                                                        {log.details || 'Successfully verified digital-physical custody link.'}
                                                    </span>
                                                    <button
                                                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                                        className="flex items-center gap-1 text-xs font-bold text-[#1D4E89] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                                    >
                                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        {isExpanded ? 'HIDE DETAILS' : 'VIEW DETAILS'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <td colSpan={4} className="p-0">
                                                        <div className="p-6 bg-slate-50 border-x-4 border-l-[#1D4E89] border-r-transparent">
                                                            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                                <History size={16} className="text-[#1D4E89]" />
                                                                Transfer Details
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="bg-white p-3 rounded-lg border border-slate-200">
                                                                    <p className="text-xs text-slate-500 font-bold uppercase">From</p>
                                                                    <p className="text-sm font-semibold text-slate-700">{log.fromUser || 'System'}</p>
                                                                </div>
                                                                <div className="bg-white p-3 rounded-lg border border-slate-200">
                                                                    <p className="text-xs text-slate-500 font-bold uppercase">To</p>
                                                                    <p className="text-sm font-semibold text-slate-700">{log.toUser || 'N/A'}</p>
                                                                </div>
                                                                <div className="bg-white p-3 rounded-lg border border-slate-200 col-span-2">
                                                                    <p className="text-xs text-slate-500 font-bold uppercase">Action</p>
                                                                    <p className="text-sm font-semibold text-slate-700">{log.action || log.scanType}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <QrCode size={32} className="text-slate-300" />
                                            <p>No QR logs found for this criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default QrLogsPage;
