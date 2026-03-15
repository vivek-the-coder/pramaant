import React from 'react';
import AdminSidebar from './AdminSidebar';
import Header from './Header';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    return (
        <div className="min-h-screen bg-[#F4F7FE] font-sans selection:bg-primary selection:text-white flex overflow-hidden">
            {/* Darker Sidebar distinct from Clerk/Officer */}
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <Header />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
