import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const GlobalPopup: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Only run fetch logic if we are on the landing page
        if (location.pathname !== '/') {
            setIsVisible(false);
            return;
        }

        // Fetch public settings on mount
        api.public.getSettings()
            .then((data) => {
                setSettings(data);

                // Determine if we should show
                const enabled = data.global_popup_enabled === 'true';
                const hasImage = !!data.global_popup_image;

                // Check if user has already closed it in this session (or forever)
                const hasDismissed = sessionStorage.getItem('streamtheme_popup_dismissed') === 'true';

                if (enabled && hasImage && !hasDismissed) {
                    setIsVisible(true);
                }
            })
            .catch(console.error);
    }, [location.pathname]);

    const handleDismiss = () => {
        setIsVisible(false);
        // Save to sessionStorage so it doesn't pop up again during this browsing session
        sessionStorage.setItem('streamtheme_popup_dismissed', 'true');
    };

    if (!isVisible) return null;

    const popupContent = (
        <div className="relative inline-block max-h-[80vh] max-w-[90vw] md:max-w-2xl bg-black rounded-xl overflow-hidden shadow-2xl shadow-blue-900/40 border border-white/10">
            {/* Close Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    handleDismiss();
                }}
                className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/80 p-2 rounded-full text-white backdrop-blur-sm transition-colors border border-white/20"
                aria-label="Close popup"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <img
                src={settings.global_popup_image}
                alt="Promotional Popup"
                className="w-full h-auto max-h-[80vh] object-contain block"
            />
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            {settings.global_popup_link ? (
                <a
                    href={settings.global_popup_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transform transition-transform hover:scale-[1.02] duration-300"
                    onClick={(e) => {
                        // Dismiss if they click the link so it's gone when they return
                        sessionStorage.setItem('streamtheme_popup_dismissed', 'true');
                    }}
                >
                    {popupContent}
                </a>
            ) : (
                <div className="transform transition-transform hover:scale-[1.02] duration-300">
                    {popupContent}
                </div>
            )}
        </div>
    );
};

export default GlobalPopup;
