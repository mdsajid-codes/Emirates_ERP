import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { vatApi } from '../api/vatApi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const TaxTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    const [formData, setFormData] = useState({
        transactionDate: dayjs().format('YYYY-MM-DD'),
        transactionType: 'PAYABLE_INCREASE',
        paymentType: 'TAX',
        amount: '',
        description: ''
    });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await vatApi.getTaxTransactions();
            setTransactions(res.data);
        } catch (error) {
            toast.error('Failed to load tax transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await vatApi.createTaxTransaction(formData);
            toast.success('Transaction created successfully');
            setIsModalVisible(false);
            setFormData({
                transactionDate: dayjs().format('YYYY-MM-DD'),
                transactionType: 'PAYABLE_INCREASE',
                paymentType: 'TAX',
                amount: '',
                description: ''
            });
            fetchTransactions();
        } catch (error) {
            toast.error('Failed to create transaction');
        }
    };

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
                        <span className="text-foreground-muted font-medium">Tax Adjustments</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Tax Transactions</h1>
                </div>

                <button
                    onClick={() => setIsModalVisible(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-theme text-sm font-semibold shadow transition-all"
                >
                    <Plus className="h-4 w-4" />
                    New Tax Adjustment
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="bg-background-muted text-foreground-muted border-b border-border text-xs uppercase font-semibold">
                                <th className="p-3">Date</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Payment Type</th>
                                <th className="p-3 text-right">Amount (AED)</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Journal Entry</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-6 text-center text-foreground-muted">No tax transactions found.</td>
                                </tr>
                            ) : (
                                transactions.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-background-muted/40 transition-colors">
                                        <td className="p-3">{txn.transactionDate}</td>
                                        <td className="p-3 text-xs font-semibold uppercase">{txn.transactionType.replace('_', ' ')}</td>
                                        <td className="p-3 text-xs font-semibold uppercase">{txn.paymentType}</td>
                                        <td className="p-3 text-right font-mono font-medium">{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3">{txn.description}</td>
                                        <td className="p-3">
                                            {txn.journalEntryId ? (
                                                <Link to={`/account-dashboard/journal-entries/${txn.journalEntryId}`} className="text-primary hover:underline font-mono">
                                                    JE-{txn.journalEntryId}
                                                </Link>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-theme shadow-lg w-full max-w-md overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background-muted">
                            <h3 className="font-bold text-lg text-foreground">New Tax Transaction</h3>
                            <button onClick={() => setIsModalVisible(false)} className="text-foreground-muted hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1 uppercase">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.transactionDate}
                                        onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1 uppercase">Transaction Type</label>
                                    <select
                                        required
                                        value={formData.transactionType}
                                        onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="PAYABLE_INCREASE">Increase Payable (Credit)</option>
                                        <option value="PAYABLE_DECREASE">Decrease Payable (Debit)</option>
                                        <option value="RECOVERABLE_INCREASE">Increase Recoverable (Debit)</option>
                                        <option value="RECOVERABLE_DECREASE">Decrease Recoverable (Credit)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1 uppercase">Payment Type</label>
                                    <select
                                        required
                                        value={formData.paymentType}
                                        onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="TAX">Tax</option>
                                        <option value="PENALTIES">Penalties</option>
                                        <option value="INTEREST">Interest</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1 uppercase">Amount</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1 uppercase">Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalVisible(false)}
                                        className="px-4 py-2 rounded-theme text-sm font-semibold border border-border hover:bg-background-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-theme text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                    >
                                        Create Transaction
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default TaxTransactions;
