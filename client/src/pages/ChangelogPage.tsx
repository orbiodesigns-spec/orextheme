
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { FileText, Calendar, Download, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';
import { User } from '../lib/types';

interface ChangelogPageProps {
    user: User;
    onLogout: () => void;
}

const ChangelogPage: React.FC<ChangelogPageProps> = ({ user, onLogout }) => {
    const [changelogs, setChangelogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadChangelogs();
    }, []);

    const loadChangelogs = async () => {
        try {
            setLoading(true);
            const data = await api.public.getChangelogs();
            setChangelogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
            <AuthHeader user={user} onLogout={onLogout} />

            <div className="flex-1 max-w-4xl mx-auto w-full p-8">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Changelog
                    </h1>
                    <p className="text-gray-400">
                        Stay updated with the latest improvements, fixes, and features.
                    </p>
                </div>

                <div className="relative border-l border-white/10 ml-4 md:ml-0 space-y-12">
                    {changelogs.map((log) => (
                        <div key={log.id} className="relative pl-8 md:pl-12">
                            {/* Dot */}
                            <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-black" />

                            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-zinc-900 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-2xl font-bold">{log.version}</h2>
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">
                                                LATEST
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(log.release_date).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    {log.pdf_url && (
                                        <a
                                            href={log.pdf_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <Download className="w-4 h-4" /> Download PDF
                                        </a>
                                    )}
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                                        {log.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {changelogs.length === 0 && (
                        <div className="pl-8 text-gray-500 italic">
                            No updates released yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangelogPage;
