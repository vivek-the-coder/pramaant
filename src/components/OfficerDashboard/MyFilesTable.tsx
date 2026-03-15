import { differenceInDays, parseISO, formatDistanceToNow } from 'date-fns';
import type { FileRecord } from '../../types/OfficerTypes';
import { ArrowRight, AlertTriangle, Clock, CheckCircle2, QrCode, Forward, CheckCircle, HelpCircle } from 'lucide-react';

interface MyFilesTableProps {
    files: FileRecord[];
    onActionClick: (file: FileRecord, action?: 'FORWARD' | 'APPROVE' | 'QUERY' | 'REJECT') => void;
    activeOfficeId: string | 'ALL';
}

const MyFilesTable = ({ files, onActionClick, activeOfficeId }: MyFilesTableProps) => {
    const currentUser = "OFFICER-001"; // Consistent with mock data

    // Filter files down to the active office scope
    const scopedFiles = activeOfficeId === 'ALL'
        ? files
        : files.filter(f => f.officeId === activeOfficeId);

    const getStatusBadge = (file: FileRecord) => {
        const { status, isDelayed, currentOfficerId } = file;
        const isMine = currentOfficerId === currentUser;

        return (
            <div className="flex flex-col gap-1.5 items-start">
                <div className="flex flex-wrap gap-1">
                    {status === 'ESCALATED' && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200 text-[10px] font-bold uppercase tracking-wider">
                            <AlertTriangle size={10} /> Escalated
                        </span>
                    )}

                    {isDelayed && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${isMine ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            <AlertTriangle size={10} /> {isMine ? 'Your Responsibility' : 'Delayed (Previous Level)'}
                        </span>
                    )}

                    {!isDelayed && status === 'PENDING_REVIEW' && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 text-[10px] font-bold uppercase tracking-wider">Pending</span>
                    )}

                    {status === 'QUERY_RAISED' && (
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-bold uppercase tracking-wider">Query Active</span>
                    )}

                    {status === 'APPROVED' && (
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 text-[10px] font-bold uppercase tracking-wider">Approved</span>
                    )}
                </div>

                <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                    Stage: {file.workflowStage}
                </span>
            </div>
        );
    };

    const getSLADisplay = (createdDate: string, slaDays: number) => {
        const daysPassed = differenceInDays(new Date(), parseISO(createdDate));
        const percentageUsed = (daysPassed / slaDays) * 100;
        const isOverdue = daysPassed > slaDays;

        let colorClass = 'bg-green-500';
        if (percentageUsed >= 40 && percentageUsed <= 80) colorClass = 'bg-amber-500';
        if (percentageUsed > 80) colorClass = 'bg-red-500';

        return (
            <div className="flex flex-col gap-1 w-20">
                <div className="flex justify-end gap-1 items-center text-[10px] font-bold leading-none">
                    <span className={isOverdue ? 'text-red-600' : 'text-slate-500'}>
                        {isOverdue ? `+${daysPassed - slaDays}d` : `${daysPassed}/${slaDays}d`}
                    </span>
                    {isOverdue && <AlertTriangle size={10} className="text-red-500" />}
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                        style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                    />
                </div>
            </div>
        );
    };

    const getLastActionText = (file: FileRecord) => {
        const action = file.lastActionType || 'Updated';
        const timeStr = formatDistanceToNow(parseISO(file.lastActionDate), { addSuffix: true });

        return (
            <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 leading-tight">
                    {action === 'FORWARDED' ? 'Forwarded' :
                        action === 'CREATED' ? 'Created' :
                            action === 'APPROVED' ? 'Approved' :
                                action === 'QUERY_RAISED' ? 'Query raised' : action} by {file.lastActionBy}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {timeStr}
                </span>
            </div>
        );
    };

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">File Details</th>
                            <th className="px-6 py-3 font-medium">Category</th>
                            <th className="px-6 py-3 font-medium">Status & Custodian</th>
                            <th className="px-6 py-3 font-medium">SLA</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {scopedFiles.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <CheckCircle2 size={32} className="text-slate-200" />
                                        <p>No files found in this category or office.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            scopedFiles.map((file) => (
                                <tr
                                    key={file.id}
                                    className={`
                                        group transition-all hover:bg-slate-50 border-l-4
                                        ${file.status === 'ESCALATED' ? 'border-l-orange-500 bg-orange-50/40' :
                                            file.isDelayed && file.currentOfficerId === currentUser ? 'border-l-red-500 bg-red-50/60' :
                                                file.currentOfficerId === currentUser ? 'border-l-[#1D4E89] bg-blue-50/10' :
                                                    'border-l-transparent'}
                                    `}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-[11px] font-bold text-[#1D4E89] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                                    {file.fileId}
                                                </span>
                                                <QrCode size={12} className="text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="font-bold text-slate-900 mt-1">{file.citizenName}</span>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-[#1D4E89] font-bold uppercase tracking-tight mb-0.5">
                                                    From: {file.sourceOfficerName || 'Registration Desk'}
                                                </span>
                                                <span className="text-xs text-slate-500 truncate max-w-[200px] leading-relaxed italic border-l-2 border-slate-200 pl-2">
                                                    "{file.subject}"
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2 items-start">
                                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase tracking-wide">
                                                {file.category}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            {getStatusBadge(file)}
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {file.currentOfficerId === currentUser ? (
                                                    <span className="text-[10px] font-bold text-white bg-[#1D4E89] px-2 py-0.5 rounded shadow-sm">
                                                        With Me
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                                        With {file.clerkId || file.currentOfficerId || 'Unknown'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getSLADisplay(file.createdDate, file.slaDays)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 relative">
                                            {/* Quick Actions for MY files */}
                                            {file.currentOfficerId === currentUser && (
                                                <div className="hidden group-hover:flex items-center gap-1 mr-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                                    <button
                                                        title="Quick Forward"
                                                        onClick={() => onActionClick(file, 'FORWARD')}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    >
                                                        <Forward size={14} />
                                                    </button>
                                                    <button
                                                        title="Approve"
                                                        onClick={() => onActionClick(file, 'APPROVE')}
                                                        className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                    <button
                                                        title="Raise Query"
                                                        onClick={() => onActionClick(file, 'QUERY')}
                                                        className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                                                    >
                                                        <HelpCircle size={14} />
                                                    </button>
                                                </div>
                                            )}

                                            <div className="relative flex items-center group/btn">
                                                <button
                                                    onClick={() => onActionClick(file)}
                                                    className="text-slate-400 hover:text-[#1D4E89] hover:bg-blue-50 p-2 rounded-xl transition-all border border-transparent hover:border-blue-100 peer"
                                                >
                                                    <ArrowRight size={18} />
                                                </button>

                                                {/* Tooltip containing getLastActionText */}
                                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-48 bg-slate-800 text-left p-3 rounded-lg shadow-xl opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all z-10 border border-slate-700 pointer-events-none">
                                                    <div className="flex flex-col gap-1 text-slate-200">
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Latest Activity</span>
                                                        {getLastActionText(file)}
                                                    </div>
                                                    <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 rotate-45 border-r border-t border-slate-700"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyFilesTable;
