import React from 'react';
import Navbar from '../components/Navbar';
import { User } from '../lib/types';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

interface Props {
    user?: User | null;
    onLoginClick?: () => void;
}

const PrivacyPolicy: React.FC<Props> = ({ user, onLoginClick }) => {
    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-blue-500 selection:text-white">
            <Navbar currentPage="home" onLoginClick={onLoginClick || (() => { })} user={user} />

            <div className="max-w-4xl mx-auto px-6 py-32">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
                    <p className="text-lg text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Eye className="w-6 h-6 text-blue-500" />
                            1. Information We Collect
                        </h2>
                        <p>
                            We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This includes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-blue-500">
                            <li><strong>Account Information:</strong> Name, email address, password, and phone number.</li>
                            <li><strong>Payment Information:</strong> Transaction history and payment details (processed securely by Razorpay).</li>
                            <li><strong>Usage Data:</strong> Information about how you use our website and themes.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FileText className="w-6 h-6 text-purple-500" />
                            2. How We Use Your Information
                        </h2>
                        <p>
                            We use the collected information to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-purple-500">
                            <li>Provide, maintain, and improve our services and themes.</li>
                            <li>Process transactions and send related information, including confirmations and receipts.</li>
                            <li>Send you technical notices, updates, security alerts, and support messages.</li>
                            <li>Respond to your comments, questions, and requests.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Lock className="w-6 h-6 text-green-500" />
                            3. Data Security
                        </h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">4. Cookies</h2>
                        <p>
                            We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <div className="bg-zinc-900 p-6 rounded-xl border border-white/10">
                            <p className="text-white font-medium">StreamTheme Support</p>
                            <p>Email: support@streamtheme.com</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
