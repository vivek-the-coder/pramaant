import { X, FileText, History, Check, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileScrutinyModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileId: string;
}

const FileScrutinyModal = ({ isOpen, onClose, fileId }: FileScrutinyModalProps) => {
    if (!isOpen) return null;

    const movementHistory = [
        { stage: 'Verification', user: 'Sachin Singh (Clerk)', time: '10:45 AM', status: 'VERIFIED', comment: 'All documents valid.' },
        { stage: 'Registration', user: 'System', time: '10:30 AM', status: 'INITIATED', comment: 'Application received.' },
    ];

    const documents = [
        'Aadhar Card', 'Incomde Proof', 'Ration Card', 'Self Declaration'
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-[#1D4E89] text-white px-6 py-4 flex items-center justify-between shrink-0">
                        <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">File Scrutiny</p>
                            <h2 className="text-xl font-bold font-mono tracking-tight">{fileId}</h2>
                        </div>
                        <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left Col: Details & History */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* File Overview */}
                                <div className="bg-white p-5 rounded border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-[#1D4E89] uppercase tracking-wide mb-4 border-b border-slate-100 pb-2">Application Details</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold mb-1">Applicant Name</p>
                                            <p className="font-bold text-slate-800">Vraj Padaria</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold mb-1">Service Type</p>
                                            <p className="font-bold text-slate-800">Caste Certificate</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold mb-1">Contact</p>
                                            <p className="font-medium text-slate-700">+91 98765 43210</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold mb-1">Taluka/Ward</p>
                                            <p className="font-medium text-slate-700">Rajpipla / Ward-1</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-slate-400 text-xs uppercase font-bold mb-2">Attached Documents ({documents.length})</p>
                                        <div className="flex flex-wrap gap-2">
                                            {documents.map((doc, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-white transition-colors cursor-pointer">
                                                    <FileText size={12} /> {doc}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Movement History */}
                                <div className="bg-white p-5 rounded border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-[#1D4E89] uppercase tracking-wide mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                        <History size={16} /> Movement History
                                    </h3>
                                    <div className="space-y-4">
                                        {movementHistory.map((item, index) => (
                                            <div key={index} className="flex gap-4 relative">
                                                {/* Timeline Line */}
                                                {index !== movementHistory.length - 1 && (
                                                    <div className="absolute left-[11px] top-6 bottom-[-20px] w-0.5 bg-slate-200"></div>
                                                )}

                                                <div className="mt-1">
                                                    <div className="w-6 h-6 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 shadow-sm z-10 relative">
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-slate-50 p-3 rounded border border-slate-100">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="font-bold text-sm text-slate-800">{item.stage}</p>
                                                        <span className="text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">{item.time}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mb-2">Performed by <span className="font-bold text-slate-700">{item.user}</span></p>

                                                    <div className="text-xs bg-white p-2 rounded border border-blue-50/50 text-slate-600 italic">
                                                        "{item.comment}"
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Actions */}
                            <div className="space-y-4">
                                <div className="bg-white p-5 rounded border border-slate-200 shadow-sm h-full flex flex-col">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Officer Decision</h3>

                                    <div className="space-y-3 flex-1">
                                        <button className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                                            <div className="text-left">
                                                <p className="font-bold text-sm uppercase tracking-wide group-hover:translate-x-0.5 transition-transform">Approve & Sign</p>
                                                <span className="text-[10px] opacity-80">Digitally singed verification</span>
                                            </div>
                                            <div className="bg-green-800/20 p-2 rounded-full">
                                                <CheckCircle2 size={24} />
                                            </div>
                                        </button>

                                        <button className="w-full bg-amber-500 hover:bg-amber-600 text-white p-4 rounded shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                                            <div className="text-left">
                                                <p className="font-bold text-sm uppercase tracking-wide group-hover:translate-x-0.5 transition-transform">Raise Query</p>
                                                <span className="text-[10px] opacity-80">Return to Clerk with remarks</span>
                                            </div>
                                            <div className="bg-amber-700/20 p-2 rounded-full">
                                                <HelpCircle size={24} />
                                            </div>
                                        </button>

                                        <button className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                                            <div className="text-left">
                                                <p className="font-bold text-sm uppercase tracking-wide group-hover:translate-x-0.5 transition-transform">Reject File</p>
                                                <span className="text-[10px] opacity-80">Permanent rejection of application</span>
                                            </div>
                                            <div className="bg-red-800/20 p-2 rounded-full">
                                                <AlertTriangle size={24} />
                                            </div>
                                        </button>
                                    </div>

                                    <div className="mt-8 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800 flex gap-2 items-start">
                                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                        <p>
                                            <strong>Note:</strong> Applying digital signature will maximize the window for authentication. Ensure USB token is inserted.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FileScrutinyModal;
