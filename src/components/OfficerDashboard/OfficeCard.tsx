import { Building2, Users, AlertCircle, ChevronRight } from 'lucide-react';

interface OfficeCardProps {
    officeName: string;
    officeCode: string;
    pendingCount: number;
    urgentCount: number;
    activeClerks: number;
    onClick: () => void;
}

const OfficeCard = ({ officeName, officeCode, pendingCount, urgentCount, activeClerks, onClick }: OfficeCardProps) => {
    return (
        <div
            onClick={onClick}
            className="bg-white border border-slate-200 rounded p-5 shadow-sm hover:shadow-md hover:border-[#1D4E89] transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Building2 size={64} className="text-[#1D4E89]" />
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-block bg-blue-50 text-[#1D4E89] text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-100 mb-2 font-mono">
                            {officeCode}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight leading-none group-hover:text-[#1D4E89] transition-colors">
                            {officeName}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Pending</p>
                    <p className="text-xl font-bold text-slate-700 leading-none">{pendingCount}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Urgent</p>
                    <p className="text-xl font-bold text-red-600 leading-none flex items-center gap-1">
                        {urgentCount}
                        {urgentCount > 0 && <AlertCircle size={12} />}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Active Clerks</p>
                    <p className="text-xl font-bold text-blue-600 leading-none flex items-center gap-1">
                        {activeClerks}
                        <Users size={12} />
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-[#1D4E89] transition-colors">
                    Access Queue
                </span>
                <div className="bg-slate-50 p-1.5 rounded-full group-hover:bg-[#1D4E89] group-hover:text-white transition-colors">
                    <ChevronRight size={14} />
                </div>
            </div>
        </div>
    );
};

export default OfficeCard;
