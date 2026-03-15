import { useEffect, useState } from 'react';
import { Activity, Target, Clock, Filter, AlertTriangle, TrendingDown, UserX } from 'lucide-react';
import OfficerPerformanceWidget from '../../components/OfficerDashboard/OfficerPerformanceWidget';
import { getOfficerDashboard } from '../../services/fileService';

interface OfficerStats {
    totalFilesAssigned: number;
    totalHandled: number;
    slaCompliance: number;
    avgProcessingDays: number;
    slaBreaches: number;
    escalatedCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalDecisions: number;
}

const PerformanceDashboardPage = () => {
    const [stats, setStats] = useState<OfficerStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getOfficerDashboard();
                setStats(data.stats);
            } catch (err) {
                console.error('Failed to load performance data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Derive metrics from stats
    const slaCompliance = stats?.slaCompliance ?? 0;
    const avgBuffer = stats ? Math.max(0, 7 - stats.avgProcessingDays) : 0;
    const delayLiability = stats && stats.totalHandled > 0
        ? Math.round((stats.slaBreaches / Math.max(stats.totalHandled, 1)) * 100)
        : 0;
    const reversalRate = stats && stats.totalDecisions > 0
        ? Math.round((stats.rejectedCount / stats.totalDecisions) * 100 * 10) / 10
        : 0;

    return (
        <div className="flex flex-col h-full bg-slate-50/50 overflow-y-auto pr-2 pb-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="text-primary" size={24} />
                        My Performance Analytics
                    </h1>
                    <p className="text-sm text-slate-500">Track your SLA adherence, processing speeds, and clearance trends.</p>
                </div>

                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 bg-white shadow-sm">
                    <Filter size={16} />
                    Current Period
                </button>
            </div>

            {loading ? (
                <div className="text-center text-sm text-slate-500 py-8">Loading performance data...</div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                    <div className="xl:col-span-1 border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                        <OfficerPerformanceWidget />
                    </div>

                    <div className="xl:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 text-[#1D4E89] rounded-lg">
                                    <Target size={20} />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SLA Compliance</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-slate-800">{slaCompliance}%</span>
                                <span className={`text-xs font-bold mb-1 ${slaCompliance >= 90 ? 'text-green-500' : 'text-red-500'}`}>
                                    {slaCompliance >= 90 ? '✓ Good' : '⚠ Below Target'}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Based on all tracked SLAs.</p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <Clock size={20} />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg SLA Buffer</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-slate-800">{avgBuffer.toFixed(1)}<span className="text-xl">d</span></span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Cleared before SLA breach.</p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-red-50/30" />
                            <div className="relative z-10 flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                    <TrendingDown size={20} />
                                </div>
                                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Delay Liability</span>
                            </div>
                            <div className="relative z-10 flex items-end gap-2">
                                <span className="text-3xl font-black text-red-700">{delayLiability}%</span>
                            </div>
                            <p className="relative z-10 text-[10px] text-red-500 mt-2 font-medium">Of delays isolated to your desk.</p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-amber-50/30" />
                            <div className="relative z-10 flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <UserX size={20} />
                                </div>
                                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Rejection Rate</span>
                            </div>
                            <div className="relative z-10 flex items-end gap-2">
                                <span className="text-3xl font-black text-amber-700">{reversalRate}%</span>
                            </div>
                            <p className="relative z-10 text-[10px] text-amber-600/80 mt-2 font-medium">Of decisions resulting in rejection.</p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-sm flex flex-col justify-center relative overflow-hidden lg:col-span-2">
                            <div className="absolute inset-0 bg-purple-50/30" />
                            <div className="relative z-10 flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <AlertTriangle size={20} />
                                </div>
                                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Escalation Frequency</span>
                            </div>
                            <div className="relative z-10 flex items-baseline gap-4">
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-black text-purple-700">{stats?.escalatedCount ?? 0}</span>
                                    <span className="text-xs font-bold text-purple-500 mb-1">Files</span>
                                </div>
                                <div className="h-8 border-r border-purple-200"></div>
                                <p className="text-xs text-purple-600/80 font-medium">Currently escalated due to SLA breaches.</p>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="col-span-1 lg:col-span-2 xl:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-4">
                            <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Summary Overview</h3>

                            <div className="grid grid-cols-4 gap-6">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-[#1D4E89]">{stats?.totalFilesAssigned ?? 0}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase mt-1">Currently Assigned</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-slate-800">{stats?.totalHandled ?? 0}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase mt-1">Total Movements</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-green-600">{stats?.approvedCount ?? 0}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase mt-1">Approved</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-red-600">{stats?.rejectedCount ?? 0}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase mt-1">Rejected</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformanceDashboardPage;
