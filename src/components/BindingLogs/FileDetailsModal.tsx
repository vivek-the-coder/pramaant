import { X, Printer, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

const FileDetailsModal = ({ isOpen, onClose, data }: FileDetailsModalProps) => {
    if (!data) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-white w-full max-w-2xl rounded shadow-lg overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="bg-[#1D4E89] text-white px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold uppercase tracking-wide">File Reference: {data.fileId}</h3>
                                <p className="text-[10px] opacity-80 uppercase tracking-wider mt-0.5">Government Property - Confidential</p>
                            </div>
                            <button onClick={onClose} className="hover:bg-white/10 rounded p-1 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                            {/* Primary Info */}
                            <div className="bg-white border border-slate-300 rounded p-4 mb-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Registrant Particulars</h4>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Applicant Name</p>
                                        <p className="font-bold text-slate-800">{data.applicantName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Service Requested</p>
                                        <p className="font-bold text-slate-800 uppercase">{data.serviceType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Digital Reference No</p>
                                        <p className="font-mono text-slate-600 font-medium text-xs">{data.transactionId || data.refNo}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Registration Date</p>
                                        <p className="font-bold text-slate-800 tabular-nums">{data.timestamp}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Movement History */}
                            <div className="bg-white border border-slate-300 rounded overflow-hidden">
                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">File Movement History</h4>
                                </div>
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-2 w-32">Timestamp</th>
                                            <th className="px-4 py-2">Action</th>
                                            <th className="px-4 py-2">Officer</th>
                                            <th className="px-4 py-2 w-24">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr>
                                            <td className="px-4 py-3 text-slate-500 tabular-nums">04-02-2026 12:15</td>
                                            <td className="px-4 py-3 font-bold text-slate-800">Registration</td>
                                            <td className="px-4 py-3 text-slate-600">Sachin Singh (Clerk)</td>
                                            <td className="px-4 py-3 text-green-700 font-bold uppercase">Success</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-slate-500 tabular-nums">04-02-2026 09:30</td>
                                            <td className="px-4 py-3 text-slate-600">Document Scan</td>
                                            <td className="px-4 py-3 text-slate-600">Auto-System</td>
                                            <td className="px-4 py-3 text-slate-500 font-bold uppercase">Logged</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Shield size={14} />
                                <p className="text-[10px] font-bold uppercase tracking-wide">
                                    DISCLAIMER: For Official Use Only. Unauthorized Access is Punishable.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wide hover:bg-slate-200 rounded transition-colors">
                                    Close Record
                                </button>
                                <button className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wide rounded hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-sm">
                                    <Printer size={14} />
                                    Print Extract
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FileDetailsModal;
