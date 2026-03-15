import { useState, useEffect } from 'react';
import { Search, AlertTriangle, ShieldAlert, FileWarning } from 'lucide-react';
import EscalatedFilesTable from '../../components/OfficerDashboard/EscalatedFilesTable';
import FileActionPanel from '../../components/OfficerDashboard/FileActionPanel';
import type { FileRecord } from '../../types/OfficerTypes';
import { getOfficerDashboard } from '../../services/fileService';

const EscalationCenterPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
    const [escalatedFiles, setEscalatedFiles] = useState<FileRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getOfficerDashboard();
                setEscalatedFiles(data.escalatedFiles || []);
            } catch (err) {
                console.error('Failed to load escalation data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredFiles = escalatedFiles.filter(file => {
        const matchesSearch =
            file.fileId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.citizenName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const autoEscalatedCount = escalatedFiles.filter(f => f.lastActionBy === 'System' || f.lastActionBy.toLowerCase().includes('auto')).length;
    const manualEscalatedCount = escalatedFiles.length - autoEscalatedCount;

    const criticalCount = escalatedFiles.filter(f => {
        const lastActionDate = new Date(f.lastActionDate);
        const hoursSinceEscalation = (Date.now() - lastActionDate.getTime()) / (1000 * 60 * 60);
        return hoursSinceEscalation > 48;
    }).length;

    const handleAction = (action: string, notes: string) => {
        console.log(`Action: ${action} on file ${selectedFile?.fileId} with notes: ${notes}`);
        setSelectedFile(null);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={24} />
                        Escalation Center
                    </h1>
                    <p className="text-sm text-slate-500">Immediate accountability required for breached SLAs and high-priority flags.</p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-50/30 group-hover:bg-red-50/50 transition-colors" />
                    <div className="p-3 bg-red-100 rounded-lg text-red-600 relative z-10 animate-pulse">
                        <ShieldAlert size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Critical (&gt;48h Unresolved)</p>
                        <p className="text-2xl font-bold text-red-700">{criticalCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">SLA Auto-Escalations</p>
                        <p className="text-2xl font-bold text-slate-800">{autoEscalatedCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                        <FileWarning size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Manual Interventions</p>
                        <p className="text-2xl font-bold text-slate-800">{manualEscalatedCount}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Search escalated files by ID or Citizen Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm shadow-sm"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden">
                {loading ? (
                    <div className="text-center text-sm text-slate-500 py-8">Loading escalated files...</div>
                ) : (
                    <EscalatedFilesTable
                        files={filteredFiles}
                        onActionClick={(file) => setSelectedFile(file)}
                    />
                )}
            </div>

            {/* Slide-over Panel for Actions */}
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

export default EscalationCenterPage;
