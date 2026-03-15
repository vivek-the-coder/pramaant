import { useState } from 'react';
import { Send, Search, Plus, CheckCircle2 } from 'lucide-react';
import SupportTicketModal from '../../components/HelpDesk/SupportTicketModal';
import { AnimatePresence, motion } from 'framer-motion';

const MOCK_TICKETS = [
    { id: 'OT-802', subject: 'Digital Signature Token Sync Failure', status: 'OPEN', date: '10-02-2026' },
    { id: 'OT-791', subject: 'Escalation Override Threshold Error', status: 'RESOLVED', date: '08-02-2026' },
    { id: 'OT-755', subject: 'Dashboard Analytics Not Refreshing', status: 'CLOSED', date: '02-02-2026' },
];

const OfficerHelpDeskPage = () => {
    const [tickets] = useState(MOCK_TICKETS);
    const [selectedTicket, setSelectedTicket] = useState<any>(MOCK_TICKETS[0]);
    const [message, setMessage] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState<{ show: boolean, id: string }>({ show: false, id: '' });

    const handleTicketSuccess = (ticketId: string) => {
        setShowSuccessToast({ show: true, id: ticketId });
        setTimeout(() => setShowSuccessToast({ show: false, id: '' }), 5000);
    };

    return (
        <div className="space-y-6 relative">
            {/* Success Toast */}
            <AnimatePresence>
                {showSuccessToast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className="fixed top-8 left-1/2 z-50 bg-green-50 border border-green-200 text-green-800 px-6 py-3 rounded shadow-lg flex items-center gap-3"
                    >
                        <CheckCircle2 size={20} className="text-green-600" />
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wide">Success</p>
                            <p className="text-xs">Ticket #{showSuccessToast.id} successfully registered with NIC Command Support.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Officer Help Desk</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#1D4E89] text-white px-4 py-2 rounded text-sm font-bold uppercase tracking-wide hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={18} />
                    + RAISE NEW TICKET
                </button>
            </div>

            <div className="grid grid-cols-12 gap-6 h-[600px] bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
                {/* Ticket List (4 cols) */}
                <div className="col-span-4 border-r border-slate-300 flex flex-col bg-slate-50">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Ticket ID..."
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm pl-9 focus:outline-none focus:border-[#1D4E89] focus:ring-1 focus:ring-[#1D4E89]"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`p-4 border-b border-slate-200 cursor-pointer hover:bg-white transition-colors ${selectedTicket?.id === ticket.id ? 'bg-white border-l-4 border-l-[#1D4E89]' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-xs text-slate-500">{ticket.id}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ticket.status === 'OPEN' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-800 truncate">{ticket.subject}</h4>
                                <p className="text-xs text-slate-500 mt-1">{ticket.date}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ticket Detail (8 cols) */}
                <div className="col-span-8 flex flex-col bg-white">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm uppercase">Ticket #{selectedTicket.id}: {selectedTicket.subject}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Priority: High (Officer Level)</p>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        {/* Mock Chat History */}
                        <div className="flex flex-col gap-1">
                            <div className="bg-slate-100 p-3 rounded-lg rounded-tl-none self-start max-w-[80%] border border-slate-200">
                                <p className="text-xs font-bold text-slate-600 mb-1">NIC Command Center</p>
                                <p className="text-sm text-slate-800">Hello Officer. We noticed the signature token sync error. Have you tried resetting the secure enclave?</p>
                                <p className="text-[10px] text-slate-400 mt-1 text-right">10:15 AM</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="bg-blue-50 p-3 rounded-lg rounded-tr-none self-end max-w-[80%] border border-blue-100">
                                <p className="text-xs font-bold text-blue-700 mb-1 text-right">You</p>
                                <p className="text-sm text-slate-800">Yes, the enclave was reset but the prompt times out immediately during override auth.</p>
                                <p className="text-[10px] text-blue-400 mt-1 text-right">10:18 AM</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your reply to Command Support..."
                                className="flex-1 border border-slate-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#1D4E89] focus:ring-1 focus:ring-[#1D4E89]"
                            />
                            <button className="bg-[#1D4E89] text-white px-4 py-2 rounded hover:bg-blue-900 transition-colors">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <SupportTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleTicketSuccess}
            />
        </div>
    );
};

export default OfficerHelpDeskPage;
