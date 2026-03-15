import React from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerSidebar from './OfficerSidebar';
import { Menu, Bell, User, LogOut, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const OfficerLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#F4F7FE] font-sans selection:bg-[#1D4E89] selection:text-white">
            <OfficerSidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300">
                {/* Officer Header */}
                <header className="h-16 bg-primary text-white flex items-center justify-between px-6 sticky top-0 z-40 w-full shadow-sm">
                    <div className="flex items-center gap-4">
                        <button className="text-white lg:hidden">
                            <Menu size={24} />
                        </button>
                    </div>

                    <div className="flex-1 max-w-md mx-6 hidden md:block">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search files..."
                                className="w-full bg-primary-dark/50 text-white placeholder-white/60 border border-white/20 rounded px-4 py-2 text-sm focus:outline-none focus:bg-primary-dark focus:border-white/50"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60" size={16} />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-primary-dark rounded transition-colors relative">
                            <Bell size={20} />
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold leading-none">{user?.name || 'Officer'}</p>
                                <p className="text-[10px] opacity-70 leading-none mt-1 uppercase">
                                    {user?.designation || 'Officer'} • {(user?.department || '').replace(/_/g, ' ')}
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
                <main className="p-6 md:p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default OfficerLayout;
