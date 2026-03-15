import { FileClock, FileQuestion, Send, CheckCircle2 } from 'lucide-react';

const OfficerKPIHeader = () => {
    const stats = [
        {
            label: 'PENDING VERIFICATION',
            count: 12,
            icon: FileClock,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-200'
        },
        {
            label: 'ACTIVE QUERIES',
            count: 5,
            icon: FileQuestion,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200'
        },
        {
            label: 'TOTAL DISPATCHED',
            count: 128,
            icon: Send,
            color: 'text-[#1D4E89]',
            bg: 'bg-blue-50',
            border: 'border-blue-200'
        },
        {
            label: 'WARD ACTIVITY',
            count: 'Active',
            sub: '98% uptime',
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-200'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white border border-slate-200 rounded p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group"
                >
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-slate-800 leading-none">{stat.count}</h3>
                            {stat.sub && <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{stat.sub}</span>}
                        </div>
                    </div>
                    <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.border} border group-hover:scale-105 transition-transform`}>
                        <stat.icon className={stat.color} size={20} strokeWidth={2} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OfficerKPIHeader;
