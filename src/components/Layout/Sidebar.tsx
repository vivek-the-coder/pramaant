import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Search,
    HelpCircle,
    Settings,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear any auth tokens if present (placeholder)
        navigate('/login');
    };
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: FileText, label: 'Registration Register', path: '/logs' },
        { icon: Search, label: 'Citizen Search', path: '/search' },
        { icon: HelpCircle, label: 'Help Desk', path: '/help' },
        { icon: Settings, label: 'Configuration', path: '/settings' },
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

            <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-display">Main Navigation</p>

                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-colors
                            ${isActive
                                ? 'bg-[#1D4E89] text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-[#1D4E89]'}
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
            </nav>

            <div className="mt-auto px-3 pt-6 border-t border-slate-100">


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

export default Sidebar;
