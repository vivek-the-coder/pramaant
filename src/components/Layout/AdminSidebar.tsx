import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    Users,
    Building2,
    Settings,
    LogOut,
    ShieldAlert
} from 'lucide-react';

const AdminSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'State Analytics', path: '/admin/analytics' },
        { icon: Building2, label: 'Department View', path: '/admin/departments' },
        { icon: Users, label: 'Officer Performance', path: '/admin/officers' },
        { icon: ShieldAlert, label: 'System Alerts', path: '/admin/alerts' },
        { icon: TrendingUp, label: 'SLA Reports', path: '/admin/reports' },
        { icon: Settings, label: 'Global Config', path: '/admin/settings' },
    ];

    return (
        // Executive dark colored sidebar distinct from operative roles
        <div className="w-64 bg-slate-900 h-screen flex flex-col py-6 z-30 shadow-xl text-slate-300 relative">
            <div className="px-6 mb-8 mt-2">
                <h2 className="text-white font-bold tracking-widest uppercase text-sm opacity-80 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    Super Admin
                </h2>
            </div>

            <nav className="flex-1 flex flex-col gap-1 px-3">
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-display">Command Center</p>

                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${isActive
                                ? 'bg-blue-600 border border-blue-500 text-white shadow-lg shadow-blue-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-slate-500"} />
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto px-3 pt-6 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={18} strokeWidth={2} />
                    Exit Command Center
                </button>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[80px] pointer-events-none"></div>
        </div>
    );
};

export default AdminSidebar;
