import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Search, Package, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const DeliveryOrder = () => {
    const navigate = useNavigate();
    const { isRTL, t } = useLanguage();
    const [searchParams] = useSearchParams();
    const salesOrderIdParam = searchParams.get('salesOrderId');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [customerName, setCustomerName] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedTeamMember, setSelectedTeamMember] = useState('');
    const [employees, setEmployees] = useState([]);

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${API_URL}/employees/all`, authHeaders);
            setEmployees(response.data || []);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                customerName: customerName,
                startDate: fromDate,
                endDate: toDate,
                salespersonId: selectedTeamMember,
                salesOrderId: salesOrderIdParam
            };

            const response = await axios.get(`${API_URL}/sales/delivery-orders`, { params, ...authHeaders });
            setOrders(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setError(null);
        } catch (err) {
            setError('Failed to fetch delivery orders. Please try again.');
            console.error("Error fetching delivery orders:", err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, authHeaders, customerName, fromDate, toDate, selectedTeamMember, salesOrderIdParam]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this delivery order?')) {
            try {
                await axios.delete(`${API_URL}/sales/delivery-orders/${id}`, authHeaders);
                fetchOrders();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete delivery order.'}`);
            }
        }
    };

    const handleView = (id) => {
        navigate(`/sales-dashboard/delivery-orders/${id}`);
    };

    return (
        <div className="space-y-2 bg-background min-h-screen text-foreground font-sans w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header section matching Quotation.jsx */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Package size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {t('nav.deliveryOrders')}
                        </h1>
                        <div className="text-[10px] text-foreground-muted flex items-center gap-1 leading-none mt-0.5">
                            <span>{t('dashboard.breadcrumb.home')}</span> &gt; <span>{t('nav.sales')}</span> &gt; <span className="text-foreground font-medium">{t('nav.deliveryOrders')}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/sales-dashboard/delivery-orders/new')}
                    className="px-3.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs self-end sm:self-auto"
                >
                    <Plus size={12} /> {t('so.newBtn')}
                </button>
            </div>

            {/* Filter Section Card */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 items-end">
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('rentalReceived.customerName')}</label>
                        <input
                            type="text"
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                            placeholder={t('quotation.searchCustomer')}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('quotation.fromDate')}</label>
                        <input
                            type="date"
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('quotation.toDate')}</label>
                        <input
                            type="date"
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('qform.salesperson')}</label>
                        <select
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                            value={selectedTeamMember}
                            onChange={(e) => setSelectedTeamMember(e.target.value)}
                        >
                            <option value="">{t('qform.selectSalesperson')}</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button
                            onClick={fetchOrders}
                            className="w-full h-7 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        >
                            <Search size={12} /> {t('quotation.search')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                <div className="flex justify-between items-center text-[11px] text-foreground-muted pb-1 border-b border-border">
                    <div className="flex items-center gap-1.5">
                        <span>Show</span>
                        <select
                            className="h-6 text-[10px] border border-border bg-background rounded px-1 text-foreground focus:outline-none focus:border-primary"
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </div>
                </div>

                <div className="rounded border border-border overflow-x-auto">
                    <table className="w-full text-[10px] text-left border-collapse">
                        <thead>
                            <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                <th className="px-2 py-1.5 border-r border-border w-8 text-center">{t('quotation.sno')}</th>
                                <th className="px-2 py-1.5 border-r border-border">{t('qview.quotationDate')}</th>
                                <th className="px-2 py-1.5 border-r border-border">DO Number</th>
                                <th className="px-2 py-1.5 border-r border-border">{t('so.orderNo')}</th>
                                <th className="px-2 py-1.5 border-r border-border">{t('rentalReceived.customerName')}</th>
                                <th className="px-2 py-1.5 border-r border-border">{t('qview.refNo')}</th>
                                <th className="px-2 py-1.5 border-r border-border text-center">{t('quotation.status')}</th>
                                <th className="px-2 py-1.5 border-r border-border text-right">{t('rentalOrder.orderAmount')}</th>
                                <th className="px-2 py-1.5 text-center w-16">{t('quotation.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="py-8 text-center text-foreground-muted">
                                        <Loader2 className="animate-spin h-5 w-5 mx-auto text-primary" />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="9" className="py-8 text-center text-rose-500 font-medium">{error}</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-8 text-center text-foreground-muted font-medium">
                                        {t('quotation.noRecord')}
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order, index) => (
                                    <tr key={order.id} className="hover:bg-hover transition-colors text-foreground">
                                        <td className="px-2 py-1 border-r border-border text-center text-foreground-muted">
                                            {currentPage * pageSize + index + 1}
                                        </td>
                                        <td className="px-2 py-1 border-r border-border whitespace-nowrap">
                                            {order.deliveryOrderDate ? new Date(order.deliveryOrderDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-2 py-1 border-r border-border font-bold">
                                            <button
                                                onClick={() => handleView(order.id)}
                                                className="text-primary hover:underline"
                                            >
                                                {typeof order.deliveryOrderNumber === 'string' ? order.deliveryOrderNumber : `DO-${order.id}`}
                                            </button>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            {typeof order.salesOrderNumber === 'string' ? order.salesOrderNumber : '-'}
                                        </td>
                                        <td className="px-2 py-1 border-r border-border font-medium">
                                            {typeof order.customerName === 'string' ? order.customerName : 'N/A'}
                                        </td>
                                        <td className="px-2 py-1 border-r border-border">
                                            {typeof order.reference === 'string' ? order.reference : '-'}
                                        </td>
                                        <td className="px-2 py-1 border-r border-border text-center">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold text-white ${order.status === 'DELIVERED' ? 'bg-emerald-600' : order.status === 'OPEN' ? 'bg-blue-500' : order.status === 'CANCELLED' ? 'bg-rose-600' : 'bg-slate-400'}`}>
                                                {typeof order.status === 'string' ? order.status : 'DRAFT'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-1 border-r border-border text-right font-mono font-semibold">
                                            AED {Number(order.netTotal || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => navigate(`/sales-dashboard/delivery-orders/edit/${order.id}`)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-foreground-muted hover:bg-hover hover:text-primary transition-colors"
                                                    title={t('qview.edit')}
                                                >
                                                    <Edit size={11} />
                                                </button>
                                                <button
                                                    onClick={() => handleView(order.id)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-foreground-muted hover:bg-hover hover:text-primary transition-colors"
                                                    title={t('qview.view')}
                                                >
                                                    <Eye size={11} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(order.id)}
                                                    className="w-5 h-5 rounded border border-border flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                                                    title={t('qview.delete')}
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center pt-1 text-[11px] text-foreground-muted">
                    <div>
                        Showing page <span className="font-semibold text-foreground">{currentPage + 1}</span> of <span className="font-semibold text-foreground">{totalPages || 1}</span>
                    </div>
                    <div className="flex gap-1">
                        <button
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            className="px-2 py-0.5 border border-border bg-card hover:bg-hover rounded disabled:opacity-40 text-foreground"
                        >
                            <ChevronLeft size={12} />
                        </button>
                        <button
                            disabled={currentPage >= totalPages - 1}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-2 py-0.5 border border-border bg-card hover:bg-hover rounded disabled:opacity-40 text-foreground"
                        >
                            <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryOrder;
