import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Receipt, Download, Plus, ArrowLeft, Loader, FileText, Calendar, DollarSign, CheckCircle, AlertCircle, Hash, Edit, X } from 'lucide-react';
import InputField from '../components/InputField';

const TenantInvoiceView = ({ tenants = [], loadingTenants }) => {
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [invoices, setInvoices] = useState([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'create'

    // Form State
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        subscriptionStartDate: '',
        subscriptionEndDate: '',
        basicAmount: '',
        totalAmount: '',
        tax: '',
        taxPercentage: '',
        discount: '',
        discountPercentage: '',
        otherCharges: '',
        advanceAmount: '',
        pendingAmount: '',
        paymentStatus: 'PENDING',
        currency: 'AED'
    });
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState(null);

    // Update Status State
    const [selectedInvoiceForUpdate, setSelectedInvoiceForUpdate] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    // Fetch invoices when tenant changes
    useEffect(() => {
        if (selectedTenantId) {
            fetchInvoices(selectedTenantId);
        } else {
            setInvoices([]);
        }
    }, [selectedTenantId]);

    const fetchInvoices = async (masterTenantId) => {
        setLoadingInvoices(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/master/invoices/tenant/${masterTenantId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setInvoices(response.data);
        } catch (err) {
            console.error("Failed to fetch invoices", err);
        } finally {
            setLoadingInvoices(false);
        }
    };

    const handleDownload = async (invoiceId, invoiceNumber) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/master/invoices/${invoiceId}/download`,
                {
                    headers: { "Authorization": `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Download failed", err);
            alert('Failed to download invoice PDF.');
        }
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        if (!selectedInvoiceForUpdate || !newStatus) return;

        setUpdatingStatus(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}/master/invoices/${selectedInvoiceForUpdate.id}/status`,
                null,
                {
                    params: { status: newStatus },
                    headers: { "Authorization": `Bearer ${token}` }
                }
            );

            // Refresh list
            fetchInvoices(selectedTenantId);
            closeStatusModal();
        } catch (err) {
            console.error("Failed to update status", err);
            alert('Failed to update invoice status.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const openStatusModal = (invoice) => {
        setSelectedInvoiceForUpdate(invoice);
        setNewStatus(invoice.paymentStatus);
        setShowStatusModal(true);
    };

    const closeStatusModal = () => {
        setShowStatusModal(false);
        setSelectedInvoiceForUpdate(null);
        setNewStatus('');
    };

    // Form Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let updatedFormData = { ...formData, [name]: value };

        // Recalculate fields if dependencies change
        if (['basicAmount', 'taxPercentage', 'discountPercentage', 'otherCharges', 'advanceAmount'].includes(name)) {
            const basic = parseFloat(name === 'basicAmount' ? value : updatedFormData.basicAmount) || 0;
            const taxPct = parseFloat(name === 'taxPercentage' ? value : updatedFormData.taxPercentage) || 0;
            const distPct = parseFloat(name === 'discountPercentage' ? value : updatedFormData.discountPercentage) || 0;
            const other = parseFloat(name === 'otherCharges' ? value : updatedFormData.otherCharges) || 0;
            const advance = parseFloat(name === 'advanceAmount' ? value : updatedFormData.advanceAmount) || 0;

            const tax = (basic * (taxPct / 100));
            const discount = (basic * (distPct / 100));

            updatedFormData.tax = tax.toFixed(2);
            updatedFormData.discount = discount.toFixed(2);

            const total = basic + tax - discount + other;
            updatedFormData.totalAmount = total.toFixed(2);

            const pending = total - advance;
            updatedFormData.pendingAmount = pending.toFixed(2);
        }

        setFormData(updatedFormData);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);
        setCreateError('');
        setCreateSuccess(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/master/invoices/${selectedTenantId}`,
                formData,
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            setCreateSuccess(response.data);
            // Refresh list
            fetchInvoices(selectedTenantId);
            // Don't switch back immediately, let user see success
        } catch (err) {
            console.error(err);
            setCreateError(err.response?.data?.message || 'Failed to generate invoice.');
        } finally {
            setCreating(false);
        }
    };

    const resetForm = () => {
        setFormData({
            invoiceNumber: '',
            subscriptionStartDate: '',
            subscriptionEndDate: '',
            basicAmount: '',
            totalAmount: '',
            tax: '',
            taxPercentage: '',
            discount: '',
            discountPercentage: '',
            otherCharges: '',
            advanceAmount: '',
            pendingAmount: '',
            paymentStatus: 'PENDING',
            currency: 'AED'
        });
        setCreateSuccess(null);
        setCreateError('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Receipt className="h-8 w-8 text-green-600" />
                        Tenant Invoices
                    </h1>
                    <p className="text-foreground-muted">Manage and generate subscription invoices.</p>
                </div>

                <div className="w-full md:w-72">
                    <select
                        className="input w-full bg-background-muted border-border"
                        value={selectedTenantId}
                        onChange={(e) => {
                            setSelectedTenantId(e.target.value);
                            setViewMode('list');
                            resetForm();
                        }}
                        disabled={loadingTenants}
                    >
                        <option value="">-- Select a Tenant --</option>
                        {tenants && tenants.length > 0 ? (
                            tenants.map(tenant => (
                                <option key={tenant.id} value={tenant.id}>
                                    {tenant.companyName} ({tenant.tenantId})
                                </option>
                            ))
                        ) : (
                            <option disabled>No active tenants found</option>
                        )}
                    </select>
                </div>
            </div>

            {!selectedTenantId ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed border-border text-foreground-muted">
                    <Receipt className="h-16 w-16 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No Tenant Selected</h3>
                    <p>Please select a tenant to view or generate invoices.</p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-background-muted/30">
                        <h2 className="font-semibold flex items-center gap-2">
                            <FileText size={18} /> Invoice History
                        </h2>
                        <button
                            onClick={() => setViewMode('create')}
                            className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700 text-xs md:text-sm"
                        >
                            <Plus size={16} /> Generate Invoice
                        </button>
                    </div>

                    {loadingInvoices ? (
                        <div className="flex justify-center py-12">
                            <Loader className="animate-spin text-primary h-8 w-8" />
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-12 text-foreground-muted">
                            <p>No invoices found for this tenant.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-background-muted text-foreground-muted">
                                    <tr>
                                        <th className="px-6 py-3">Invoice #</th>
                                        <th className="px-6 py-3">Generated Date</th>
                                        <th className="px-6 py-3">Subscription Period</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="border-b border-border hover:bg-background-muted/50">
                                            <td className="px-6 py-4 font-medium">{inv.invoiceNumber}</td>
                                            <td className="px-6 py-4">{new Date(inv.generatedDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col text-xs text-foreground-muted">
                                                    <span>{inv.subscriptionStartDate}</span>
                                                    <span>to {inv.subscriptionEndDate}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold">
                                                {inv.currency} {inv.totalAmount}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${inv.paymentStatus === 'FULLY_PAID' || inv.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                                                        inv.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                            inv.paymentStatus === 'OVERDUE' || inv.paymentStatus === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                                                                inv.paymentStatus === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {inv.paymentStatus}
                                                    </span>
                                                    <button
                                                        onClick={() => openStatusModal(inv)}
                                                        className="text-foreground-muted hover:text-primary transition-colors cursor-pointer"
                                                        title="Update Status"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDownload(inv.id, inv.invoiceNumber)}
                                                    className="text-primary hover:text-primary-focus transition-colors"
                                                    title="Download PDF"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                // View Mode == 'create'
                <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border">
                    <div className="p-4 border-b border-border flex items-center gap-4 bg-background-muted/30">
                        <button
                            onClick={() => {
                                setViewMode('list');
                                resetForm();
                            }}
                            className="p-2 hover:bg-background rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="font-semibold">Generate New Invoice</h2>
                    </div>

                    <div className="p-6">
                        {createSuccess ? (
                            <div className="text-center py-8 space-y-4 animate-in fade-in">
                                <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-full">
                                    <CheckCircle size={48} />
                                </div>
                                <h3 className="text-xl font-bold">Invoice Created!</h3>
                                <p className="text-foreground-muted">Invoice <span className="font-mono font-medium text-foreground">{createSuccess.invoiceNumber}</span> has been generated.</p>
                                <div className="flex justify-center gap-4 pt-2">
                                    <button
                                        onClick={() => handleDownload(createSuccess.id, createSuccess.invoiceNumber)}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        <Download size={18} /> Download PDF
                                    </button>
                                    <button
                                        onClick={() => {
                                            setViewMode('list');
                                            resetForm();
                                        }}
                                        className="btn-secondary"
                                    >
                                        Back to List
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateSubmit} className="space-y-6 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label="Invoice Number"
                                        name="invoiceNumber"
                                        value={formData.invoiceNumber}
                                        onChange={handleInputChange}
                                        icon={<Hash size={16} />}
                                        placeholder="Leave empty for auto-generated"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <InputField
                                            label="Basic Amount"
                                            name="basicAmount"
                                            type="number"
                                            value={formData.basicAmount}
                                            onChange={handleInputChange}
                                            required
                                            icon={<DollarSign size={16} />}
                                            placeholder="0.00"
                                        />
                                        <InputField
                                            label="Tax (%)"
                                            name="taxPercentage"
                                            type="number"
                                            value={formData.taxPercentage}
                                            onChange={handleInputChange}
                                            icon={<DollarSign size={16} />}
                                            placeholder="0"
                                        />
                                        <div className="text-xs text-foreground-muted mt-1">
                                            Calculated: {formData.tax || 0}
                                        </div>
                                        <div>
                                            <InputField
                                                label="Discount (%)"
                                                name="discountPercentage"
                                                type="number"
                                                value={formData.discountPercentage}
                                                onChange={handleInputChange}
                                                icon={<DollarSign size={16} />}
                                                placeholder="0"
                                            />
                                            <div className="text-xs text-foreground-muted mt-1">
                                                Calculated: {formData.discount || 0}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <InputField
                                            label="Other Charges"
                                            name="otherCharges"
                                            type="number"
                                            value={formData.otherCharges}
                                            onChange={handleInputChange}
                                            icon={<DollarSign size={16} />}
                                            placeholder="0.00"
                                        />
                                        <InputField
                                            label="Advance Paid"
                                            name="advanceAmount"
                                            type="number"
                                            value={formData.advanceAmount}
                                            onChange={handleInputChange}
                                            icon={<DollarSign size={16} />}
                                            placeholder="0.00"
                                        />
                                        <div>
                                            <label className="block text-sm font-medium text-foreground-muted mb-1">Total Amount</label>
                                            <div className="input w-full bg-background-muted/50 border-border flex items-center px-3 py-2 text-foreground font-semibold">
                                                <span className="mr-2 text-foreground-muted">AED</span>
                                                {formData.totalAmount || '0.00'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground-muted mb-1">Pending Amount</label>
                                            <div className="input w-full bg-background-muted/50 border-border flex items-center px-3 py-2 text-foreground font-semibold">
                                                <span className="mr-2 text-foreground-muted">AED</span>
                                                {formData.pendingAmount || '0.00'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-foreground-muted">Currency</label>
                                            <select
                                                name="currency"
                                                value={formData.currency}
                                                onChange={handleInputChange}
                                                className="input w-full bg-background-muted border-border"
                                            >
                                                <option value="AED">AED</option>
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-foreground-muted">Payment Status</label>
                                            <select
                                                name="paymentStatus"
                                                value={formData.paymentStatus}
                                                onChange={handleInputChange}
                                                className="input w-full bg-background-muted border-border"
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="ACTIVE">Active</option>
                                                <option value="EXPIRED">Expired</option>
                                                <option value="SUSPENDED">Suspended</option>
                                                <option value="PARTIALLY_PAID">Partially Paid</option>
                                                <option value="FULLY_PAID">Fully Paid</option>
                                                <option value="OVERDUE">Overdue</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField
                                            label="Subscription Start"
                                            name="subscriptionStartDate"
                                            type="date"
                                            value={formData.subscriptionStartDate}
                                            onChange={handleInputChange}
                                            required
                                            icon={<Calendar size={16} />}
                                        />
                                        <InputField
                                            label="Subscription End"
                                            name="subscriptionEndDate"
                                            type="date"
                                            value={formData.subscriptionEndDate}
                                            onChange={handleInputChange}
                                            required
                                            icon={<Calendar size={16} />}
                                        />
                                    </div>
                                </div>

                                {createError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded flex items-center gap-2">
                                        <AlertCircle size={18} />
                                        <span>{createError}</span>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4 border-t border-border">
                                    <button type="submit" className="btn-primary w-full md:w-auto flex justify-center items-center gap-2" disabled={creating}>
                                        {creating ? <Loader className="animate-spin h-5 w-5" /> : <Receipt className="h-5 w-5" />}
                                        Generate Invoice
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )
            }

            {/* Status Update Modal */}
            {
                showStatusModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-border flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Update Payment Status</h3>
                                <button onClick={closeStatusModal} className="text-foreground-muted hover:text-foreground">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-1">Invoice Number</label>
                                    <div className="text-foreground font-medium">{selectedInvoiceForUpdate?.invoiceNumber}</div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground-muted">New Status</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="input w-full bg-background-muted border-border"
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="EXPIRED">EXPIRED</option>
                                        <option value="SUSPENDED">SUSPENDED</option>
                                        <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                                        <option value="FULLY_PAID">FULLY_PAID</option>
                                        <option value="OVERDUE">OVERDUE</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeStatusModal}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={updatingStatus}
                                    >
                                        {updatingStatus ? <Loader className="animate-spin h-4 w-4" /> : 'Update Status'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default TenantInvoiceView;
