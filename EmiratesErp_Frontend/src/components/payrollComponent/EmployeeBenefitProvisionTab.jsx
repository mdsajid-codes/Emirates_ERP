import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, PlusCircle, Edit, Trash2, HandCoins, Eye, Download } from 'lucide-react';
import EmployeeBenefitProvisionForm from './EmployeeBenefitProvisionForm';
import ProvisionPayoutForm from './ProvisionPayoutForm';

const statusStyles = {
    ACCRUING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    PAID_OUT: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    EXPIRED: 'bg-foreground-muted/10 text-foreground-muted border-border',
    CANCELLED: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

const StatusBadge = ({ status }) => {
    const style = statusStyles[status] || 'bg-foreground-muted/10 text-foreground-muted border-border';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${style}`}>
            {status?.replace('_', ' ').toLowerCase() || 'unknown'}
        </span>
    );
};

const formatCurrency = (amount, currency = 'AED') => new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount || 0);

const EmployeeBenefitProvisionTab = ({ employee }) => {
    const [provisions, setProvisions] = useState([]);
    const [salaryStructure, setSalaryStructure] = useState(null);
    const [benefitTypes, setBenefitTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // View state: 'list' | 'add' | 'payout'
    const [viewMode, setViewMode] = useState('list');
    const [payoutProvision, setPayoutProvision] = useState(null);
    const [editingProvision, setEditingProvision] = useState(null);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchProvisions = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [provisionsRes, benefitTypesRes, structureRes] = await Promise.all([
                axios.get(`${API_URL}/provisions/employee/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } }),
                axios.get(`${API_URL}/benefit-types`, { headers: { "Authorization": `Bearer ${token}` } }),
                axios.get(`${API_URL}/salary-structures/employee/${employee.employeeCode}`, { headers }).catch(() => ({ data: null }))
            ]);
            setProvisions(provisionsRes.data);
            setBenefitTypes(benefitTypesRes.data);
            setSalaryStructure(structureRes.data);
        } catch (error) {
            console.error("Error fetching benefit provisions:", error);
        } finally {
            setLoading(false);
        }
    }, [employee.employeeCode, API_URL]);

    useEffect(() => {
        fetchProvisions();
    }, [fetchProvisions]);

    const handleAdd = () => {
        setEditingProvision(null);
        setViewMode('add');
    };

    const handleEdit = (provision) => {
        setEditingProvision({
            ...provision,
            cycleStartDate: provision.cycleStartDate?.split('T')[0] || '',
            cycleEndDate: provision.cycleEndDate?.split('T')[0] || '',
        });
        setViewMode('add');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this benefit provision?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/provisions/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchProvisions();
            } catch (error) {
                alert('Failed to delete provision.');
            }
        }
    };

    const handleSave = async (data) => {
        const token = localStorage.getItem('token');
        const request = editingProvision
            ? axios.put(`${API_URL}/provisions/${editingProvision.id}`, data, { headers: { "Authorization": `Bearer ${token}` } })
            : axios.post(`${API_URL}/provisions`, data, { headers: { "Authorization": `Bearer ${token}` } });

        try {
            await request;
            fetchProvisions();
            setViewMode('list');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save provision.');
        }
    };

    const handlePayout = (provision) => {
        setPayoutProvision(provision);
        setViewMode('payout');
    };

    const handleSavePayout = async (formData) => {
        if (!payoutProvision) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/provisions/${payoutProvision.id}/payout`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            fetchProvisions();
            setViewMode('list');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save payout.');
        }
    };

    const handleViewConfirmation = async (filePath) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/files/download/${filePath}`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: response.headers['content-type'] });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
            setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
        } catch (err) {
            alert("Could not load the confirmation file. It may not exist or an error occurred.");
        }
    };

    const handleDownloadVoucher = async (provisionId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/provisions/${provisionId}/download-voucher`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let filename = `BenefitVoucher-${provisionId}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length > 1) filename = filenameMatch[1];
            }
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) { alert('Failed to download voucher.'); }
    };

    const getProvisionTotalAmount = (provision) => {
        const benefitType = benefitTypes.find(bt => bt.name === provision.benefitTypeName);
        if (!benefitType) return 0;

        switch (benefitType.calculationType) {
            case 'FLAT_AMOUNT':
                return benefitType.valueForAccrual;
            case 'PERCENTAGE_OF_BASIC':
                if (!salaryStructure || !salaryStructure.components) return 0;
                const basicComponent = salaryStructure.components.find(c => c.componentCode === 'BASIC');
                if (!basicComponent || !basicComponent.value) return 0;
                
                const basicSalary = parseFloat(basicComponent.value);
                const percentage = parseFloat(benefitType.valueForAccrual);
                return (basicSalary * percentage) / 100;
            default:
                return 0;
        }
    };

    if (loading) return <div className="flex justify-center items-center p-6"><Loader className="animate-spin h-5 w-5 text-primary" /></div>;

    if (viewMode === 'add') {
        return (
            <EmployeeBenefitProvisionForm
                initialData={editingProvision}
                onSave={handleSave}
                onCancel={() => setViewMode('list')}
                employeeCode={employee.employeeCode}
            />
        );
    }

    if (viewMode === 'payout') {
        return (
            <ProvisionPayoutForm
                provision={payoutProvision}
                onSave={handleSavePayout}
                onCancel={() => setViewMode('list')}
            />
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-foreground">Benefit Provisions</h3>
                <button
                    onClick={handleAdd}
                    className="px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs"
                >
                    <PlusCircle size={13} /> Add Provision
                </button>
            </div>

            {provisions.length === 0 ? (
                <div className="p-6 text-center border border-border rounded-lg bg-card">
                    <p className="text-xs text-foreground-muted">No benefit provisions found for this employee.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="min-w-full bg-card text-foreground divide-y divide-border">
                        <thead className="bg-background-muted/60">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Benefit</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Total Amount</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Accrued</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Cycle Dates</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Payout Info</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {provisions.map(p => (
                                <tr key={p.id} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs font-semibold text-foreground">{p.benefitTypeName}</td>
                                    <td className="px-3 py-2 text-xs font-medium text-foreground">{formatCurrency(getProvisionTotalAmount(p))}</td>
                                    <td className="px-3 py-2 text-xs text-foreground-muted">{formatCurrency(p.accruedAmount)}</td>
                                    <td className="px-3 py-2 text-xs text-foreground-muted whitespace-nowrap">{p.cycleStartDate} to {p.cycleEndDate}</td>
                                    <td className="px-3 py-2 text-xs"><StatusBadge status={p.status} /></td>
                                    <td className="px-3 py-2 text-xs text-foreground-muted">
                                        {p.paidOutDate && <div>Paid: {p.paidOutDate}</div>}
                                        {p.paymentDetails && <div className="truncate max-w-[140px]" title={p.paymentDetails}>{p.paymentDetails}</div>}
                                        {p.confirmationFiles && p.confirmationFiles.length > 0 && (
                                            <div className="mt-0.5 space-y-0.5">
                                                {p.confirmationFiles.map(file => (
                                                    <button key={file.id} onClick={() => handleViewConfirmation(file.filePath)} className="text-primary hover:underline flex items-center gap-1 w-full truncate text-[11px]">
                                                        <Eye size={12}/> <span className="truncate">{file.originalFilename}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-right whitespace-nowrap">
                                        {p.status === 'ACCRUING' && (
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handlePayout(p)} className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-colors border border-border bg-background" title="Pay Out"><HandCoins size={13} /></button>
                                                <button onClick={() => handleEdit(p)} className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors border border-border bg-background" title="Edit"><Edit size={13} /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors border border-border bg-background" title="Delete"><Trash2 size={13} /></button>
                                            </div>
                                        )}
                                        {p.status === 'PAID_OUT' && (
                                            <button onClick={() => handleDownloadVoucher(p.id)} className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors border border-border bg-background" title="Download Voucher">
                                                <Download size={13} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EmployeeBenefitProvisionTab;