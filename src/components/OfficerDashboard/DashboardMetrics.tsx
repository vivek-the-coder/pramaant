import { FileClock, AlertTriangle, Send, AlertOctagon } from 'lucide-react';
import type { FileRecord } from '../../types/OfficerTypes';

interface DashboardMetricsProps {
    files: FileRecord[];
    onFilterChange: (filter: 'ALL' | 'DELAYED' | 'ESCALATED' | 'FORWARDED') => void;
    activeFilter: 'ALL' | 'DELAYED' | 'ESCALATED' | 'FORWARDED';
    activeOfficeId: string | 'ALL';
}

const DashboardMetrics = ({ files, onFilterChange, activeFilter, activeOfficeId }: DashboardMetricsProps) => {
    // Filter files down to the active office scope first
    const scopedFiles = activeOfficeId === 'ALL'
        ? files
        : files.filter(f => f.officeId === activeOfficeId);

    // Calculate Metrics on the scoped files
    const pendingCount = scopedFiles.filter(f => f.status === 'PENDING_REVIEW' || f.status === 'QUERY_RAISED').length;
    const delayedCount = scopedFiles.filter(f => f.isDelayed).length;
    const escalatedCount = scopedFiles.filter(f => f.status === 'ESCALATED' || f.escalationLevel > 0).length;

    // Mock "Forwarded Today" logic (files where lastActionBy was 'You' today)
    const today = new Date().toISOString().split('T')[0];
    const forwardedCount = scopedFiles.filter(f =>
        f.lastActionBy === 'You' &&
        f.lastActionDate.startsWith(today)
    ).length;

    const metrics = [
        {
            id: 'ALL',
            label: 'PENDING FILES',
            count: pendingCount,
            icon: FileClock,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            activeBorder: 'border-blue-500 ring-1 ring-blue-500'
        },
        {
            id: 'DELAYED',
            label: 'DELAYED FILES',
            count: delayedCount,
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-200',
            activeBorder: 'border-red-500 ring-1 ring-red-500'
        },
        {
            id: 'ESCALATED',
            label: 'ESCALATED FILES',
            count: escalatedCount,
            icon: AlertOctagon,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            activeBorder: 'border-amber-500 ring-1 ring-amber-500'
        },
        {
            id: 'FORWARDED',
            label: 'FORWARDED TODAY',
            count: forwardedCount,
            icon: Send,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-200',
            activeBorder: 'border-green-500 ring-1 ring-green-500'
        }
    ] as const;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric) => (
                <button
                    key={metric.id}
                    onClick={() => onFilterChange(metric.id as any)}
                    className={`
                        text-left p-4 rounded-lg border transition-all duration-200 relative overflow-hidden group
                        ${activeFilter === metric.id ? `bg-white ${metric.activeBorder} shadow-md` : `bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm`}
                    `}
                >
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            {metric.label}
                        </p>
                        <div className={`p-2 rounded-lg ${metric.bg}`}>
                            <metric.icon className={metric.color} size={18} strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-bold tracking-tight ${metric.count > 0 && metric.id === 'DELAYED' ? 'text-red-600' : 'text-slate-800'}`}>
                            {metric.count}
                        </span>
                        {metric.id === 'DELAYED' && metric.count > 0 && (
                            <span className="text-[10px] uppercase font-bold text-red-600 animate-pulse">Critical</span>
                        )}
                    </div>

                    {/* Active Indicator Strip */}
                    {activeFilter === metric.id && (
                        <div className={`absolute bottom-0 left-0 right-0 h-1 ${metric.color.replace('text-', 'bg-')}`} />
                    )}
                </button>
            ))}
        </div>
    );
};

export default DashboardMetrics;

