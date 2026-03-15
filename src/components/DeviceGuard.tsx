import React, { useState, useEffect } from 'react';

interface DeviceGuardProps {
    children: React.ReactNode;
}

const DeviceGuard: React.FC<DeviceGuardProps> = ({ children }) => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isDesktop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
                <div className="max-w-md bg-white p-8 rounded-2xl shadow-card border border-gray-100 uppercase tracking-widest text-xs font-bold">
                    <div className="text-red-500 mb-4 text-4xl">⚠️</div>
                    <h2 className="text-gray-800 text-lg mb-2">Desktop Access Only</h2>
                    <p className="text-gray-500 font-normal normal-case mb-6">
                        The PRAMAANT Terminal is optimized for large displays. Please access this portal from a desktop device with a screen width of at least 1024px.
                    </p>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-1/3 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default DeviceGuard;
