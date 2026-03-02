import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { getEmbedUrl } from '../../lib/youtube';
import { PlayCircle, Plus, Trash2, Edit, Save, X } from 'lucide-react';

interface Video {
    id: number;
    title: string;
    video_url: string;
    thumbnail_url: string;
    display_order: number;
}

const AdminInstallationVideos: React.FC<{ token: string }> = ({ token }) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Video>>({});

    useEffect(() => {
        fetchVideos();
    }, [token]);

    const fetchVideos = () => {
        setLoading(true);
        api.admin.getInstallationVideos(token)
            .then(setVideos)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleAdd = () => {
        setFormData({ display_order: videos.length + 1 });
        setIsAdding(true);
        setIsEditing(null);
    };

    const handleEdit = (video: Video) => {
        setFormData(video);
        setIsEditing(video.id);
        setIsAdding(false);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setIsEditing(null);
        setFormData({});
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isAdding) {
                await api.admin.addInstallationVideo(token, formData);
            } else if (isEditing) {
                await api.admin.updateInstallationVideo(token, isEditing, formData);
            }
            fetchVideos();
            handleCancel();
        } catch (err) {
            alert("Failed to save video");
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this video?")) return;
        try {
            await api.admin.deleteInstallationVideo(token, id);
            fetchVideos();
        } catch (err) {
            alert("Failed to delete video");
        }
    };

    if (loading) return <div className="text-white">Loading videos...</div>;

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <PlayCircle className="w-8 h-8 text-blue-500" />
                    <h2 className="text-3xl font-bold text-white">Installation Videos</h2>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Video
                </button>
            </div>

            {/* Form */}
            {(isAdding || isEditing) && (
                <div className="bg-slate-900 border border-white/10 p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-bold text-white mb-4">{isAdding ? 'Add New Video' : 'Edit Video'}</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title || ''}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.display_order || 0}
                                    onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-400">Video URL (Embed)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.video_url || ''}
                                    onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="https://www.youtube.com/embed/..."
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-400">Thumbnail URL (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.thumbnail_url || ''}
                                    onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Video URL</th>
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                            {videos.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No videos found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                videos.map((video) => (
                                    <tr key={video.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{video.title}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500 truncate max-w-xs" title={video.video_url}>
                                            {getEmbedUrl(video.video_url) || video.video_url}
                                        </td>
                                        <td className="px-6 py-4">{video.display_order}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(video)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-blue-400 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(video.id)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminInstallationVideos;
