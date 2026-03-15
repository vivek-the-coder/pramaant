import { FileText, ArrowRight } from 'lucide-react';

interface FileRecord {
    id: string;
    receiptTime: string;
    fileId: string;
    fromClerk: string;
    clerkId: string;
    serviceCategory: string;
    status: 'PENDING' | 'QUERY' | 'APPROVED';
}

interface OfficerWorklistTableProps {
    files: FileRecord[];
    onFileClick: (file: FileRecord) => void;
}

const OfficerWorklistTable = ({ files, onFileClick }: OfficerWorklistTableProps) => {
    return (
        <div className="bg-white border border-slate-200 rounded shadow-sm flex flex-col h-full overflow-hidden">
            <div className="bg-[#1D4E89] px-4 py-3 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <FileText className="text-white/80" size={16} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Files Awaiting Official Review</h3>
                </div>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20">
                    {files.length} PENDING
                </span>
            </div>

            <div className="overflow-auto flex-1">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-5 py-3 border-b border-slate-200 w-32">Receipt Time</th>
                            <th className="px-5 py-3 border-b border-slate-200">File ID</th>
                            <th className="px-5 py-3 border-b border-slate-200">From Clerk (ID)</th>
                            <th className="px-5 py-3 border-b border-slate-200">Service Category</th>
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
                                    <div className="flex flex-col">
                                        <span className="text-slate-800 font-bold text-xs">{file.fromClerk}</span>
                                        <span className="text-slate-400 text-[10px] uppercase font-mono">ID: {file.clerkId}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3">
                                    <span className="text-xs font-bold text-[#1D4E89] uppercase tracking-tight bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                        {file.serviceCategory}
                                    </span>
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
                        <p className="text-sm font-medium">No files pending review.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfficerWorklistTable;
