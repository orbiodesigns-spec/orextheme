
import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, FileText, Calendar, Download, Loader2 } from 'lucide-react';

const AdminChangelogsPage: React.FC<{ token: string }> = ({ token }) => {
    const [changelogs, setChangelogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        version: '',
        description: '',
        pdf_url: '',
        release_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadChangelogs();
    }, [token]);

    const loadChangelogs = async () => {
        try {
            setLoading(true);
            const data = await api.admin.getChangelogs(token);
            setChangelogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.admin.addChangelog(token, formData);
            await loadChangelogs();
            setShowAddForm(false);
            setFormData({
                version: '',
                description: '',
                pdf_url: '',
                release_date: new Date().toISOString().split('T')[0]
            });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this changelog?")) return;
        setProcessing(true);
        try {
            await api.admin.deleteChangelog(token, id);
            await loadChangelogs();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading changelogs...</div>;

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Changelogs</h1>
                    <p className="text-gray-400">Manage system updates and release notes</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Changelog
                </button>
            </div>

            {/* ADD FORM */}
            {showAddForm && (
                <div className="mb-8 bg-zinc-900 border border-white/10 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold mb-4">Add New Changelog</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">Version</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.version}
                                    onChange={e => setFormData({ ...formData, version: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-lg p-2 text-white focus:border-blue-500 outline-none"
                                    placeholder="e.g. v2.1.0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">Release Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.release_date}
                                    onChange={e => setFormData({ ...formData, release_date: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-lg p-2 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">PDF Download URL</label>
                            <input
                                type="url"
                                required
                                value={formData.pdf_url}
                                onChange={e => setFormData({ ...formData, pdf_url: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg p-2 text-white focus:border-blue-500 outline-none"
                                placeholder="https://example.com/changelog-v2.pdf"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Description</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg p-2 text-white focus:border-blue-500 outline-none h-24"
                                placeholder="Brief summary of changes..."
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Changelog'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* LIST */}
            <div className="space-y-4">
                {changelogs.map((log) => (
                    <div key={log.id} className="bg-zinc-900 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-blue-500/20 transition-all">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xl font-bold text-white">{log.version}</span>
                                <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(log.release_date).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{log.description}</p>
                            {log.pdf_url && (
                                <a
                                    href={log.pdf_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                                >
                                    <FileText className="w-4 h-4" /> View PDF
                                </a>
                            )}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleDelete(log.id)}
                                disabled={processing}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                title="Delete Changelog"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {changelogs.length === 0 && !loading && (
                <div className="text-center py-20 bg-zinc-900/50 border border-dashed border-white/10 rounded-xl">
                    <p className="text-gray-500">No changelogs found. Create one to get started.</p>
                </div>
            )}
        </div>
    );
};

export default AdminChangelogsPage;
