import { useEffect, useState } from 'react';
import { TrendingUp, Award, Clock } from 'lucide-react';
import { getOfficerDashboard } from '../../services/fileService';

interface OfficerStats {
    totalFilesAssigned: number;
    totalHandled: number;
    slaCompliance: number;
    avgProcessingDays: number;
}

const OfficerPerformanceWidget = () => {
    const [stats, setStats] = useState<OfficerStats | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getOfficerDashboard();
                setStats(data.stats);
            } catch (err) {
                console.error('Failed to load performance widget:', err);
            }
        };
        fetchData();
    }, []);

    const now = new Date();
    const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-[#1D4E89] p-3 rounded-full">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Your Performance</p>
                    <p className="font-bold text-slate-900 text-lg">{monthYear}</p>
                </div>
            </div>

            <div className="flex gap-6 shrink-0">
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xl">
                        <Clock size={16} className="text-slate-400" />
                        {stats?.avgProcessingDays?.toFixed(1) || '—'} <span className="text-sm font-medium text-slate-500">Days</span>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Avg Processing Time</p>
                </div>

                <div className="w-px bg-slate-200 hidden md:block"></div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 font-bold text-green-600 text-xl">
                        <Award size={16} className="text-green-500" />
                        {stats?.slaCompliance ?? '—'}%
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">SLA Compliance</p>
                </div>

                <div className="w-px bg-slate-200 hidden md:block"></div>

                <div className="flex flex-col items-end">
                    <div className="font-bold text-[#1D4E89] text-xl">{stats?.totalHandled ?? '—'}</div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Files Handled</p>
                </div>
            </div>
        </div>
    );
};

export default OfficerPerformanceWidget;
