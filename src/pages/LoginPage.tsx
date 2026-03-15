import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [credentials, setCredentials] = useState({ userId: '', password: '', captcha: '' });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Small delay for auth animation
        setTimeout(() => {
            const user = login(credentials.userId, credentials.password);
            if (!user) {
                setError('Invalid User ID or Password. Access Denied.');
                setIsLoading(false);
                return;
            }

            // Route based on role
            if (user.role === 'officer') {
                navigate('/officer/dashboard');
            } else if (user.role === 'admin') {
                navigate('/admin/analytics');
            } else {
                navigate('/dashboard');
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#F2F5F7] flex flex-col items-center justify-center font-sans p-4 relative overflow-hidden">
            {/* Background Pattern Hint */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1D4E89 1px, transparent 0)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="w-full max-w-[420px] bg-white shadow-lg relative z-10 border border-slate-200">
                {/* Official Header Block */}
                <div className="bg-[#1D4E89] p-6 text-center">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                        alt="State Emblem"
                        className="w-12 h-12 object-contain brightness-0 invert mx-auto mb-3"
                    />
                    <h1 className="text-lg font-bold text-white tracking-wide uppercase leading-tight">PRAMAANT</h1>
                    <p className="text-[11px] font-medium text-white/90 uppercase tracking-widest mt-1">Government of India</p>
                </div>

                <div className="p-8 pb-10">
                    <div className="mb-6 text-center border-b border-slate-100 pb-4">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">System Access Control</h2>
                        <p className="text-[10px] text-slate-500 uppercase mt-1">Authorized Personnel Only</p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                            <AlertTriangle size={14} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 tracking-wide">User ID / Official Email</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User size={14} />
                                </span>
                                <input
                                    type="text"
                                    value={credentials.userId}
                                    onChange={e => setCredentials({ ...credentials, userId: e.target.value })}
                                    className="w-full bg-white border border-slate-300 pl-9 pr-3 py-2.5 text-sm rounded-none focus:outline-none focus:border-[#1D4E89] focus:ring-1 focus:ring-[#1D4E89] transition-all placeholder:text-slate-300"
                                    placeholder="Enter User ID"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 tracking-wide">Password</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock size={14} />
                                </span>
                                <input
                                    type="password"
                                    value={credentials.password}
                                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                    className="w-full bg-white border border-slate-300 pl-9 pr-3 py-2.5 text-sm rounded-none focus:outline-none focus:border-[#1D4E89] focus:ring-1 focus:ring-[#1D4E89] transition-all placeholder:text-slate-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 tracking-wide">Security Code</label>
                            <div className="flex gap-3">
                                <div className="flex-1 h-10 bg-[#f0f2f5] border border-slate-300 flex items-center justify-center relative overflow-hidden select-none">
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/noise.png')]"></div>
                                    <span className="font-serif text-lg font-bold text-slate-600 tracking-[0.3em] italic skew-x-12 decoration-2 decoration-slate-400 line-through">
                                        GJ-8X2
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={credentials.captcha}
                                    onChange={e => setCredentials({ ...credentials, captcha: e.target.value })}
                                    className="w-28 border border-slate-300 px-3 py-2 text-sm rounded-none text-center font-bold tracking-widest uppercase focus:outline-none focus:border-[#1D4E89]"
                                    placeholder="ENTER CODE"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#1D4E89] text-white py-3 rounded-none text-xs font-bold uppercase tracking-widest hover:bg-[#153a66] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <span>Verifying Credentials...</span>
                            ) : (
                                <>
                                    Secure Login
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">
                    <div className="inline-flex items-start gap-2 max-w-xs mx-auto text-left opacity-70">
                        <AlertTriangle size={12} className="text-slate-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-slate-500 leading-tight">
                            <span className="font-bold">FOR AUTHORIZED GOVERNMENT USE ONLY.</span><br />
                            This system is monitored by the National Informatics Centre (NIC).
                        </p>
                    </div>
                </div>

                {/* Access Granted Overlay */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                                alt="State Emblem"
                                className="w-16 h-16 object-contain mb-6 opacity-80"
                            />
                            <div className="w-8 h-8 border-2 border-slate-200 border-t-[#1D4E89] rounded-full animate-spin mb-4"></div>
                            <h3 className="text-lg font-bold text-[#1D4E89] uppercase tracking-wide">Authenticating</h3>
                            <p className="text-xs text-slate-500 mt-2">Establishing secure connection to State Data Center...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <footer className="mt-8 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    National Informatics Centre
                </p>
                <p className="text-[9px] text-slate-400 mt-1">
                    Ver 2.4.0 (Stable) • Server ID: NDH-DEL-01
                </p>
            </footer>
        </div>
    );
};

export default LoginPage;
