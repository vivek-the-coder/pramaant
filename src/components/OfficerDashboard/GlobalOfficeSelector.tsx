import { ChevronDown, MapPin, Building2 } from 'lucide-react';
import type { OfficeState } from '../../types/OfficerTypes';
import { useState, useRef, useEffect } from 'react';

interface GlobalOfficeSelectorProps {
    offices: OfficeState[];
    activeOfficeId: string | 'ALL';
    onOfficeChange: (id: string | 'ALL') => void;
}

const GlobalOfficeSelector = ({ offices, activeOfficeId, onOfficeChange }: GlobalOfficeSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeOffice = activeOfficeId === 'ALL'
        ? { name: 'All Offices Jurisdiction', code: 'GLOBAL' }
        : offices.find(o => o.id === activeOfficeId);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative mb-6 z-20 font-sans" ref={dropdownRef}>
            <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#1D4E89]/10 p-2.5 rounded-lg border border-[#1D4E89]/20">
                            {activeOfficeId === 'ALL' ? (
                                <MapPin size={24} className="text-[#1D4E89]" />
                            ) : (
                                <Building2 size={24} className="text-[#1D4E89]" />
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 font-display flex items-center gap-1.5">
                                {activeOfficeId === 'ALL' ? 'Assigned Scope' : 'Active Scope'}
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px]">
                                    {activeOfficeId === 'ALL' ? `${offices.length} Offices` : activeOffice?.code}
                                </span>
                            </p>
                            <h2 className="text-xl font-bold text-slate-800">
                                {activeOffice?.name}
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-slate-200 text-slate-700 px-4 py-2 rounded font-medium transition-colors"
                    >
                        Change Office
                        <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-top-2">
                    <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1 font-display">
                            Select Context
                        </p>
                    </div>

                    <button
                        onClick={() => { onOfficeChange('ALL'); setIsOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors border-l-2 ${activeOfficeId === 'ALL' ? 'border-[#1D4E89] bg-blue-50/30 font-bold text-[#1D4E89]' : 'border-transparent text-slate-700 font-medium'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <MapPin size={16} className={activeOfficeId === 'ALL' ? 'text-[#1D4E89]' : 'text-slate-400'} />
                            All Offices Jurisdiction
                        </span>
                        {activeOfficeId === 'ALL' && <div className="w-1.5 h-1.5 rounded-full bg-[#1D4E89]"></div>}
                    </button>

                    <div className="h-px w-full bg-slate-100"></div>

                    {offices.map((office) => (
                        <button
                            key={office.id}
                            onClick={() => { onOfficeChange(office.id); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors border-l-2 ${activeOfficeId === office.id ? 'border-[#1D4E89] bg-blue-50/30 font-bold text-[#1D4E89]' : 'border-transparent text-slate-700 font-medium'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Building2 size={16} className={activeOfficeId === office.id ? 'text-[#1D4E89]' : 'text-slate-400'} />
                                {office.name}
                            </span>
                            {activeOfficeId === office.id && <div className="w-1.5 h-1.5 rounded-full bg-[#1D4E89]"></div>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GlobalOfficeSelector;
