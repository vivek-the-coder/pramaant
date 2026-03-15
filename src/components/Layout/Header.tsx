import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, Search, Plus, LogOut } from 'lucide-react';
import ManualBindingModal from '../ManualBinding/ManualBindingModal';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <header className="h-16 bg-primary text-white flex items-center justify-between px-6 sticky top-0 z-40 w-full shadow-sm">
                <div className="flex items-center gap-4">
                    <button className="text-white lg:hidden">
                        <Menu size={24} />
                    </button>
                </div>

                <div className="flex-1 max-w-xl mx-8 hidden md:block">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search File Ref / Applicant Name..."
                            className="w-full bg-primary-dark/50 text-white placeholder-white/60 border border-white/20 rounded px-4 py-2 text-sm focus:outline-none focus:bg-primary-dark focus:border-white/50 transition-colors"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60" size={16} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsRegistrationOpen(true)}
                        className="bg-[#1D4E89] text-white px-4 py-1.5 rounded border border-white/30 hover:bg-white hover:text-[#1D4E89] transition-all flex items-center gap-2 shadow-sm active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span className="text-xs font-bold uppercase tracking-wide">NEW REGISTRATION</span>
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-dark/50 rounded border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-status-bound animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">NIC Node Active</span>
                    </div>

                    <button className="p-2 hover:bg-primary-dark rounded transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-primary"></span>
                    </button>

                    <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold leading-none">{user?.name || 'Unknown'}</p>
                            <p className="text-[10px] opacity-70 leading-none mt-1 uppercase">
                                {user?.designation || user?.role || ''}{user?.ward ? ` • ${user.ward}` : ''}
                            </p>
                        </div>
                        <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center border border-white/20">
                            <User size={18} />
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 hover:bg-red-500/80 rounded transition-colors"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            <ManualBindingModal
                isOpen={isRegistrationOpen}
                onClose={() => setIsRegistrationOpen(false)}
            />
        </>
    );
};

export default Header;
