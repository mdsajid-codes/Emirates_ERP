import React, { useState } from 'react';
import axios from 'axios';
import { Receipt, Download, Loader, CheckCircle, AlertCircle, Calendar, Hash, DollarSign } from 'lucide-react';
import InputField from '../components/InputField';

const TenantInvoice = ({ tenants, loadingTenants }) => {
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        subscriptionStartDate: '',
        subscriptionEndDate: '',
        totalAmount: '',
        paymentStatus: 'PENDING',
        currency: 'AED'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedInvoice, setGeneratedInvoice] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!selectedTenantId) {
            setError('Please select a tenant.');
            return;
        }
        setLoading(true);
        setError('');
        setGeneratedInvoice(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/master/invoices/${selectedTenantId}`,
                formData,
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            setGeneratedInvoice(response.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to generate invoice.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!generatedInvoice) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/master/invoices/${generatedInvoice.id}/download`,
                {
                    headers: { "Authorization": `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${generatedInvoice.invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Download failed", err);
            setError('Failed to download invoice PDF.');
        }
    };

    const resetForm = () => {
        setGeneratedInvoice(null);
        setFormData({
            invoiceNumber: '',
            subscriptionStartDate: '',
            subscriptionEndDate: '',
            totalAmount: '',
            paymentStatus: 'PENDING',
            currency: 'AED'
        });
        setError('');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Receipt className="h-8 w-8 text-green-600" />
                    Generate Tenant Invoice
                </h1>
                <p className="text-foreground-muted">Create subscription invoices for your tenants.</p>
            </div>

            <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
                {generatedInvoice ? (
                    <div className="text-center py-10 space-y-6">
                        <div className="inline-flex items-center justify-center p-4 bg-green-500/10 rounded-full text-green-600 mb-2">
                            <CheckCircle className="h-12 w-12" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Invoice Generated Successfully!</h2>
                        <p className="text-foreground-muted">Invoice <span className="font-mono font-medium text-foreground">{generatedInvoice.invoiceNumber}</span> has been created.</p>

                        <div className="flex justify-center gap-4 pt-4">
                            <button onClick={handleDownload} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700">
                                <Download size={20} /> Download PDF
                            </button>
                            <button onClick={resetForm} className="btn-secondary">
                                Generate Another
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleGenerate} className="space-y-6">
                        {/* Tenant Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground-muted">Select Tenant</label>
                            <select
                                className="input w-full appearance-none bg-background-muted border-border"
                                value={selectedTenantId}
                                onChange={(e) => setSelectedTenantId(e.target.value)}
                                disabled={loadingTenants}
                                required
                            >
                                <option value="">-- Select a Tenant --</option>
                                {tenants.map(tenant => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.companyName} ({tenant.tenantId})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Invoice Number"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleChange}
                                required
                                icon={<Hash size={16} />}
                                placeholder="e.g. INV-2024-001"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Amount"
                                    name="totalAmount"
                                    type="number"
                                    value={formData.totalAmount}
                                    onChange={handleChange}
                                    required
                                    icon={<DollarSign size={16} />}
                                />
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground-muted">Currency</label>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        className="input w-full bg-background-muted border-border"
                                    >
                                        <option value="AED">AED</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="INR">INR</option>
                                    </select>
                                </div>
                            </div>

                            <InputField
                                label="Subscription Start"
                                name="subscriptionStartDate"
                                type="date"
                                value={formData.subscriptionStartDate}
                                onChange={handleChange}
                                required
                                icon={<Calendar size={16} />}
                            />
                            <InputField
                                label="Subscription End"
                                name="subscriptionEndDate"
                                type="date"
                                value={formData.subscriptionEndDate}
                                onChange={handleChange}
                                required
                                icon={<Calendar size={16} />}
                            />

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-foreground-muted">Payment Status</label>
                                <select
                                    name="paymentStatus"
                                    value={formData.paymentStatus}
                                    onChange={handleChange}
                                    className="input w-full bg-background-muted border-border"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="PAID">Paid</option>
                                    <option value="OVERDUE">Overdue</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded flex items-center gap-2">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-border">
                            <button type="submit" className="btn-primary w-full md:w-auto flex justify-center items-center gap-2" disabled={loading}>
                                {loading ? <Loader className="animate-spin h-5 w-5" /> : <Receipt className="h-5 w-5" />}
                                Generate Invoice
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TenantInvoice;
