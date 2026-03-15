import { NavLink, useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    FileCheck2,
    AlertOctagon,
    QrCode,
    LineChart,
    LifeBuoy,
    Settings,
    LogOut
} from 'lucide-react';

const OfficerSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    const navGroups = [
        {
            title: 'WORKSPACE',
            items: [
                { icon: ClipboardList, label: 'Verification Queue', path: '/officer/dashboard' },
                { icon: FileCheck2, label: 'My Decisions', path: '/officer/decisions' },
            ]
        },
        {
            title: 'ACCOUNTABILITY',
            items: [
                { icon: AlertOctagon, label: 'Escalation Center', path: '/officer/escalations' },
                { icon: QrCode, label: 'QR & Transfer Logs', path: '/officer/qr-logs' },
            ]
        },
        {
            title: 'PERFORMANCE',
            items: [
                { icon: LineChart, label: 'My Performance', path: '/officer/performance' },
            ]
        },
        {
            title: 'SYSTEM',
            items: [
                { icon: LifeBuoy, label: 'Help Desk', path: '/officer/help' },
                { icon: Settings, label: 'Profile / Settings', path: '/officer/settings' },
            ]
        }
    ];

    return (
        <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-slate-200 flex flex-col z-30 shadow-md">
            {/* Branding Header */}
            <div className="h-16 bg-[#1D4E89] flex items-center px-4 gap-3 shadow-sm shrink-0">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                    alt="Emblem of India"
                    className="w-8 h-8 object-contain brightness-0 invert"
                />
                <div className="flex flex-col justify-center">
                    <h1 className="text-white text-sm font-bold tracking-wider uppercase leading-none">PRAMAANT</h1>
                    <p className="text-white/80 text-[10px] uppercase tracking-widest leading-none mt-1">Government of India</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6">
                <div className="flex flex-col gap-6">
                    {navGroups.map((group, idx) => (
                        <div key={idx} className="flex flex-col gap-1 px-3">
                            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-display">
                                {group.title}
                            </p>
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.label}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-all duration-200
                                        ${isActive
                                            ? 'bg-[#1D4E89] text-white shadow-md shadow-blue-900/10 translate-x-1'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-[#1D4E89] hover:translate-x-1'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                            {item.label}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </div>
            </nav>

            <div className="mt-auto px-3 pt-4 pb-6 border-t border-slate-100 shrink-0 bg-white">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={18} strokeWidth={2} />
                    Logout Session
                </button>
            </div>
        </div>
    );
};

export default OfficerSidebar;
