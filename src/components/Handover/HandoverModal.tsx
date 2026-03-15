import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, FileText, Building2, User } from 'lucide-react';
import { forwardFile, getOfficerRoster } from '../../services/fileService';

interface HandoverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialFileId?: string;
    initialServiceType?: string;
}

interface Officer {
    id: string;
    name: string;
    designation: string;
}

interface DeptGroup {
    department: string;
    departmentName: string;
    officers: Officer[];
}

const DEPT_MAPPING: Record<string, string> = {
    'CASTE_CERTIFICATE': 'REVENUE',
    'INCOME_CERTIFICATE': 'REVENUE',
    'BILL PASS': 'REVENUE',
    'DOMICILE_CERTIFICATE': 'MAMLATDAR',
    'LAND_RECORD': 'LAND_RECORDS'
};

const HandoverModal = ({ isOpen, onClose, onSuccess, initialFileId = '', initialServiceType = '' }: HandoverModalProps) => {
    const [destination, setDestination] = useState('');
    const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
    const [remarks, setRemarks] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [roster, setRoster] = useState<DeptGroup[]>([]);
    const [loadingRoster, setLoadingRoster] = useState(false);

    // Fetch officer roster on open
    useEffect(() => {
        if (isOpen && roster.length === 0) {
            setLoadingRoster(true);
            getOfficerRoster()
                .then((data) => setRoster(data.roster || []))
                .catch((err) => console.error('Failed to load roster:', err))
                .finally(() => setLoadingRoster(false));
        }
    }, [isOpen]);

    // Auto-select department based on service type
    useEffect(() => {
        if (isOpen && initialServiceType) {
            const mappedDept = DEPT_MAPPING[initialServiceType] || '';
            setDestination(mappedDept);
            setSelectedOfficer(null);
        }
    }, [isOpen, initialServiceType]);

    // Reset selected officer when department changes
    useEffect(() => {
        setSelectedOfficer(null);
    }, [destination]);

    // Get officers for selected department
    const departmentOfficers = roster.find(d => d.department === destination)?.officers || [];

    const handleHandover = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOfficer) {
            setError('Please select a receiving officer.');
            return;
        }
        setIsSubmitting(true);
        setError(null);

        try {
            await forwardFile({
                fileId: initialFileId,
                toOfficerId: selectedOfficer.id,
                toOfficerName: selectedOfficer.name,
                department: destination,
                remarks,
            });

            setIsSuccess(true);
            if (onSuccess) onSuccess();
            setTimeout(() => {
                setIsSuccess(false);
                setDestination('');
                setSelectedOfficer(null);
                setRemarks('');
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Forward failed:', err);
            setError(err.message || 'Failed to forward file. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-white w-full max-w-lg rounded shadow-lg overflow-hidden"
                >
                    <div className="bg-[#1D4E89] text-white px-6 py-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold uppercase tracking-wide">OFFICIAL HANDOVER PROTOCOL</h3>
                            <p className="text-[10px] opacity-80 uppercase tracking-wider mt-0.5">Transfer Custody & Dispatch to Officer</p>
                        </div>
                        <button onClick={onClose} className="hover:bg-white/10 rounded p-1 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {!isSuccess ? (
                        <form onSubmit={handleHandover} className="p-8 bg-slate-50 space-y-6">
                            {/* Context Info */}
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded flex items-center gap-4">
                                <div className="p-2 bg-white rounded border border-blue-100 text-primary">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">File Reference ID</p>
                                    <p className="text-sm font-bold text-slate-800 font-['Noto_Sans']">{initialFileId || 'Not Selected'}</p>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Department Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-2">
                                        <Building2 size={12} />
                                        Destination Department <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white font-medium"
                                        required
                                    >
                                        <option value="">Select Department...</option>
                                        {roster.map((dept) => (
                                            <option key={dept.department} value={dept.department}>
                                                {dept.departmentName}
                                            </option>
                                        ))}
                                        {roster.length === 0 && !loadingRoster && (
                                            <>
                                                <option value="REVENUE">Revenue Department</option>
                                                <option value="LAND_RECORDS">Land Records (E-Dhara)</option>
                                                <option value="MAMLATDAR">Mamlatdar Office</option>
                                                <option value="TDO">Taluka Development Officer</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                {/* Officer Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-2">
                                        <User size={12} />
                                        Receiving Officer <span className="text-red-500">*</span>
                                    </label>
                                    {destination ? (
                                        departmentOfficers.length > 0 ? (
                                            <div className="space-y-2">
                                                {departmentOfficers.map((officer) => (
                                                    <label
                                                        key={officer.id}
                                                        className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all ${
                                                            selectedOfficer?.id === officer.id
                                                                ? 'border-[#1D4E89] bg-blue-50 ring-1 ring-[#1D4E89]/30'
                                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="officer"
                                                            checked={selectedOfficer?.id === officer.id}
                                                            onChange={() => setSelectedOfficer(officer)}
                                                            className="accent-[#1D4E89]"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-slate-800">{officer.name}</p>
                                                            <p className="text-xs text-slate-500">{officer.designation}</p>
                                                        </div>
                                                        <div className="text-[10px] font-mono text-slate-400">{officer.id}</div>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic py-2">
                                                {loadingRoster ? 'Loading officers...' : 'No officers available for this department.'}
                                            </p>
                                        )
                                    ) : (
                                        <p className="text-sm text-slate-400 italic py-2">Select a department first to see available officers.</p>
                                    )}
                                </div>

                                {/* Remarks */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Handover Remarks
                                    </label>
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Enter official comments..."
                                        rows={2}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 bg-white resize-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded text-sm font-bold uppercase tracking-wide hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !selectedOfficer}
                                    className="flex-[2] bg-primary text-white py-2 rounded text-sm font-bold uppercase tracking-wide hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <span>Dispatching...</span>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            FORWARD TO {selectedOfficer?.name?.split(' ').pop()?.toUpperCase() || 'OFFICER'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-12 bg-slate-50 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Dispatch Successful</h3>
                            <p className="text-sm text-slate-500">
                                File <strong>{initialFileId}</strong> has been forwarded to{' '}
                                <strong>{selectedOfficer?.name}</strong>.
                            </p>
                        </div>
                    )}

                    <div className="bg-slate-100 px-6 py-3 border-t border-slate-200">
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                            DISCLAIMER: Custody transfer implies legal responsibility of the file.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default HandoverModal;
