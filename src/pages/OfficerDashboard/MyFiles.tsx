import { useCallback, useEffect, useState } from 'react';
import { getOfficerFiles } from '../../services/fileService';

interface OfficerFile {
    fileId: string;
    citizenName: string;
    department: string;
    status: string;
    createdAt: string | null;
    isDelayed: boolean;
}

function calculateDays(date: string | null) {
    if (!date) return '-';
    const created = new Date(date);
    if (Number.isNaN(created.getTime())) return '-';
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const OfficerMyFilesPage = () => {
    const [files, setFiles] = useState<OfficerFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getOfficerFiles();
            setFiles(data.files);
        } catch (err) {
            console.error(err);
            setError('Failed to load files');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const openTimeline = (fileId: string) => {
        // TODO: wire to timeline view
        console.log('Open timeline for', fileId);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Files</h1>
                    <p className="text-sm text-slate-500">Files currently assigned to Revenue Officer 1.</p>
                </div>
                <button
                    onClick={load}
                    className="text-xs border border-slate-300 px-3 py-1 rounded bg-white hover:bg-slate-50"
                >
                    Refresh
                </button>
            </div>

            {loading && (
                <p className="text-sm text-slate-500">Loading files...</p>
            )}

            {error && !loading && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {!loading && !error && files.length === 0 && (
                <div className="text-sm text-slate-500 p-6 text-center">
                    No files assigned to you.
                </div>
            )}

            {!loading && !error && files.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full border border-slate-200 text-sm">
                        <thead className="bg-slate-100">
                            <tr className="text-left text-xs uppercase text-slate-600">
                                <th className="px-4 py-2 border-b border-slate-200">File ID</th>
                                <th className="px-4 py-2 border-b border-slate-200">Citizen</th>
                                <th className="px-4 py-2 border-b border-slate-200">Department</th>
                                <th className="px-4 py-2 border-b border-slate-200">Status</th>
                                <th className="px-4 py-2 border-b border-slate-200 text-right">Days Pending</th>
                                <th className="px-4 py-2 border-b border-slate-200 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => {
                                    const days = calculateDays(file.createdAt);
                                    const isDelayed = file.isDelayed;
                                    return (
                                        <tr
                                            key={file.fileId}
                                            className={`border-t border-slate-100 hover:bg-slate-50 ${
                                                isDelayed ? 'bg-red-50' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-2 font-mono text-xs font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() => openTimeline(file.fileId)}
                                                    className="text-primary underline"
                                                >
                                                    {file.fileId}
                                                </button>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800">
                                                        {file.citizenName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-slate-700">
                                                {file.department}
                                            </td>
                                            <td className="px-4 py-2 text-slate-700">
                                                {file.status}
                                            </td>
                                            <td
                                                className={`px-4 py-2 text-right ${
                                                    isDelayed ? 'text-red-600 font-bold' : ''
                                                }`}
                                            >
                                                {days}
                                            </td>
                                            <td className="px-4 py-2 text-right space-x-2">
                                                <button className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-100">
                                                    View
                                                </button>
                                                <button className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-100">
                                                    Transfer
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OfficerMyFilesPage;

