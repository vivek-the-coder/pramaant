import { AlertTriangle, Clock, ArrowRight, User } from 'lucide-react';
import type { FileRecord } from '../../types/OfficerTypes';
import { formatDistanceToNow, differenceInHours } from 'date-fns';

interface EscalatedFilesTableProps {
    files: FileRecord[];
    onActionClick: (file: FileRecord) => void;
}

const EscalatedFilesTable = ({ files, onActionClick }: EscalatedFilesTableProps) => {
    // Filter to ensure only escalated files are shown, just in case
    const escalatedFiles = files.filter(f => f.status === 'ESCALATED' || f.escalationLevel > 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 font-display tracking-widest">Escalation Source</th>
                            <th className="px-6 py-4 font-display tracking-widest">File Details</th>
                            <th className="px-6 py-4 font-display tracking-widest">Origin & Context</th>
                            <th className="px-6 py-4 font-display tracking-widest">Escalation Time</th>
                            <th className="px-6 py-4 font-display tracking-widest">Aging Timer</th>
                            <th className="px-6 py-4 font-display tracking-widest text-right">Intervention</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {escalatedFiles.length > 0 ? (
                            escalatedFiles.sort((a, b) => new Date(a.lastActionDate).getTime() - new Date(b.lastActionDate).getTime()).map(file => {
                                const isAutoEscalated = file.lastActionBy.toLowerCase().includes('auto') || file.lastActionBy === 'System';
                                const escalationLog = file.movementHistory.find(log => log.action === 'ESCALATED');
                                const timeSinceEscalated = formatDistanceToNow(new Date(file.lastActionDate), { addSuffix: true });

                                return (
                                    <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            {isAutoEscalated ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-100 text-red-700 text-xs font-bold w-fit border border-red-200 shadow-sm animate-pulse">
                                                        <AlertTriangle size={14} />
                                                        AUTO-ESCALATED
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-medium ml-1">SLA Breached</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-100 text-purple-700 w-fit text-xs font-bold shadow-sm border border-purple-200">
                                                        <User size={14} />
                                                        MANUAL FLAG
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-medium ml-1">Needs Guidance</span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => onActionClick(file)}
                                                    className="font-bold text-[#1D4E89] bg-blue-50 px-2 py-0.5 rounded w-fit hover:underline text-left"
                                                >
                                                    {file.fileId}
                                                </button>
                                                <span className="font-semibold text-slate-800 line-clamp-1">{file.subject}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-slate-500">Citizen: {file.citizenName}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm font-medium text-slate-700 border border-slate-200 bg-slate-50 px-2 rounded py-0.5 w-fit">
                                                    From: {file.sourceOfficerName}
                                                </span>
                                                <span className="text-xs text-slate-500 italic line-clamp-2 max-w-[250px]" title={escalationLog?.notes}>
                                                    "{escalationLog?.notes || 'No escalation remarks provided.'}"
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-slate-500">{new Date(file.lastActionDate).toLocaleDateString()}</span>
                                                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                                    <Clock size={14} className={isAutoEscalated ? "text-red-500 animate-pulse" : "text-amber-500"} />
                                                    <span className="text-xs">{timeSinceEscalated}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {(() => {
                                                const hoursOld = differenceInHours(new Date(), new Date(file.lastActionDate));
                                                let severityConfig = { color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'MEDIUM', hours: hoursOld };

                                                if (hoursOld > 48) severityConfig = { color: 'text-red-700 bg-red-100 border-red-300 shadow-sm animate-pulse', label: 'CRITICAL', hours: hoursOld };
                                                else if (hoursOld > 24) severityConfig = { color: 'text-orange-700 bg-orange-50 border-orange-300', label: 'HIGH', hours: hoursOld };

                                                return (
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                            {hoursOld}h Elapsed
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${severityConfig.color}`}>
                                                            {severityConfig.label} SEVERITY
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onActionClick(file)}
                                                className="inline-flex items-center gap-2 bg-[#1D4E89] text-white px-3 py-1.5 rounded hover:bg-blue-800 transition-colors shadow-sm font-bold text-xs"
                                            >
                                                Intervene <ArrowRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="p-4 bg-green-50 text-green-600 rounded-full">
                                            <AlertTriangle size={32} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-lg">No Active Escalations</p>
                                            <p className="text-sm">All files are within SLAs across the jurisdiction.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EscalatedFilesTable;
