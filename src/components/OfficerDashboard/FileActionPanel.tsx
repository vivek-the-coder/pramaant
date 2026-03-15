import { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle, Clock, User, Clock3 } from 'lucide-react';
import type { FileRecord } from '../../types/OfficerTypes';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

interface FileActionPanelProps {
    file: FileRecord | null;
    onClose: () => void;
    onAction: (action: string, notes: string) => void;
}

const FileActionPanel = ({ file, onClose, onAction }: FileActionPanelProps) => {
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'HISTORY' | 'ACTION'>('DETAILS');
    const [actionType, setActionType] = useState<
        'FORWARD' | 'QUERY' | 'APPROVE' | 'REJECT' | 'REASSIGN' | 'OVERRIDE' | 'EXTEND_SLA' | 'INQUIRY'
    >('FORWARD');
    const [notes, setNotes] = useState('');

    if (!file) return null;

    const handleActionSubmit = () => {
        onAction(actionType, notes);
        setNotes('');
        onClose();
    };

    const getHoldDuration = () => {
        if (!file.receivedDate || file.currentOfficerId !== 'OFFICER-001') return null;
        const days = differenceInDays(new Date(), new Date(file.receivedDate));
        return (
            <div className="flex items-center gap-1.5 mt-1 text-[#1D4E89] bg-blue-50/50 px-2 py-1 rounded w-fit border border-blue-100">
                <Clock3 size={12} />
                <span className="text-[10px] font-bold tracking-wide">HELD BY YOU: {days} {days === 1 ? 'DAY' : 'DAYS'}</span>
            </div>
        );
    };

    return (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 z-50 flex flex-col">
            {/* Header */}
            <div className="bg-[#1D4E89] text-white p-6 flex justify-between items-start shrink-0">
                <div>
                    <h2 className="text-xl font-bold font-mono tracking-tight">{file.fileId}</h2>
                    <p className="text-sm text-blue-100 mt-1 line-clamp-1">{file.subject}</p>
                </div>
                <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
                {(['DETAILS', 'HISTORY', 'ACTION'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors
                            ${activeTab === tab
                                ? 'bg-white text-[#1D4E89] border-b-2 border-[#1D4E89]'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* DETAILS TAB */}
                {activeTab === 'DETAILS' && (
                    <div className="space-y-6">
                        <Section title="Applicant Details">
                            <Field label="Citizen Name" value={file.citizenName} />
                            <Field label="Category" value={file.category} />
                            <Field label="Application Date" value={new Date(file.createdDate).toLocaleDateString()} />
                        </Section>

                        <Section title="Current Status">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${file.isDelayed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {file.status.replace('_', ' ')}
                                </span>
                                {file.isDelayed && <span className="text-red-600 text-xs font-bold animate-pulse">OVERDUE</span>}
                            </div>
                            <div>
                                <Field label="Current Holder" value={file.currentOfficerId === 'OFFICER-001' ? 'You' : file.currentOfficerId} />
                                {getHoldDuration()}
                            </div>
                            <Field label="Last Action By" value={file.lastActionBy} />
                        </Section>

                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <h4 className="text-blue-800 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Clock size={14} /> SLA Monitor
                            </h4>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-2xl font-bold text-blue-900">{file.slaDays}</p>
                                    <p className="text-[10px] text-blue-600 uppercase">Days Allowed</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-blue-700 font-medium">Target: {new Date(new Date(file.createdDate).getTime() + file.slaDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'HISTORY' && (
                    <div className="space-y-0 relative border-l-2 border-slate-200 ml-3 my-2">
                        {file.movementHistory.map((log) => (
                            <div key={log.id} className="relative pl-8 pb-8 last:pb-0">
                                <div className="absolute -left-[9px] top-0 bg-white border-2 border-slate-300 rounded-full p-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full" />
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded p-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-slate-700 uppercase">{log.action.replace('_', ' ')}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                                        <User size={12} />
                                        <span>{log.fromOfficerName}</span>
                                        <span className="text-slate-300">→</span>
                                        <span>{log.toOfficerName}</span>
                                    </div>
                                    {log.notes && (
                                        <p className="text-xs text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                                            "{log.notes}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ACTION TAB */}
                {activeTab === 'ACTION' && (
                    <div className="space-y-6">
                        {file.status === 'ESCALATED' ? (
                            <div className="grid grid-cols-2 gap-3">
                                <ActionButton
                                    type="REASSIGN"
                                    icon={Send}
                                    active={actionType === 'REASSIGN'}
                                    onClick={() => setActionType('REASSIGN')}
                                    styleClass="hover:bg-blue-50 hover:border-[#1D4E89] hover:text-[#1D4E89] active-style:bg-[#1D4E89] active-style:text-white active-style:border-[#1D4E89]"
                                />
                                <ActionButton
                                    type="OVERRIDE"
                                    icon={CheckCircle}
                                    active={actionType === 'OVERRIDE'}
                                    onClick={() => setActionType('OVERRIDE')}
                                    styleClass="hover:bg-green-50 hover:border-green-600 hover:text-green-700 active-style:bg-green-600 active-style:text-white active-style:border-green-600"
                                />
                                <ActionButton
                                    type="EXTEND SLA"
                                    icon={Clock}
                                    active={actionType === 'EXTEND_SLA'}
                                    onClick={() => setActionType('EXTEND_SLA')}
                                    styleClass="hover:bg-purple-50 hover:border-purple-600 hover:text-purple-700 active-style:bg-purple-50 active-style:text-purple-700 active-style:border-purple-600"
                                />
                                <ActionButton
                                    type="INQUIRY"
                                    icon={AlertCircle}
                                    active={actionType === 'INQUIRY'}
                                    onClick={() => setActionType('INQUIRY')}
                                    styleClass="hover:bg-red-50 hover:border-red-500 hover:text-red-600 active-style:bg-red-50 active-style:text-red-700 active-style:border-red-500"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <ActionButton
                                    type="APPROVE"
                                    icon={CheckCircle}
                                    active={actionType === 'APPROVE'}
                                    onClick={() => setActionType('APPROVE')}
                                    styleClass="hover:bg-green-50 hover:border-green-600 hover:text-green-700 active-style:bg-green-600 active-style:text-white active-style:border-green-600"
                                />
                                <ActionButton
                                    type="FORWARD"
                                    icon={Send}
                                    active={actionType === 'FORWARD'}
                                    onClick={() => setActionType('FORWARD')}
                                    styleClass="hover:bg-blue-50 hover:border-[#1D4E89] hover:text-[#1D4E89] active-style:bg-[#1D4E89] active-style:text-white active-style:border-[#1D4E89]"
                                />
                                <ActionButton
                                    type="QUERY"
                                    icon={AlertCircle}
                                    active={actionType === 'QUERY'}
                                    onClick={() => setActionType('QUERY')}
                                    styleClass="hover:bg-amber-50 hover:border-amber-500 hover:text-amber-600 active-style:bg-amber-50 active-style:text-amber-700 active-style:border-amber-500"
                                />
                                <ActionButton
                                    type="REJECT"
                                    icon={X}
                                    active={actionType === 'REJECT'}
                                    onClick={() => setActionType('REJECT')}
                                    styleClass="hover:bg-red-50 hover:border-red-500 hover:text-red-600 active-style:bg-red-50 active-style:text-red-700 active-style:border-red-500"
                                />
                            </div>
                        )}

                        <div className="bg-slate-50 p-4 rounded border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">
                                {actionType} Details
                            </h4>

                            {(actionType === 'FORWARD' || actionType === 'REASSIGN') && (
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        {actionType === 'REASSIGN' ? 'Select New Custodian' : 'Select Next Officer'}
                                    </label>
                                    <select className="w-full text-sm border-slate-300 rounded p-2 border bg-white focus:ring-2 focus:ring-[#1D4E89] outline-none">
                                        <option>Select {actionType === 'REASSIGN' ? 'Clerk/Officer' : 'Officer'}...</option>
                                        <option value="CLERK-01">Clerk Sharma (Ward-1)</option>
                                        <option value="CLERK-04">Clerk Gupta (Ward-2)</option>
                                        <option value="OFFICER-002">Section Officer Rao</option>
                                    </select>
                                </div>
                            )}

                            {actionType === 'EXTEND_SLA' && (
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Extension Duration (Days)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        className="w-full text-sm border-slate-300 rounded p-2 border bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="e.g. 7"
                                    />
                                </div>
                            )}

                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                {actionType === 'QUERY' ? 'Query Description' :
                                    actionType === 'INQUIRY' ? 'Formal Inquiry Details' :
                                        actionType === 'OVERRIDE' ? 'Override Justification' : 'Notes / Remarks'}
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className={`w-full h-32 text-sm border-slate-300 rounded p-2 border bg-white focus:ring-2 outline-none resize-none
                                    ${actionType === 'INQUIRY' || actionType === 'REJECT' ? 'focus:ring-red-500' :
                                        actionType === 'APPROVE' || actionType === 'OVERRIDE' ? 'focus:ring-green-500' :
                                            actionType === 'QUERY' ? 'focus:ring-amber-500' :
                                                actionType === 'EXTEND_SLA' ? 'focus:ring-purple-500' :
                                                    'focus:ring-[#1D4E89]'
                                    }`}
                                placeholder="Enter details..."
                            />
                        </div>

                        <button
                            onClick={handleActionSubmit}
                            className={`w-full font-bold py-3 rounded shadow-md transition-colors uppercase tracking-wider text-sm flex items-center justify-center gap-2 text-white
                                ${actionType === 'APPROVE' || actionType === 'OVERRIDE' ? 'bg-green-600 hover:bg-green-700' :
                                    actionType === 'FORWARD' || actionType === 'REASSIGN' ? 'bg-[#1D4E89] hover:bg-blue-800' :
                                        actionType === 'QUERY' ? 'bg-amber-600 hover:bg-amber-700' :
                                            actionType === 'EXTEND_SLA' ? 'bg-purple-600 hover:bg-purple-700' :
                                                'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            Confirm {actionType.replace('_', ' ')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="border-b border-slate-100 pb-4 last:border-0">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{title}</h4>
        <div className="space-y-3">{children}</div>
    </div>
);

const Field = ({ label, value }: { label: string, value: string | number }) => (
    <div>
        <span className="text-[10px] text-slate-400 uppercase font-bold block">{label}</span>
        <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
);

const ActionButton = ({ type, icon: Icon, active, onClick, styleClass }: { type: string, icon: any, active: boolean, onClick: () => void, styleClass: string }) => {
    // Parse styleClass to extract active styles
    const classes = styleClass.split(' ');
    const activeClasses = classes.filter(c => c.startsWith('active-style:')).map(c => c.replace('active-style:', '')).join(' ');
    const hoverClasses = classes.filter(c => !c.startsWith('active-style:')).join(' ');

    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-center justify-center p-4 rounded border transition-all shadow-sm
                ${active
                    ? activeClasses + ' ring-2 ring-offset-1 ring-current'
                    : 'bg-white border-slate-200 text-slate-500 ' + hoverClasses}
            `}
        >
            <Icon size={24} className="mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{type}</span>
        </button>
    );
};

export default FileActionPanel;
