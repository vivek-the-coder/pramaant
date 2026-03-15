import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import { createFile } from '../../services/fileService';

interface ManualBindingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ManualBindingModal = ({ isOpen, onClose }: ManualBindingModalProps) => {
    const [formData, setFormData] = useState({
        fileRefId: '',
        serviceType: '',
        applicantName: '',
        mobileNumber: '',
        docCount: '',
        assignedOfficer: 'REVENUE-OFFICER-1',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [createdFileId, setCreatedFileId] = useState<string | null>(null);
    const [qrUrl, setQrUrl] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setCreatedFileId(null);
        setQrUrl(null);

        try {
            const result = await createFile({
                title: formData.serviceType || 'Government Service',
                department: 'Revenue',
                category: formData.serviceType || 'GENERAL',
                citizenName: formData.applicantName || 'Citizen',
                assignedTo: formData.assignedOfficer || 'REVENUE-OFFICER-1',
                priority: 'MEDIUM',
                slaDays: 5,
            });

            setCreatedFileId(result.fileId);
            setQrUrl(result.qrUrl);
        } catch (err) {
            console.error(err);
            alert('Failed to create file');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                            <h3 className="text-lg font-bold uppercase tracking-wide">OFFICIAL FILE REGISTRATION</h3>
                            <p className="text-[10px] opacity-80 uppercase tracking-wider mt-0.5">NIC Digital Registry Form 4-A</p>
                        </div>
                        <button onClick={onClose} className="hover:bg-white/10 rounded p-1 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 bg-slate-50 space-y-6">
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-xs text-yellow-800 flex items-start gap-2">
                            <AlertCircle size={14} className="mt-0.5" />
                            <p>Ensure all physical documents are verified before creating a digital reference.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-['Noto_Sans']">
                                    File Reference ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fileRefId"
                                    value={formData.fileRefId}
                                    onChange={handleChange}
                                    placeholder="e.g. PRM/2026/001"
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-['Noto_Sans']">
                                    Service Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="serviceType"
                                    value={formData.serviceType}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                                    required
                                >
                                    <option value="">Select Service...</option>
                                    <option value="CASTE_CERTIFICATE">Caste Certificate</option>
                                    <option value="INCOME_CERTIFICATE">Income Certificate</option>
                                    <option value="BILL PASS">Bill Pass Certificate</option>
                                    <option value="DOMICILE_CERTIFICATE">Domicile Certificate</option>
                                    <option value="LAND_RECORD">Land Record Mutation</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-['Noto_Sans']">
                                    Applicant Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="applicantName"
                                    value={formData.applicantName}
                                    onChange={handleChange}
                                    placeholder="As per Aadhar Card"
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-['Noto_Sans']">
                                    Mobile Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    placeholder="10-digit Applicant Mobile"
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-['Noto_Sans']">
                                    Document Bundle Count <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="docCount"
                                    value={formData.docCount}
                                    onChange={handleChange}
                                    placeholder="Total physical pages"
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>



                        {createdFileId && (
                            <div className="mt-4 bg-green-50 border border-green-300 rounded p-4 space-y-3">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                    File Created Successfully
                                </h3>
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm text-slate-700">
                                        File Number:{' '}
                                        <span className="font-bold text-primary">
                                            {createdFileId}
                                        </span>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => createdFileId && navigator.clipboard.writeText(createdFileId)}
                                        className="text-xs font-semibold text-primary underline"
                                    >
                                        Copy
                                    </button>
                                </div>
                                {qrUrl && (
                                    <div className="flex flex-col items-center gap-2">
                                        <div id="qr-print-area">
                                            <img src={qrUrl} alt="File QR Code" width={200} />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const printContent = document.getElementById('qr-print-area');
                                                const win = window.open('', '', 'width=400,height=400');
                                                if (!win || !printContent) return;
                                                win.document.write(printContent.innerHTML);
                                                win.document.close();
                                                win.print();
                                            }}
                                            className="mt-2 inline-flex items-center justify-center px-3 py-1 text-xs font-bold uppercase tracking-wide border border-slate-300 rounded hover:bg-slate-100"
                                        >
                                            Print QR
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded text-sm font-bold uppercase tracking-wide hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] bg-primary text-white py-2 rounded text-sm font-bold uppercase tracking-wide hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <span>Creating...</span>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Commit to Registry
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="bg-slate-100 px-6 py-3 border-t border-slate-200">
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                            DISCLAIMER: False entry of data is a punishable offense under IT Act.
                            <br />
                            <span className="text-red-500">DeviceGuard Verified: Workstation ID #892</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ManualBindingModal;
