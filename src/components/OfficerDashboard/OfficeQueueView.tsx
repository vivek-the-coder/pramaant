import { useState } from 'react';
import { ArrowLeft, Search, FileText, ArrowRight, User } from 'lucide-react';

interface FileRecord {
    id: string;
    receiptTime: string;
    fileId: string;
    fromClerk: string;
    clerkId: string;
    serviceCategory: string;
    applicantName: string;
    status: 'PENDING' | 'QUERY' | 'APPROVED';
}

interface OfficeQueueViewProps {
    officeName: string;
    officeCode: string;
    files: FileRecord[];
    onBack: () => void;
    onFileClick: (file: FileRecord) => void;
}

const OfficeQueueView = ({ officeName, officeCode, files, onBack, onFileClick }: OfficeQueueViewProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFiles = files.filter(f =>
        f.fileId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.applicantName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group files by Clerk for the view
    const groupedFiles = filteredFiles.reduce((acc, file) => {
        if (!acc[file.clerkId]) {
            acc[file.clerkId] = {
                clerkName: file.fromClerk,
                files: []
            };
        }
        acc[file.clerkId].files.push(file);
        return acc;
    }, {} as Record<string, { clerkName: string, files: FileRecord[] }>);

    return (
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-[#1D4E89] text-white p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/20 font-mono">
                                {officeCode}
                            </span>
                            <h2 className="text-lg font-bold uppercase tracking-wide leading-none">{officeName}</h2>
                        </div>
                        <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider font-medium">Office Specific Queue</p>
                    </div>
                </div>

                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search File ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded pl-9 pr-3 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/20 transition-colors"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50" size={14} />
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto bg-slate-50 p-4">
                {Object.keys(groupedFiles).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <FileText size={48} className="mb-2 opacity-20" />
                        <p className="font-bold">No files found</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedFiles).map(([clerkId, { clerkName, files }]) => (
                            <div key={clerkId} className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                                {/* Clerk Group Header */}
                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-white rounded border border-slate-200">
                                            <User size={14} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-700 uppercase">{clerkName}</span>
                                            <span className="text-[10px] text-slate-400 font-mono ml-2">ID: {clerkId}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">{files.length} Files</span>
                                </div>

                                {/* Table */}
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-2 w-32">Time</th>
                                            <th className="px-4 py-2">File ID</th>
                                            <th className="px-4 py-2">Service</th>
                                            <th className="px-4 py-2">Applicant</th>
                                            <th className="px-4 py-2 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {files.map((file, idx) => (
                                            <tr
                                                key={file.id}
                                                onClick={() => onFileClick(file)}
                                                className={`
                                                    cursor-pointer hover:bg-blue-50/50 transition-colors group
                                                    ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}
                                                `}
                                            >
                                                <td className="px-4 py-2 text-slate-500 text-xs font-mono">{file.receiptTime}</td>
                                                <td className="px-4 py-2 font-bold text-slate-700 font-mono text-xs group-hover:text-[#1D4E89] transition-colors">{file.fileId}</td>
                                                <td className="px-4 py-2 text-xs uppercase text-slate-600">
                                                    <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">{file.serviceCategory}</span>
                                                </td>
                                                <td className="px-4 py-2 font-bold text-slate-800 text-xs uppercase">{file.applicantName}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <button className="text-slate-300 group-hover:text-[#1D4E89] transition-colors">
                                                        <ArrowRight size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfficeQueueView;
