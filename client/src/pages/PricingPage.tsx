import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { User } from '../lib/types';
import Navbar from '../components/Navbar';
import { Check } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_months: number;
    display_order: number;
}

interface Props {
    user?: User | null;
    onLoginClick: () => void;
}

const PricingPage: React.FC<Props> = ({ user, onLoginClick }) => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);

    // Checkout State
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState<{ type: string; value: number; code: string } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [verifyingCoupon, setVerifyingCoupon] = useState(false);

    useEffect(() => {
        api.getSubscriptionPlans()
            .then(setPlans)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim() || !selectedPlan) return;
        setVerifyingCoupon(true);
        setCouponError('');
        try {
            const res = await api.verifyCoupon(couponCode, { planId: selectedPlan.id });
            setDiscount(res);
        } catch (err: any) {
            setCouponError(err.message || 'Invalid Coupon');
            setDiscount(null);
        } finally {
            setVerifyingCoupon(false);
        }
    };

    const getFinalPrice = () => {
        if (!selectedPlan) return 0;
        let price = selectedPlan.price;
        if (discount) {
            if (discount.discount_type === 'PERCENT') {
                price -= (price * discount.discount_value / 100);
            } else {
                price -= discount.discount_value;
            }
        }
        return Math.max(0, price);
    };

    const handleProceedToPay = async () => {
        if (!user || !selectedPlan) return;

        setPurchasing(selectedPlan.id);
        try {
            const res = await loadRazorpay();
            if (!res) {
                alert('Razorpay SDK failed to load');
                return;
            }

            // Create Order with Coupon
            const orderData = await api.createPaymentOrder(selectedPlan.id, user.phone_number || '', discount?.code);

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'StreamTheme Pro',
                description: `Subscribe to ${selectedPlan.name}`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await api.verifyPayment({
                            ...response,
                            planId: selectedPlan.id,
                            couponCode: discount?.code
                        });

                        if (verifyRes.status === 'SUCCESS') {
                            alert('Subscription Activated! Redirecting to Dashboard...');
                            window.location.href = '/dashboard';
                        }
                    } catch (err) {
                        alert('Payment verification failed');
                        console.error(err);
                    }
                },
                prefill: {
                    name: user.full_name,
                    email: user.email,
                    contact: user.phone_number
                },
                theme: { color: "#3b82f6" }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();
            // Close modal implies successful open, but actually we wait for handler.
            // But UI wise, we can close or keep open "Processing..."
            setSelectedPlan(null); // Close modal to avoid double pay
            setDiscount(null);
            setCouponCode('');

        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Subscription failed');
            setPurchasing(null); // Reset if failed
        }
    };

    const openCheckout = (plan: Plan) => {
        if (!user) {
            onLoginClick();
            return;
        }
        setSelectedPlan(plan);
        setCouponCode('');
        setDiscount(null);
        setCouponError('');
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden pt-20">
            <Navbar currentPage="pricing" onLoginClick={onLoginClick} user={user} />

            <section className="py-20 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto mb-16"
                >
                    <h1 className="text-5xl font-black mb-6">Simple, transparent pricing.</h1>
                    <p className="text-xl text-gray-400">Choose the plan that fits your streaming journey. All plans include full access to our premium library.</p>
                </motion.div>

                {loading ? (
                    <div className="text-center text-gray-500">Loading plans...</div>
                ) : (
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`relative p-8 rounded-3xl border ${plan.id === 'yearly' ? 'bg-gradient-to-b from-blue-900/20 to-black border-blue-500/50' : 'bg-white/5 border-white/10'} hover:border-white/20 transition-all group flex flex-col`}
                            >
                                {plan.id === 'yearly' && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                                        Best Value
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-300 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-black text-white">₹{plan.price}</span>
                                        <span className="text-gray-500">/ {plan.duration_months === 1 ? 'mo' : plan.duration_months === 6 ? '6mo' : 'yr'}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                                </div>

                                <ul className="space-y-4 mb-8 text-left text-gray-300 flex-1">
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>Access to all premium themes</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>Real-time customization</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>Unlimited updates</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>24/7 Priority Support</span>
                                    </li>
                                </ul>

                                <button
                                    onClick={() => openCheckout(plan)}
                                    disabled={purchasing === plan.id}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${plan.id === 'yearly' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white text-black hover:bg-gray-200'} shadow-lg disabled:opacity-50`}
                                >
                                    {purchasing === plan.id ? 'Processing...' : (user ? 'Choose Plan' : 'Login to Subscribe')}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Checkout Modal */}
            {selectedPlan && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setSelectedPlan(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-2">Checkout</h2>
                        <p className="text-gray-400 mb-6">{selectedPlan.name}</p>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center text-gray-300">
                                <span>Price</span>
                                <span>₹{selectedPlan.price}</span>
                            </div>

                            {/* Coupon Section */}
                            <div className="flex gap-2">
                                <input
                                    placeholder="Coupon Code"
                                    className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white flex-1 focus:border-blue-500 outline-none uppercase"
                                    value={couponCode}
                                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                    disabled={!!discount}
                                />
                                {discount ? (
                                    <button
                                        onClick={() => { setDiscount(null); setCouponCode(''); }}
                                        className="text-red-400 hover:text-red-300 px-3 text-sm font-bold"
                                    >
                                        Remove
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={verifyingCoupon || !couponCode}
                                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                                    >
                                        {verifyingCoupon ? '...' : 'Apply'}
                                    </button>
                                )}
                            </div>

                            {couponError && <p className="text-red-500 text-sm">{couponError}</p>}

                            {discount && (
                                <div className="flex justify-between items-center text-green-400">
                                    <span>Discount ({discount.code})</span>
                                    <span>-₹{(selectedPlan.price - getFinalPrice()).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xl font-bold text-white">
                                <span>Total</span>
                                <span>₹{getFinalPrice().toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleProceedToPay}
                            disabled={purchasing === selectedPlan.id}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {purchasing === selectedPlan.id ? 'Processing...' : `Pay ₹${getFinalPrice().toFixed(2)}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PricingPage;
