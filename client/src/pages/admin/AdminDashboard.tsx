import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Users, DollarSign, Activity, TrendingUp, Settings, PlayCircle } from 'lucide-react';

const AdminDashboard: React.FC<{ token: string }> = ({ token }) => {
    const [stats, setStats] = useState<any>(null);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            api.admin.getStats(token),
            api.admin.getSettings(token)
        ])
            .then(([statsData, settingsData]) => {
                setStats(statsData);
                setSettings(settingsData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const handleSavePopup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await api.admin.updateSettings(token, settings);
            setMessage('Popup settings saved!');
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

    if (loading) return <div className="text-white">Loading stats...</div>;
    if (!stats) return <div className="text-red-500">Failed to load stats.</div>;

    const cards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Active Subs', value: stats.activeSubs, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { label: 'Growth', value: '+12%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' }, // Dummy for now
        { label: 'Settings', value: 'Manage', icon: Settings, color: 'text-gray-500', bg: 'bg-gray-500/10', link: '/admin/settings' },
        { label: 'Installation', value: 'Videos', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', link: '/admin/installation-videos' },
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx}
                            className={`bg-slate-900 border border-white/5 p-6 rounded-xl flex items-center gap-4 ${card.link ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
                            onClick={() => card.link && (window.location.href = card.link)} // Using window.location for simplicity, or could use navigate
                        >
                            <div className={`p-3 rounded-lg ${card.bg}`}>
                                <Icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">{card.label}</p>
                                <p className="text-2xl font-bold text-white">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Users Table */}
            <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-xl font-bold text-white">Recent Signups</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                            {stats.recentUsers && stats.recentUsers.map((u: any) => (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{u.full_name}</td>
                                    <td className="px-6 py-4">{u.email}</td>
                                    <td className="px-6 py-4">{u.phone_number || '-'}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Popup Settings */}
            <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">Global Image Popup</h3>
                        <p className="text-sm text-slate-400">Quickly update the promotional popup shown to all visitors.</p>
                    </div>
                </div>

                <form onSubmit={handleSavePopup} className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3 bg-black/30 p-4 border border-white/5 rounded-lg">
                        <input
                            type="checkbox"
                            id="dash_popup_enabled"
                            checked={settings.global_popup_enabled === 'true'}
                            onChange={(e) => handleChange('global_popup_enabled', e.target.checked ? 'true' : 'false')}
                            className="w-5 h-5 accent-blue-500 rounded border-gray-600 cursor-pointer"
                        />
                        <label htmlFor="dash_popup_enabled" className="text-sm font-medium text-white cursor-pointer select-none">
                            Enable Global Popup
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Popup Image URL</label>
                        <input
                            type="text"
                            value={settings.global_popup_image || ''}
                            onChange={(e) => handleChange('global_popup_image', e.target.value)}
                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            placeholder="https://example.com/promo-banner.png"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Target Link URL (Optional)</label>
                        <input
                            type="text"
                            value={settings.global_popup_link || ''}
                            onChange={(e) => handleChange('global_popup_link', e.target.value)}
                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            placeholder="https://example.com/sale"
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Popup Settings'}
                        </button>
                        {message && (
                            <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
                                {message}
                            </span>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
