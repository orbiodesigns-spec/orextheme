import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { User } from '../lib/types';
import { api } from '../lib/api';
import { getEmbedUrl, getThumbnailUrl } from '../lib/youtube';
import { PlayCircle, ChevronRight, Video } from 'lucide-react';

interface InstallationGuideProps {
    user?: User | null;
    onLoginClick?: () => void;
}

interface VideoItem {
    id: number;
    title: string;
    video_url: string;
    thumbnail_url: string;
    display_order: number;
}

const InstallationGuide: React.FC<InstallationGuideProps> = ({ user, onLoginClick }) => {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getInstallationVideos()
            .then(data => {
                setVideos(data);
                if (data.length > 0) setSelectedVideo(data[0]);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <Navbar user={user} onLoginClick={onLoginClick || (() => { })} currentPage="support" />

            <div className="max-w-7xl mx-auto px-6 py-32">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Installation Guide
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Follow our step-by-step video tutorials to get your stream theme up and running in minutes.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Player */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20 bg-slate-900">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-slate-500">Loading guide...</span>
                                </div>
                            ) : selectedVideo ? (
                                <iframe
                                    src={getEmbedUrl(selectedVideo.video_url) || selectedVideo.video_url}
                                    title={selectedVideo.title}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                    <PlayCircle className="w-12 h-12 mb-4 opacity-50" />
                                    <p>No installation videos currently available.</p>
                                </div>
                            )}
                        </div>
                        {selectedVideo && (
                            <h2 className="text-2xl font-bold text-white">{selectedVideo.title}</h2>
                        )}
                    </div>

                    {/* Playlist */}
                    <div className="bg-slate-900 border border-white/5 rounded-xl p-6 h-fit">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Video className="w-5 h-5 text-blue-400" />
                            Tutorials
                        </h3>
                        <div className="space-y-3">
                            {loading ? (
                                <p className="text-slate-500 text-sm">Loading playlist...</p>
                            ) : videos.length === 0 ? (
                                <p className="text-slate-500 text-sm">No tutorials found.</p>
                            ) : (
                                videos.map((video) => (
                                    <button
                                        key={video.id}
                                        onClick={() => setSelectedVideo(video)}
                                        className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all text-left group ${selectedVideo?.id === video.id
                                            ? 'bg-blue-600/20 border border-blue-500/50'
                                            : 'hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <div className="relative w-24 h-14 bg-black rounded-md overflow-hidden flex-shrink-0">
                                            {video.thumbnail_url ? (
                                                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                                            ) : getThumbnailUrl(video.video_url) ? (
                                                <img src={getThumbnailUrl(video.video_url)!} alt={video.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                                    <PlayCircle className="w-6 h-6 text-slate-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${selectedVideo?.id === video.id ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}`}>
                                                {video.title}
                                            </p>
                                        </div>
                                        {selectedVideo?.id === video.id && (
                                            <ChevronRight className="w-4 h-4 text-blue-400" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/5 space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold mb-4">1</div>
                        <h3 className="font-bold text-lg">Purchase & Download</h3>
                        <p className="text-slate-400 text-sm">Select your favorite theme from the store and download the access files.</p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/5 space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold mb-4">2</div>
                        <h3 className="font-bold text-lg">Import to OBS</h3>
                        <p className="text-slate-400 text-sm">Use the browser source link provided in your dashboard to add the theme to OBS.</p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/5 space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 font-bold mb-4">3</div>
                        <h3 className="font-bold text-lg">Customize</h3>
                        <p className="text-slate-400 text-sm">Use the dashboard controls to tweak colors, texts, and behaviors in real-time.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstallationGuide;
