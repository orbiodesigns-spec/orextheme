import React, { useState } from 'react';
import { MessageCircle, Send, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';

import { User } from '../lib/types';

interface Props {
    user?: User | null;
    onLoginClick: () => void;
}

const SupportPage: React.FC<Props> = ({ user, onLoginClick }) => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject) return alert("Please select a subject");

        setLoading(true);
        try {
            await api.submitSupportQuery(formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            console.error(err);
            alert("Failed to submit query. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pt-32">
            <Navbar currentPage="support" onLoginClick={onLoginClick} user={user} />

            {/* Hero */}
            <header className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Get Support
                </h1>
                <p className="text-xl text-gray-400 mb-8 mx-auto max-w-2xl">
                    Submit a support ticket below and our team will get back to you as soon as possible.
                </p>
            </header>

            <main className="max-w-3xl mx-auto px-6 pb-20">
                <div className="bg-zinc-900 rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-blue-500" />
                        Support Ticket Form
                    </h2>

                    {submitted ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Ticket Submitted!</h3>
                            <p className="text-gray-400">We've received your request and will respond shortly.</p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="mt-6 text-blue-500 hover:text-blue-400 font-medium transition-colors"
                            >
                                Submit another ticket
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Subject</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                                >
                                    <option value="">Select a subject...</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Billing">Billing</option>
                                    <option value="Feature Request">Feature Request</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Message</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                    placeholder="Describe your issue or question in detail..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Ticket
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </main>

            <footer className="py-12 border-t border-white/10 text-center text-gray-500 text-sm mt-12">
                <p>© {new Date().getFullYear()} StreamTheme. All rights reserved.</p>
                <div className="flex justify-center gap-6 mt-6">
                    <a href="/" className="hover:text-white transition-colors">Home</a>
                    <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
                    <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                    <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                </div>
            </footer>
        </div>
    );
};

export default SupportPage;
