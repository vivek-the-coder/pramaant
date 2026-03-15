import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertTriangle, Monitor } from 'lucide-react';

interface SupportTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (ticketId: string) => void;
}

const SupportTicketModal = ({ isOpen, onClose, onSuccess }: SupportTicketModalProps) => {
    const [formData, setFormData] = useState({
        category: '',
        subject: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            const newTicketId = `TKT-${Math.floor(Math.random() * 900) + 100}`;
            onSuccess(newTicketId);
            onClose();
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
                    {/* Header */}
                    <div className="bg-[#1D4E89] text-white px-6 py-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold uppercase tracking-wide">REPORT TECHNICAL ISSUE</h3>
                            <p className="text-[10px] opacity-80 uppercase tracking-wider mt-0.5">NIC IT Support Ticket Form</p>
                        </div>
                        <button onClick={onClose} className="hover:bg-white/10 rounded p-1 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 bg-slate-50 space-y-6">
                        {/* Workstation ID Read-only */}
                        <div className="bg-slate-100 border border-slate-200 p-3 rounded flex items-center gap-3">
                            <Monitor className="text-slate-500" size={18} />
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Workstation ID</p>
                                <p className="text-sm font-bold text-slate-800 font-mono">NIC-W-2026-X842</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-['Noto_Sans']">
                                    Issue Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white font-medium text-slate-700"
                                    required
                                >
                                    <option value="">Select Category...</option>
                                    <option value="HARDWARE">Hardware (Scanner/Printer)</option>
                                    <option value="SOFTWARE">Software (Dashboard/Log)</option>
                                    <option value="NETWORK">Network/Node Connection</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-['Noto_Sans']">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Brief summary of the issue..."
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-['Noto_Sans']">
                                    Problem Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Detailed remarks about the error..."
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 resize-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded text-sm font-bold uppercase tracking-wide hover:bg-slate-50 transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] bg-primary text-white py-2 rounded text-sm font-bold uppercase tracking-wide hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <span>Submitting...</span>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        SUBMIT OFFICIAL TICKET
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="bg-slate-100 px-6 py-3 border-t border-slate-200">
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <AlertTriangle size={12} />
                            Only report genuine technical faults. Misuse is logged.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SupportTicketModal;
