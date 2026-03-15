import { User, ChevronRight } from 'lucide-react';

interface ClerkCardProps {
    name: string;
    clerkId: string;
    pendingCount: number;
    onClick: () => void;
}

const ClerkCard = ({ name, clerkId, pendingCount, onClick }: ClerkCardProps) => {
    return (
        <div
            onClick={onClick}
            className="bg-white border border-slate-200 rounded p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-[#1D4E89] group-hover:w-1.5 transition-all"></div>

            <div className="flex justify-between items-start mb-3 pl-2">
                <div className="bg-slate-100 p-2 rounded-full border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <User size={20} className="text-slate-500 group-hover:text-[#1D4E89]" />
                </div>
                {pendingCount > 0 && (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm animate-pulse">
                        {pendingCount} Pending
                    </span>
                )}
            </div>

            <div className="pl-2">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide group-hover:text-[#1D4E89] transition-colors">{name}</h3>
                <p className="text-[10px] font-mono text-slate-400 font-bold mt-0.5">ID: {clerkId}</p>
            </div>

            <div className="mt-4 pl-2 flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-[#1D4E89] gap-1">
                View Queue <ChevronRight size={12} />
            </div>
        </div>
    );
};

export default ClerkCard;
