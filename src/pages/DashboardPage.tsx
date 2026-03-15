import { useState, useEffect } from 'react';
import { FileText, Send, ArrowRight } from 'lucide-react';
import HandoverModal from '../components/Handover/HandoverModal';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardStats } from '../services/fileService';
import { useAuth } from '../contexts/AuthContext';

interface QueueFile {
    id: string;
    fileId: string;
    service: string;
    applicant: string;
}

const DashboardPage = () => {
    const { user } = useAuth();
    // Stats State
    const [stats, setStats] = useState({
        registered: 0,
        dispatched: 0
    });

    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [forwardingQueue, setForwardingQueue] = useState<QueueFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<{ fileId: string, service: string } | null>(null);
    const [isHandoverOpen, setIsHandoverOpen] = useState(false);

    const fetchStats = async () => {
        try {
            const data = await getDashboardStats();

            // Map all files to recent activity
            const allFiles = data.recentFiles || [];

            // Stats
            setStats({
                registered: data.totalFiles || allFiles.length,
                dispatched: data.approved || 0
            });

            // Recent Activity — last 10 files
            setRecentActivity(allFiles.slice(0, 10).map((file: any) => {
                const date = file.createdAt ? new Date(file.createdAt) : new Date();
                return {
                    time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    fileId: file.id,
                    applicant: file.citizenName || 'Unknown',
                    service: file.category || 'Unknown'
                };
            }));

            // Forwarding Queue — files pending that haven't been forwarded yet
            const pending = allFiles
                .filter((f: any) => f.status === 'PENDING_REVIEW' && !f.forwardedAt)
                .map((file: any, i: number) => ({
                    id: String(i + 1),
                    fileId: file.id,
                    service: file.category || 'GENERAL',
                    applicant: file.citizenName || 'Unknown',
                }));
            setForwardingQueue(pending);

        } catch (err) {
            console.error("Failed to load dashboard stats:", err);
        }
    };

    useEffect(() => {
        fetchStats();

        // Auto-refresh when a new file is created
        const handleFileCreated = () => {
            setTimeout(() => fetchStats(), 500);
        };
        window.addEventListener('fileCreated', handleFileCreated);
        return () => window.removeEventListener('fileCreated', handleFileCreated);
    }, []);

    const handleProcessClick = (file: QueueFile) => {
        setSelectedFile({ fileId: file.fileId, service: file.service });
        setIsHandoverOpen(true);
    };

    const handleHandoverSuccess = () => {
        if (selectedFile) {
            // Remove from queue
            setForwardingQueue(prev => prev.filter(item => item.fileId !== selectedFile.fileId));
            // Update stats
            setStats(prev => ({
                ...prev,
                dispatched: prev.dispatched + 1
            }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Clerk Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">{user?.ward || 'Ward'} • Shift A</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Status</p>
                    <p className="text-sm font-bold text-status-bound flex items-center gap-2 justify-end">
                        <span className="w-2 h-2 rounded-full bg-status-bound"></span>
                        ONLINE
                    </p>
                </div>
            </div>

            {/* Stats Grid - Balanced Layout */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-slate-300 rounded p-6 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-3">Files Registered Today</p>
                        <p className="text-4xl font-bold text-slate-800 leading-none">{stats.registered}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full border border-blue-100">
                        <FileText className="text-primary" size={32} strokeWidth={1.5} />
                    </div>
                </div>
                <div className="bg-white border border-slate-300 rounded p-6 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-3">Files Dispatched</p>
                        <p className="text-4xl font-bold text-slate-800 leading-none">{stats.dispatched}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full border border-green-100">
                        <Send className="text-green-600" size={32} strokeWidth={1.5} />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity Log */}
                <div className="bg-white border border-slate-300 rounded overflow-hidden flex flex-col h-[400px]">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Recent Activity Log</h3>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#1D4E89] text-white text-xs uppercase font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2">Time</th>
                                    <th className="px-4 py-2">File ID</th>
                                    <th className="px-4 py-2">Applicant</th>
                                    <th className="px-4 py-2">Service Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((item, i) => (
                                        <tr key={i} className="odd:bg-white even:bg-[#F8FAFC] hover:bg-yellow-50">
                                            <td className="px-4 py-2 text-slate-500 tabular-nums font-medium">{item.time}</td>
                                            <td className="px-4 py-2 text-primary font-bold font-['Noto_Sans']">{item.fileId}</td>
                                            <td className="px-4 py-2 text-slate-800 font-bold">{item.applicant}</td>
                                            <td className="px-4 py-2 text-slate-600 text-xs uppercase">{item.service}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic text-xs">
                                            No recent activity. Create a file to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PENDING FORWARDING QUEUE */}
                <div className="bg-white border border-slate-300 rounded overflow-hidden flex flex-col h-[400px]">
                    <div className="bg-[#1D4E89] text-white px-4 py-3 flex justify-between items-center shrink-0">
                        <h3 className="text-sm font-bold uppercase tracking-wide">Pending Forwarding Queue</h3>
                        <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-bold">{forwardingQueue.length} Pending</span>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-2">File ID</th>
                                    <th className="px-4 py-2">Service Type</th>
                                    <th className="px-4 py-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <AnimatePresence>
                                    {forwardingQueue.map((file) => (
                                        <motion.tr
                                            key={file.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="odd:bg-white even:bg-[#F8FAFC] hover:bg-blue-50 transition-colors group cursor-pointer"
                                            onClick={() => handleProcessClick(file)}
                                        >
                                            <td className="px-4 py-3 font-bold text-slate-800 font-['Noto_Sans']">{file.fileId}</td>
                                            <td className="px-4 py-3 text-xs uppercase text-slate-600 font-medium">{file.service.replace(/_/g, ' ')}</td>
                                            <td className="px-4 py-2 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleProcessClick(file); }}
                                                    className="border border-[#1D4E89] text-[#1D4E89] px-3 py-1 rounded text-[10px] font-bold uppercase hover:bg-[#1D4E89] hover:text-white transition-colors flex items-center gap-1 ml-auto"
                                                >
                                                    Process <ArrowRight size={10} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {forwardingQueue.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic text-xs">
                                            All files have been successfully dispatched.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <HandoverModal
                isOpen={isHandoverOpen}
                onClose={() => setIsHandoverOpen(false)}
                onSuccess={handleHandoverSuccess}
                initialFileId={selectedFile?.fileId}
                initialServiceType={selectedFile?.service}
            />
        </div>
    );
};

export default DashboardPage;
