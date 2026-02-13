import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Save, Settings } from 'lucide-react';

const AdminSettings: React.FC<{ token: string }> = ({ token }) => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        api.admin.getSettings(token)
            .then(setSettings)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await api.admin.updateSettings(token, settings);
            setMessage('Settings updated successfully!');
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) return <div className="text-white">Loading settings...</div>;

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center gap-4">
                <Settings className="w-8 h-8 text-blue-500" />
                <h2 className="text-3xl font-bold text-white">Global Settings</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-slate-900 border border-white/5 p-6 rounded-xl space-y-6">
                    <h3 className="text-xl font-bold text-white mb-4">Installation Guide</h3>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Video URL (YouTube Embed or User Upload)</label>
                        <input
                            type="text"
                            value={settings.installation_video_url || ''}
                            onChange={(e) => handleChange('installation_video_url', e.target.value)}
                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            placeholder="https://www.youtube.com/embed/..."
                        />
                        <p className="text-xs text-slate-500">
                            For YouTube, use the embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID).
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Thumbnail URL (Optional)</label>
                        <input
                            type="text"
                            value={settings.installation_thumbnail_url || ''}
                            onChange={(e) => handleChange('installation_thumbnail_url', e.target.value)}
                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {message && (
                        <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
                            {message}
                        </span>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;
