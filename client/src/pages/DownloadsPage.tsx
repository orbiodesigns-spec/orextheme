
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { User } from '../lib/types';
import AuthHeader from '../components/AuthHeader';
import { Loader2, Download, Package, ShoppingBag, ExternalLink, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DownloadsPageProps {
    user: User;
    onLogout: () => void;
}

const DownloadsPage: React.FC<DownloadsPageProps> = ({ user, onLogout }) => {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPurchases();
    }, []);

    const loadPurchases = async () => {
        try {
            setLoading(true);
            const data = await api.getPurchases();
            setPurchases(data);
        } catch (err: any) {
            console.error("Failed to load purchases", err);
            setError("Failed to load your purchases. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
            <AuthHeader user={user} onLogout={onLogout} />

            <div className="flex-1 max-w-7xl mx-auto w-full p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Download className="text-blue-500" /> My Downloads
                        </h1>
                        <p className="text-gray-400 mt-2">Access all your purchased digital products here.</p>
                    </div>
                    <Link to="/store" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" /> Browse Store
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {purchases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-zinc-900 border border-dashed border-white/10 rounded-2xl">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <Package className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No purchase from store</h3>
                        <p className="text-gray-400 max-w-md text-center mb-6">
                            You haven't purchased any products yet. Visit our store to find premium themes and assets.
                        </p>
                        <Link
                            to="/store"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Go to Store
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {purchases.map((purchase) => (
                            <div key={purchase.id + purchase.created_at} className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all group">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-blue-500/10 rounded-lg">
                                            <Package className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <span className="text-xs font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded">
                                            PURCHASED
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{purchase.name}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 h-10 mb-6">{purchase.description}</p>

                                    <div className="space-y-3">
                                        <a
                                            href={purchase.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Download className="w-4 h-4" /> Download File
                                        </a>

                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                                            <span>Date: {new Date(purchase.created_at).toLocaleDateString()}</span>
                                            <span>Price: ₹{purchase.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadsPage;
