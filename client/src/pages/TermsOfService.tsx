import React from 'react';
import Navbar from '../components/Navbar';
import { User } from '../lib/types';
import { Scale, FileCheck, Ban, AlertCircle } from 'lucide-react';

interface Props {
    user?: User | null;
    onLoginClick?: () => void;
}

const TermsOfService: React.FC<Props> = ({ user, onLoginClick }) => {
    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-blue-500 selection:text-white">
            <Navbar currentPage="home" onLoginClick={onLoginClick || (() => { })} user={user} />

            <div className="max-w-4xl mx-auto px-6 py-32">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 mb-6">
                        <Scale className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
                    <p className="text-lg text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FileCheck className="w-6 h-6 text-blue-500" />
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing and using this website ("StreamTheme"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-yellow-500" />
                            2. Digital Products & Refunds
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 marker:text-yellow-500">
                            <li><strong>License:</strong> When you purchase a theme, you are granted a non-exclusive, non-transferable license to use the product for your personal streaming channels.</li>
                            <li><strong>Refunds:</strong> Due to the nature of digital products, we generally do not offer refunds once the files have been downloaded, unless the product is technically defective. Please read the product description carefully before purchasing.</li>
                            <li><strong>Updates:</strong> We may update our products from time to time to fix bugs or add features. These updates are usually provided free of charge to existing customers.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Ban className="w-6 h-6 text-red-500" />
                            3. Prohibited Use
                        </h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-red-500">
                            <li>Resell, share, or redistribute our themes or their source files.</li>
                            <li>Use our products for illegal purposes.</li>
                            <li>Attempt to gain unauthorized access to our website or user accounts.</li>
                            <li>Remove or alter any copyright notices or watermarks.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">4. Disclaimer</h2>
                        <p>
                            StreamTheme provides its services "as is" and without any warranty or condition, express, implied or statutory. We do not guarantee that our services will be uninterrupted or error-free.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">5. Governing Law</h2>
                        <p>
                            These ToS shall be governed by and construed in accordance with the laws of India, without giving effect to any principles of conflicts of law.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
