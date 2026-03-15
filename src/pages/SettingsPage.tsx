import { useState } from 'react';
import { Save, User, Globe } from 'lucide-react';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">System Configuration</h1>

            <div className="bg-white border border-slate-300 rounded shadow-sm flex flex-col lg:flex-row min-h-[500px]">
                {/* Vertical Tabs */}
                <div className="w-64 bg-slate-50 border-r border-slate-300 p-4">
                    <nav className="space-y-1">
                        {[
                            { id: 'profile', label: 'Authorized Identity', icon: User },
                            { id: 'regional', label: 'Regional Settings', icon: Globe },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold rounded transition-colors text-left
                                    ${activeTab === tab.id
                                        ? 'bg-[#1D4E89] text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-200'}
                                `}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8">
                    {activeTab === 'profile' && (
                        <div className="max-w-xl space-y-6">
                            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 uppercase tracking-wide">Officer Profile</h2>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Official Name</label>
                                    <input type="text" value="SACHIN SINGH" readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-2 text-sm font-bold text-slate-700 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Employee ID</label>
                                    <input type="text" value="NIC-EMP-2024-X4" readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-2 text-sm font-bold text-slate-700 cursor-not-allowed" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Designation</label>
                                    <input type="text" value="SENIOR SECTION CLERK (GRADE 2)" readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-2 text-sm font-bold text-slate-700 cursor-not-allowed" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-xs text-red-600 font-bold uppercase">
                                    * Profile data is centrally managed by District Administration.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'regional' && (
                        <div className="max-w-xl space-y-6">
                            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 uppercase tracking-wide">Regional Preferences</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Interface Language</label>
                                    <select className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white">
                                        <option value="en">English (Official)</option>
                                        <option value="gu">Gujarati</option>
                                        <option value="hi">Hindi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Date Format</label>
                                    <select className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white">
                                        <option>DD-MM-YYYY (Indian Standard)</option>
                                        <option>YYYY-MM-DD (ISO)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button className="bg-primary text-white px-6 py-2 rounded text-sm font-bold uppercase tracking-wide hover:bg-primary-dark transition-colors flex items-center gap-2">
                                    <Save size={16} />
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
