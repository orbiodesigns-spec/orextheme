import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

import { User } from '../lib/types';
import { Layout, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
    currentPage?: 'home' | 'pricing' | 'support' | 'store' | 'installation';
    onLoginClick: () => void;
    user?: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage = 'home', onLoginClick, user }) => {
    const navigate = useNavigate();


    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-5 bg-black/50 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto flex items-center justify-between relative">
                {/* Logo */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity relative z-10"
                >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white fill-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        StreamTheme
                    </span>
                </button>

                {/* Center Navigation (Desktop) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-8">
                    <button
                        onClick={() => navigate('/pricing')}
                        className={`text-sm font-medium transition-colors ${currentPage === 'pricing' ? 'text-white' : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        Pricing
                    </button>
                    <button
                        onClick={() => navigate('/store')}
                        className={`text-sm font-medium transition-colors ${currentPage === 'store' ? 'text-white' : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        Store
                    </button>
                    <button
                        onClick={() => navigate('/installation')}
                        className={`text-sm font-medium transition-colors ${currentPage === 'installation' ? 'text-white' : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        Installation Guide
                    </button>
                    <button
                        onClick={() => navigate('/support')}
                        className={`text-sm font-medium transition-colors ${currentPage === 'support' ? 'text-white' : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        Support
                    </button>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4 relative z-10">
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all text-sm font-bold shadow-lg shadow-blue-900/20"
                                >
                                    <Layout className="w-4 h-4" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </button>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors"
                                    title="Profile"
                                >
                                    {user.name ? (
                                        <span className="font-bold text-xs">{user.name.charAt(0).toUpperCase()}</span>
                                    ) : (
                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                className="group relative px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all overflow-hidden"
                            >
                                <span className="relative z-10 text-sm font-medium">Login</span>
                                <div className="absolute inset-0 bg-blue-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-gray-300 hover:text-white"
                    >
                        {isMobileMenuOpen ? <LogOut className="w-6 h-6 rotate-180" /> : <Layout className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 space-y-4 animate-in slide-in-from-top-4">
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => { navigate('/pricing'); setIsMobileMenuOpen(false); }}
                            className={`text-lg font-medium transition-colors text-left ${currentPage === 'pricing' ? 'text-blue-400' : 'text-gray-300'}`}
                        >
                            Pricing
                        </button>
                        <button
                            onClick={() => { navigate('/store'); setIsMobileMenuOpen(false); }}
                            className={`text-lg font-medium transition-colors text-left ${currentPage === 'store' ? 'text-blue-400' : 'text-gray-300'}`}
                        >
                            Store
                        </button>
                        <button
                            onClick={() => { navigate('/installation'); setIsMobileMenuOpen(false); }}
                            className={`text-lg font-medium transition-colors text-left ${currentPage === 'installation' ? 'text-blue-400' : 'text-gray-300'}`}
                        >
                            Installation Guide
                        </button>
                        <button
                            onClick={() => { navigate('/support'); setIsMobileMenuOpen(false); }}
                            className={`text-lg font-medium transition-colors text-left ${currentPage === 'support' ? 'text-blue-400' : 'text-gray-300'}`}
                        >
                            Support
                        </button>
                        <hr className="border-white/10" />
                        {user ? (
                            <>
                                <button
                                    onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                                    className="flex items-center gap-2 text-lg font-medium text-gray-300 hover:text-white"
                                >
                                    <Layout className="w-5 h-5" />
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
                                    className="flex items-center gap-2 text-lg font-medium text-gray-300 hover:text-white"
                                >
                                    <UserIcon className="w-5 h-5" />
                                    Profile
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}
                                className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
