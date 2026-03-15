import { ShieldCheck, AlertTriangle, Clock, Server } from 'lucide-react';

const StateAnalyticsPage = () => {
    // Top-Level Aggregate Metrics
    const kpis = {
        totalActiveFiles: 14205,
        globalSlaBreachRate: "12.4%",
        avgProcessingTime: "4.2 Days",
        activeNodes: 124
    };

    // Heatmap / Alert Data (Mocking bottleneck offices)
    const alerts = [
        { id: 1, office: "Ahmedabad HQ", issue: "Critical SLA Spike", severity: "High", time: "10 mins ago" },
        { id: 2, office: "Surat RTO", issue: "Scanner Node Offline", severity: "Medium", time: "1 hour ago" },
        { id: 3, office: "Rajkot Ward-3", issue: "Backlog > 500 files", severity: "High", time: "2 hours ago" },
        { id: 4, office: "Bhavnagar Revenue", issue: "Unusual Rejection Rate", severity: "Medium", time: "5 hours ago" }
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50/50 overflow-y-auto pb-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">State Administration Overview</h1>
                <p className="text-sm text-slate-500 mt-1">Real-time aggregate analytics across all connected nodes and departments.</p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Active Files</p>
                        <p className="text-3xl font-black text-slate-800">{kpis.totalActiveFiles.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <ShieldCheck size={28} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Global SLA Breach</p>
                        <p className="text-3xl font-black text-rose-700">{kpis.globalSlaBreachRate}</p>
                    </div>
                    <div className="p-3 bg-rose-50 text-rose-500 rounded-lg relative z-10">
                        <AlertTriangle size={28} />
                    </div>
                    {/* Subtle red tint background */}
                    <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-gradient-to-l from-rose-50 to-transparent pointer-events-none"></div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Avg Processing Time</p>
                        <p className="text-3xl font-black text-slate-800">{kpis.avgProcessingTime}</p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Clock size={28} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Dept Nodes</p>
                        <p className="text-3xl font-black text-slate-800">{kpis.activeNodes}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Server size={28} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Department Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Department Volume: Inward vs Cleared (YTD)</h3>
                    <div className="h-80 w-full bg-slate-50 flex items-center justify-center rounded-lg border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">Department Comparison Chart (Placeholder)</p>
                    </div>
                </div>

                {/* System Alerts Feed */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">System Bottleneck Alerts</h3>
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Live updates active"></span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {alerts.map(alert => (
                            <div key={alert.id} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${alert.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {alert.severity === 'High' && <AlertTriangle size={10} />}
                                        {alert.severity} Priority
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">{alert.time}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#1D4E89] transition-colors">{alert.office}</h4>
                                <p className="text-sm text-slate-600 mt-1">{alert.issue}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                        <button className="text-sm font-bold text-[#1D4E89] hover:underline">View All Alerts</button>
                    </div>
                </div>
            </div>

            {/* SLA Trend Line */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Statewide SLA Breach Trend (6 Months)</h3>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 font-bold uppercase">Current Target</p>
                        <p className="text-sm font-black text-emerald-600">&lt; 10.0%</p>
                    </div>
                </div>
                <div className="h-64 w-full bg-slate-50 flex items-center justify-center rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">SLA Trend Curve (Placeholder)</p>
                </div>
            </div>
        </div>
    );
};

export default StateAnalyticsPage;
