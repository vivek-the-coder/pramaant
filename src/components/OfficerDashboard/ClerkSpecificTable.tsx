import { FileText, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface FileRecord {
    id: string;
    receiptTime: string;
    fileId: string;
    serviceCategory: string;
    applicantName: string; // Added field
    status: 'PENDING' | 'QUERY' | 'APPROVED';
}

interface ClerkSpecificTableProps {
    clerkName: string;
    clerkId: string;
    files: FileRecord[];
    onBack: () => void;
    onFileClick: (file: FileRecord) => void;
    onReviewAll: () => void;
}

const ClerkSpecificTable = ({ clerkName, clerkId, files, onBack, onFileClick, onReviewAll }: ClerkSpecificTableProps) => {
    return (
        <div className="bg-white border border-slate-200 rounded shadow-sm flex flex-col h-full overflow-hidden">
            <div className="bg-[#1D4E89] px-4 py-3 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="h-6 w-px bg-white/20"></div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide leading-none">Desk Queue: {clerkName}</h3>
                        <p className="text-[10px] text-white/70 font-mono mt-0.5 uppercase">ID: {clerkId}</p>
                    </div>
                </div>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20">
                    {files.length} FILES
                </span>
            </div>

            <div className="overflow-auto flex-1">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-5 py-3 border-b border-slate-200">Time Received</th>
                            <th className="px-5 py-3 border-b border-slate-200">File ID</th>
                            <th className="px-5 py-3 border-b border-slate-200">Service Type</th>
                            <th className="px-5 py-3 border-b border-slate-200">Applicant Name</th>
                            <th className="px-5 py-3 border-b border-slate-200 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {files.map((file, index) => (
                            <tr
                                key={file.id}
                                onClick={() => onFileClick(file)}
                                className={`
                                    cursor-pointer transition-colors group
                                    ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                                    hover:bg-blue-50/80
                                `}
                            >
                                <td className="px-5 py-3 text-slate-500 font-medium font-mono text-xs">{file.receiptTime}</td>
                                <td className="px-5 py-3">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold font-mono border border-slate-200 group-hover:border-blue-200 group-hover:bg-white transition-colors">
                                        {file.fileId}
                                    </span>
                                </td>
                                <td className="px-5 py-3">
                                    <span className="text-xs font-bold text-[#1D4E89] uppercase tracking-tight bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                        {file.serviceCategory}
                                    </span>
                                </td>
                                <td className="px-5 py-3 font-bold text-slate-800 text-xs uppercase">
                                    {file.applicantName}
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <button className="text-slate-400 group-hover:text-[#1D4E89] transition-colors">
                                        <ArrowRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {files.length === 0 && (
                    <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                        <FileText size={48} className="text-slate-200 mb-2" />
                        <p className="text-sm font-medium">No files pending from this desk.</p>
                    </div>
                )}
            </div>

            {files.length > 0 && (
                <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
                    <button
                        onClick={onReviewAll}
                        className="w-full bg-[#1D4E89] hover:bg-[#163C6A] text-white font-bold py-3 rounded shadow-sm hover:shadow transition-all uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={18} />
                        Review All From This Desk
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClerkSpecificTable;
