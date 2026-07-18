import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RefreshCw, Calculator, FileText, Settings } from 'lucide-react';
import dayjs from 'dayjs';
import { vatApi } from '../api/vatApi';
import { toast } from 'react-toastify';

const VatDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [dateTo, setDateTo] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
    const [liability, setLiability] = useState({
        totalOutputVat: 0,
        totalInputVat: 0,
        netVatLiability: 0
    });

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await vatApi.getLiability(dateFrom, dateTo);
            setLiability(response.data);
        } catch (error) {
            toast.error('Failed to fetch VAT liability');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [dateFrom, dateTo]);

    const isLiability = liability.netVatLiability > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground"
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
                        <Link to="/account-dashboard" className="hover:text-primary">Accounting</Link>
                        <span>&gt;</span>
                        <span className="text-foreground-muted font-medium">VAT Dashboard</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">VAT Dashboard</h1>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-3 py-1.5 bg-background border border-border rounded-theme text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                    <span className="text-foreground-muted">to</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-3 py-1.5 bg-background border border-border rounded-theme text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                    <button
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="p-2 ml-2 bg-background-muted text-foreground-muted hover:text-primary rounded-theme transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card border border-border rounded-theme p-6 shadow-sm flex flex-col justify-between">
                    <span className="text-sm font-semibold text-foreground-muted mb-2">Total Output VAT (Payable)</span>
                    <span className="text-3xl font-mono font-bold text-error">
                        {liability.totalOutputVat.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-foreground-muted">AED</span>
                    </span>
                </div>
                
                <div className="bg-card border border-border rounded-theme p-6 shadow-sm flex flex-col justify-between">
                    <span className="text-sm font-semibold text-foreground-muted mb-2">Total Input VAT (Recoverable)</span>
                    <span className="text-3xl font-mono font-bold text-success">
                        {liability.totalInputVat.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-foreground-muted">AED</span>
                    </span>
                </div>

                <div className="bg-card border border-border rounded-theme p-6 shadow-sm flex flex-col justify-between">
                    <span className="text-sm font-semibold text-foreground-muted mb-2">Net VAT {isLiability ? 'Liability' : 'Recoverable'}</span>
                    <span className={`text-3xl font-mono font-bold ${isLiability ? 'text-error' : 'text-success'}`}>
                        {Math.abs(liability.netVatLiability).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-foreground-muted">AED</span>
                    </span>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        to="/account-dashboard/vat/return"
                        className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-theme shadow-sm hover:border-primary hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-3">
                            <Calculator className="h-6 w-6" />
                        </div>
                        <span className="font-semibold text-sm">Generate VAT Return</span>
                        <span className="text-xs text-foreground-muted text-center mt-1">Calculate FTA format return</span>
                    </Link>

                    <Link
                        to="/account-dashboard/vat/reports"
                        className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-theme shadow-sm hover:border-primary hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-3">
                            <FileText className="h-6 w-6" />
                        </div>
                        <span className="font-semibold text-sm">VAT Reports</span>
                        <span className="text-xs text-foreground-muted text-center mt-1">View input/output details</span>
                    </Link>

                    <Link
                        to="/account-dashboard/vat/setup"
                        className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-theme shadow-sm hover:border-primary hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-3">
                            <Settings className="h-6 w-6" />
                        </div>
                        <span className="font-semibold text-sm">VAT Configuration</span>
                        <span className="text-xs text-foreground-muted text-center mt-1">Manage rates and groups</span>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default VatDashboard;
