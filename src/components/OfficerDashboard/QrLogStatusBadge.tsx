import React from 'react';
import { CheckCircle2, AlertTriangle, FileCheck, ArrowRightLeft } from 'lucide-react';

interface QrLogStatusBadgeProps {
    type: 'RECEIVE' | 'FORWARD' | 'VERIFY' | 'MISMATCH';
    status: 'SUCCESS' | 'FAILED_MISMATCH';
}

const QrLogStatusBadge: React.FC<QrLogStatusBadgeProps> = ({ type, status }) => {
    if (status === 'FAILED_MISMATCH' || type === 'MISMATCH') {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold w-fit animate-pulse shadow-sm">
                <AlertTriangle size={14} />
                <span>CUSTODY MISMATCH</span>
            </div>
        );
    }

    switch (type) {
        case 'RECEIVE':
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold w-fit shadow-sm">
                    <FileCheck size={14} />
                    <span>RECEIVED (QR)</span>
                </div>
            );
        case 'FORWARD':
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#1D4E89] border border-blue-200 text-xs font-bold w-fit shadow-sm">
                    <ArrowRightLeft size={14} />
                    <span>FORWARDED (QR)</span>
                </div>
            );
        case 'VERIFY':
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold w-fit shadow-sm">
                    <CheckCircle2 size={14} />
                    <span>VERIFIED</span>
                </div>
            );
        default:
            return null;
    }
};

export default QrLogStatusBadge;
