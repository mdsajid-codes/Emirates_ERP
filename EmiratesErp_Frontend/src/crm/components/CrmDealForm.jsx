import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { X, Plus, Trash2, Save, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmDealForm = ({ isOpen, onClose, onSaved, initialStatus = 'DRAFT' }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [customers, setCustomers] = useState([]);
    const [salespersons, setSalespersons] = useState([]);
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        customerId: '',
        salespersonId: '',
        quotationDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        reference: '',
        status: initialStatus,
        quotationType: 'STANDARD',
        notes: '',
        termsAndConditions: '',
        totalDiscount: 0,
        otherCharges: 0,
        items: []
    });

    const authHeaders = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

    useEffect(() => {
        if (isOpen) {
            fetchDependencies();
            // Reset form on open
            setFormData(prev => ({
                ...prev,
                status: initialStatus || 'DRAFT',
                customerId: '',
                salespersonId: '',
                reference: '',
                items: [],
                totalDiscount: 0,
                otherCharges: 0,
                notes: '',
                termsAndConditions: ''
            }));
        }
    }, [isOpen, initialStatus]);

    const fetchDependencies = async () => {
        setLoading(true);
        setError(null);
        try {
            const [custRes, empRes, prodRes] = await Promise.all([
                axios.get(`${API_URL}/parties?type=CUSTOMER&size=1000`, { headers: authHeaders }),
                axios.get(`${API_URL}/employees/all`, { headers: authHeaders }),
                axios.get(`${API_URL}/crm/sales-products?size=1000`, { headers: authHeaders })
            ]);

            setCustomers(custRes.data.content || custRes.data || []);
            setSalespersons(empRes.data || []);
            setProducts(prodRes.data.content || prodRes.data || []);
        } catch (err) {
            console.error("Failed to load form dependencies", err);
            setError("Failed to load data. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                crmProductId: '',
                quantity: 1,
                rate: 0,
                taxPercentage: 0,
                taxExempt: false
            }]
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems.splice(index, 1);
            return { ...prev, items: newItems };
        });
    };

    const handleItemChange = (index, field, value) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            const item = { ...newItems[index] };
            
            if (field === 'crmProductId') {
                const product = products.find(p => p.id.toString() === value.toString());
                item.crmProductId = value;
                if (product) {
                    item.rate = product.salesPrice || 0;
                    item.taxPercentage = product.taxRate || 0;
                }
            } else {
                item[field] = value;
            }
            
            // Calculate tax value automatically
            if (!item.taxExempt && item.rate && item.quantity && item.taxPercentage) {
                const amt = parseFloat(item.rate) * parseFloat(item.quantity);
                item.taxValue = (amt * parseFloat(item.taxPercentage)) / 100;
            } else {
                item.taxValue = 0;
            }

            newItems[index] = item;
            return { ...prev, items: newItems };
        });
    };

    const calculateTotal = () => {
        const itemsTotal = formData.items.reduce((acc, item) => {
            const lineAmt = (parseFloat(item.rate || 0) * parseFloat(item.quantity || 0));
            const taxAmt = item.taxExempt ? 0 : parseFloat(item.taxValue || 0);
            return acc + lineAmt + taxAmt;
        }, 0);
        return itemsTotal - parseFloat(formData.totalDiscount || 0) + parseFloat(formData.otherCharges || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.customerId || formData.items.length === 0) {
            setError("Please select a customer and add at least one item.");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                items: formData.items.map(item => ({
                    crmProductId: item.crmProductId || null,
                    quantity: item.quantity,
                    rate: item.rate,
                    taxPercentage: item.taxPercentage,
                    taxExempt: item.taxExempt,
                    taxValue: item.taxValue
                }))
            };

            const data = new FormData();
            data.append('quotation', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

            await axios.post(`${API_URL}/sales/quotations`, data, {
                headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' }
            });

            if (onSaved) onSaved();
            onClose();
        } catch (err) {
            console.error("Save failed", err);
            setError(err.response?.data?.message || "Failed to save deal. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                    <h2 className="text-lg font-bold text-foreground">New Deal</h2>
                    <button onClick={onClose} className="p-2 hover:bg-background-muted rounded-full transition-colors">
                        <X className="h-5 w-5 text-foreground-muted" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <form id="deal-form" onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-theme">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted uppercase mb-1">Customer *</label>
                                    <select
                                        name="customerId"
                                        value={formData.customerId}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    >
                                        <option value="">Select Customer...</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.companyName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted uppercase mb-1">Salesperson</label>
                                    <select
                                        name="salespersonId"
                                        value={formData.salespersonId}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    >
                                        <option value="">Unassigned</option>
                                        {salespersons.map(e => (
                                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted uppercase mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="SENT">Sent / Negotiation</option>
                                        <option value="ACCEPTED">Won / Accepted</option>
                                        <option value="REJECTED">Lost / Rejected</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted uppercase mb-1">Reference</label>
                                    <input
                                        type="text"
                                        name="reference"
                                        value={formData.reference}
                                        onChange={handleChange}
                                        placeholder="Optional reference..."
                                        className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-border pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-foreground">Line Items *</h3>
                                    <button 
                                        type="button" 
                                        onClick={handleAddItem}
                                        className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-theme flex items-center gap-1 transition-colors"
                                    >
                                        <Plus size={14} /> Add Item
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-start bg-card border border-border p-3 rounded-theme">
                                            <div className="flex-1 space-y-3">
                                                <select
                                                    value={item.crmProductId}
                                                    onChange={(e) => handleItemChange(idx, 'crmProductId', e.target.value)}
                                                    className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                >
                                                    <option value="">Select Product...</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} ({p.itemCode})</option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] text-foreground-muted uppercase mb-1">Qty</label>
                                                        <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} className="w-full bg-background border border-border rounded-theme px-2 py-1.5 text-sm" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] text-foreground-muted uppercase mb-1">Rate</label>
                                                        <input type="number" value={item.rate} onChange={(e) => handleItemChange(idx, 'rate', e.target.value)} className="w-full bg-background border border-border rounded-theme px-2 py-1.5 text-sm" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] text-foreground-muted uppercase mb-1">Tax %</label>
                                                        <input type="number" value={item.taxPercentage} onChange={(e) => handleItemChange(idx, 'taxPercentage', e.target.value)} className="w-full bg-background border border-border rounded-theme px-2 py-1.5 text-sm" />
                                                    </div>
                                                    <div className="w-24 flex items-end pb-2">
                                                        <span className="text-sm font-bold w-full text-right truncate">
                                                            {((parseFloat(item.quantity||0) * parseFloat(item.rate||0)) * (1 + parseFloat(item.taxPercentage||0)/100)).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-theme mt-1 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.items.length === 0 && (
                                        <div className="text-center py-6 text-sm text-foreground-muted border border-dashed border-border rounded-theme">
                                            No items added yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-border pt-6 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted uppercase mb-1">Total Discount</label>
                                    <input type="number" name="totalDiscount" value={formData.totalDiscount} onChange={handleChange} className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-foreground-muted uppercase mb-1">Other Charges</label>
                                    <input type="number" name="otherCharges" value={formData.otherCharges} onChange={handleChange} className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-foreground-muted uppercase mb-1">Internal Notes</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full bg-background border border-border rounded-theme px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                            </div>

                            <div className="bg-primary/5 p-4 rounded-theme border border-primary/20 flex justify-between items-center mt-6">
                                <span className="font-bold text-primary">Estimated Value</span>
                                <span className="text-xl font-bold text-foreground">AED {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>

                        </form>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-card flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium border border-border rounded-theme hover:bg-background transition-colors">
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="deal-form" 
                        disabled={saving || loading} 
                        className="px-5 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-theme flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Deal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CrmDealForm;
