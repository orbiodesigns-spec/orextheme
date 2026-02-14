import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Tag, Trash2, Plus, X } from 'lucide-react';

const AdminCouponsPage: React.FC<{ token: string }> = ({ token }) => {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [layouts, setLayouts] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form Stats
    const [targetType, setTargetType] = useState<'LAYOUT' | 'PLAN' | 'PRODUCT'>('LAYOUT');
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'PERCENT',
        discount_value: 0,
        description: '',
        layout_id: '',
        plan_id: '',
        product_id: '',
        target_id: '' // Helpers
    });

    const fetchData = async () => {
        try {
            const [cData, lData, pData, prodData] = await Promise.all([
                api.admin.getCoupons(token),
                api.admin.getLayouts(token),
                api.admin.getPlans(token),
                api.admin.getProducts(token)
            ]);
            setCoupons(cData);
            setLayouts(lData);
            setPlans(pData);
            setProducts(prodData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data: any = {
                code: formData.code,
                discount_type: formData.discount_type,
                discount_value: formData.discount_value,
                description: formData.description,
            };

            if (targetType === 'LAYOUT' && formData.target_id) data.layout_id = formData.target_id;
            if (targetType === 'PLAN' && formData.target_id) data.plan_id = formData.target_id;
            if (targetType === 'PRODUCT' && formData.target_id) data.product_id = formData.target_id;

            await api.admin.createCoupon(token, data);
            setIsCreating(false);
            setFormData({
                code: '', discount_type: 'PERCENT', discount_value: 0, description: '',
                layout_id: '', plan_id: '', product_id: '', target_id: ''
            });
            fetchData(); // Refresh
        } catch (err) {
            alert('Failed to create coupon');
        }
    };

    const handleDelete = async (code: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.admin.deleteCoupon(token, code);
            fetchData();
        } catch (err) {
            alert('Failed to delete coupon');
        }
    };

    if (loading) return <div className="text-white">Loading coupons...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Tag className="w-8 h-8 text-pink-500" />
                    Coupons
                </h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Coupon
                </button>
            </div>

            {/* Create Modal/Inline Form */}
            {isCreating && (
                <div className="bg-slate-900 border border-pink-500/30 p-6 rounded-xl relative">
                    <button
                        onClick={() => setIsCreating(false)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-bold text-white mb-4">Create New Coupon</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Code (e.g. SALE20)"
                            className="bg-black border border-slate-700 rounded p-2 text-white"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            required
                        />
                        <select
                            className="bg-black border border-slate-700 rounded p-2 text-white"
                            value={formData.discount_type}
                            onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                        >
                            <option value="PERCENT">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount (₹)</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Value"
                            className="bg-black border border-slate-700 rounded p-2 text-white"
                            value={formData.discount_value}
                            onChange={e => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                            required
                        />

                        {/* Target Selector */}
                        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                            <select
                                className="bg-black border border-slate-700 rounded p-2 text-white"
                                value={targetType}
                                onChange={e => {
                                    setTargetType(e.target.value as any);
                                    setFormData({ ...formData, target_id: '' });
                                }}
                            >
                                <option value="LAYOUT">Layout Coupon</option>
                                <option value="PLAN">Subscription Plan Coupon</option>
                                <option value="PRODUCT">Product Coupon</option>
                            </select>

                            {targetType === 'LAYOUT' && (
                                <select
                                    className="bg-black border border-slate-700 rounded p-2 text-white"
                                    value={formData.target_id}
                                    onChange={e => setFormData({ ...formData, target_id: e.target.value })}
                                >
                                    <option value="">Select Layout (Optional)</option>
                                    {layouts.map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            )}

                            {targetType === 'PLAN' && (
                                <select
                                    className="bg-black border border-slate-700 rounded p-2 text-white"
                                    value={formData.target_id}
                                    onChange={e => setFormData({ ...formData, target_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Plan</option>
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            )}

                            {targetType === 'PRODUCT' && (
                                <select
                                    className="bg-black border border-slate-700 rounded p-2 text-white"
                                    value={formData.target_id}
                                    onChange={e => setFormData({ ...formData, target_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Product</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <input
                            placeholder="Description (Optional)"
                            className="bg-black border border-slate-700 rounded p-2 text-white md:col-span-2"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                        <button type="submit" className="bg-white text-black font-bold py-2 rounded md:col-span-2 hover:bg-slate-200">
                            Create Coupon
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Discount</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Applies To</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                        {coupons.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No coupons active.</td></tr>
                        ) : coupons.map((c: any) => (
                            <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-pink-500">{c.code}</td>
                                <td className="px-6 py-4">
                                    {c.discount_type === 'PERCENT' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                                </td>
                                <td className="px-6 py-4 text-xs">{c.discount_type}</td>
                                <td className="px-6 py-4 text-sm">
                                    {c.layout_name ? `Layout: ${c.layout_name}` :
                                        c.plan_name ? `Plan: ${c.plan_name}` :
                                            c.product_name ? `Product: ${c.product_name}` :
                                                'All'}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(c.code)}
                                        className="text-red-500 hover:text-red-400 p-1 bg-red-500/10 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCouponsPage;
