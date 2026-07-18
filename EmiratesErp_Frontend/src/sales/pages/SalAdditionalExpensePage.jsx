import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, Loader, AlertCircle, Search, Eye } from 'lucide-react';
import Pagination from '../../components/Pagination';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const SalAdditionalExpensePage = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Pagination State
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchExpenses = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/sales/additional-expenses`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, size, sort: 'date,desc' }
            });
            
            if (res.data.content) {
                setExpenses(res.data.content);
                setTotalPages(res.data.totalPages);
                setTotalElements(res.data.totalElements);
            } else {
                const data = res.data || [];
                setExpenses(data);
                setTotalPages(1);
                setTotalElements(data.length);
            }
        } catch (err) {
            console.error('Failed to fetch additional expenses:', err);
            setError('Failed to fetch additional expenses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [page, size]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this additional expense?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/sales/additional-expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchExpenses();
        } catch (err) {
            console.error('Failed to delete additional expense', err);
            setError('Failed to delete additional expense.');
        }
    };

    const filtered = expenses.filter(exp =>
        (exp.number && exp.number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exp.companyName && exp.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exp.transactionType && exp.transactionType.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const statusClass = (s) => {
        if (!s) return 'bg-slate-100 text-slate-800';
        switch (s.toLowerCase()) {
            case 'posted': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Additional Expenses</h1>
                    <p className="text-foreground-muted mt-1">Track and allocate additional costs to your sales.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by Number / Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input w-full sm:w-72 pr-10 bg-background-muted border-border"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    </div>
                    <Link to="/sales-dashboard/additional-expenses/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-md">
                        <PlusCircle size={18} /> Create
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-center gap-3 shadow-sm">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
                {loading ? (
                    <div className="flex justify-center items-center h-80">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-background-muted">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">Number</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">Customer / Company</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-foreground-muted uppercase tracking-wider">Total Expense</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">Transaction Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-foreground-muted uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border text-foreground/80">
                                    {filtered.length > 0 ? filtered.map(exp => (
                                        <tr key={exp.id} className="hover:bg-background-muted transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                                <button onClick={() => navigate(`/sales-dashboard/additional-expenses/view/${exp.id}`)} className="hover:underline">
                                                    {exp.number || `EXP-${exp.id}`}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{exp.companyName || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                                                {(exp.totalExpenseAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {exp.currency}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{exp.transactionType || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusClass(exp.status)}`}>
                                                    {exp.status || 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => navigate(`/sales-dashboard/additional-expenses/view/${exp.id}`)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md" title="View"><Eye size={16} /></button>
                                                    <button onClick={() => navigate(`/sales-dashboard/additional-expenses/edit/${exp.id}`)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-md" title="Edit"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md" title="Delete"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-20">
                                                <div className="flex flex-col items-center justify-center text-foreground-muted">
                                                    <AlertCircle size={48} className="opacity-20 mb-4" />
                                                    <h3 className="text-lg font-medium">No additional expenses found</h3>
                                                    <p className="text-sm">Create a new additional expense record to track costs.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            pageSize={size}
                            onPageSizeChange={(newSize) => { setSize(newSize); setPage(0); }}
                            totalElements={totalElements}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default SalAdditionalExpensePage;
