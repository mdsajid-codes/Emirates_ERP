import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    ArrowLeft, 
    Edit, 
    Loader, 
    Printer, 
    Download, 
    FileText,
    TrendingUp,
    Package,
    ShieldCheck
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const InfoCard = ({ title, value, icon: Icon, color = "text-primary" }) => (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-background-muted ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-xs font-black text-foreground-muted uppercase tracking-widest mb-1">{title}</p>
            <p className="text-lg font-bold text-foreground">{value || '---'}</p>
        </div>
    </div>
);

const SectionTitle = ({ children }) => (
    <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-primary rounded-full"></span>
        {children}
    </h3>
);

const PurAdditionalExpenseView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expense, setExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExpense = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/purchases/additional-expenses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setExpense(res.data);
            } catch (err) {
                console.error('Failed to fetch expense', err);
                setError('Failed to load expense details.');
            } finally {
                setLoading(false);
            }
        };
        fetchExpense();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary" size={48} /></div>;
    if (error) return <div className="p-8 text-center text-rose-500 font-bold">{error}</div>;
    if (!expense) return null;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
                <div>
                    <button onClick={() => navigate('/purchase-dashboard/additional-expenses')} className="flex items-center gap-2 text-primary font-bold mb-4 hover:underline">
                        <ArrowLeft size={18} /> Back to List
                    </button>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-black text-foreground">{expense.number || `EXP-${expense.id}`}</h1>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase ${
                            expense.status === 'Posted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                            {expense.status || 'Draft'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="p-3 bg-card border border-border rounded-xl text-foreground-muted hover:text-primary hover:border-primary transition-all shadow-sm">
                        <Printer size={20} />
                    </button>
                    <button className="p-3 bg-card border border-border rounded-xl text-foreground-muted hover:text-primary hover:border-primary transition-all shadow-sm">
                        <Download size={20} />
                    </button>
                    <button 
                        onClick={() => navigate(`/purchase-dashboard/additional-expenses/edit/${id}`)}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Edit size={18} /> Edit Record
                    </button>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <InfoCard title="Total Expense" value={`${expense.totalAmount?.toLocaleString()} ${expense.currency}`} icon={TrendingUp} color="text-emerald-500" />
                <InfoCard title="Supplier" value={expense.supplierName} icon={ ShieldCheck } color="text-blue-500" />
                <InfoCard title="Date" value={new Date(expense.date).toLocaleDateString()} icon={FileText} color="text-amber-500" />
                <InfoCard title="PO Reference" value={expense.poNumber} icon={Package} color="text-indigo-500" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-12">
                    {/* Expense Lines */}
                    <section>
                        <SectionTitle>Expense Items (G/L Accounts)</SectionTitle>
                        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-background-muted text-[10px] uppercase font-black tracking-widest text-foreground-muted">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Account</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-left">Tax</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {(expense.expenseLines || []).map((line, i) => (
                                        <tr key={i} className="hover:bg-background-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-foreground">[{line.category}] {line.productName} ({line.itemCode})</td>
                                            <td className="px-6 py-4 text-right font-mono">{line.amount?.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-foreground-muted">{line.taxCode || 'No Tax'} ({line.taxAmount?.toFixed(2)})</td>
                                            <td className="px-6 py-4 text-right font-black text-primary">{line.totalAmount?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Inventory Items */}
                    <section>
                        <SectionTitle>Inventory Allocation</SectionTitle>
                        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-background-muted text-[10px] uppercase font-black tracking-widest text-foreground-muted">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Item</th>
                                        <th className="px-6 py-4 text-left">Batch</th>
                                        <th className="px-6 py-4 text-right">Qty</th>
                                        <th className="px-6 py-4 text-left">UOM</th>
                                        <th className="px-6 py-4 text-right bg-emerald-50/50">Allocated Expense</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {(expense.inventoryItems || []).map((item, i) => (
                                        <tr key={i} className="hover:bg-background-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-foreground">{item.productName || 'Product ID: ' + item.productId}</td>
                                            <td className="px-6 py-4 text-sm font-mono text-foreground-muted">{item.batch || '---'}</td>
                                            <td className="px-6 py-4 text-right font-mono">{item.quantity}</td>
                                            <td className="px-6 py-4 text-left">{item.unitName || '---'}</td>
                                            <td className="px-6 py-4 text-right font-black text-emerald-600 bg-emerald-50/20">{item.expenseAmount?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    {/* General Section */}
                    <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-6">General Details</h4>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-foreground-muted mb-1">Contract</p>
                                <p className="font-bold">{expense.contract || '---'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-foreground-muted mb-1">Transaction Type</p>
                                <p className="font-bold">{expense.transactionType}</p>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-background-muted rounded-xl">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-foreground-muted mb-1">Currency</p>
                                    <p className="font-black text-primary">{expense.currency}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-foreground-muted mb-1">Exchange Rate</p>
                                    <p className="font-mono font-bold">{expense.exchangeRate?.toFixed(4)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comment Section */}
                    <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground-muted mb-4">Comments</h4>
                        <p className="text-sm italic text-foreground/70 leading-relaxed">
                            {expense.comment || 'No additional comments provided for this record.'}
                        </p>
                    </div>

                    {/* Meta Data */}
                    <div className="px-4 text-[10px] uppercase font-bold text-foreground-muted/50 space-y-2">
                        <div className="flex justify-between">
                            <span>Record Created</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Last Modified</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>System ID</span>
                            <span>{expense.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurAdditionalExpenseView;
