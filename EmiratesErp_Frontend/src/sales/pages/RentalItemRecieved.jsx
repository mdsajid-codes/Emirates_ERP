import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Search, ChevronLeft, ChevronRight, Eye, MousePointerClick, Package, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RentalItemRecieved = () => {
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [orderStats, setOrderStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch stats for loaded orders
    useEffect(() => {
        const fetchStats = async () => {
            if (orders.length === 0) return;

            const statsMap = {};
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            await Promise.all(orders.map(async (order) => {
                try {
                    const res = await axios.get(`${API_URL}/sales/rental-item-received/by-order/${order.id}`, { headers });
                    const logs = res.data || [];

                    let totalReceived = 0;
                    logs.forEach(log => {
                        log.items?.forEach(i => totalReceived += (i.currentReceiveQuantity || 0));
                    });

                    const totalOrdered = order.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
                    const remaining = Math.max(0, totalOrdered - totalReceived);

                    let status = 'PENDING';
                    if (totalReceived >= totalOrdered && totalOrdered > 0) status = 'FULLY_RETURNED';
                    else if (totalReceived > 0) status = 'PARTIAL_RETURNED';

                    statsMap[order.id] = { received: totalReceived, remaining: remaining, status: status };
                } catch (e) {
                    console.error(`Failed to fetch stats for order ${order.id}`, e);
                    statsMap[order.id] = { received: 0, remaining: order.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0, status: 'PENDING' };
                }
            }));

            setOrderStats(prev => ({ ...prev, ...statsMap }));
        };

        fetchStats();
    }, [orders]);

    // Filters
    const [filters, setFilters] = useState({
        customerName: '',
        fromDate: '',
        toDate: ''
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                search: filters.customerName || null,
                fromDate: filters.fromDate || null,
                toDate: filters.toDate || null
            };

            const response = await axios.get(`${API_URL}/sales/rental-sales-orders`, { params, ...authHeaders });

            setOrders(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setError(null);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError('Failed to fetch data');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, authHeaders]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(0);
    };

    const getReturnStatusBadge = (statusKey) => {
        switch (statusKey) {
            case 'FULLY_RETURNED':
                return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E0F5EB] text-[#00862E]">{t('rentalReceived.fully')}</span>;
            case 'PARTIAL_RETURNED':
                return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFF3E5] text-[#FF8800]">{t('rentalReceived.partial')}</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F7FC] text-[#617198]">{t('rentalReceived.pending')}</span>;
        }
    };

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Package size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {t('rentalReceived.title')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            Home &gt; Sales &gt; {t('rentalReceived.title')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Single Row Compact Filters */}
            <div className="bg-card p-2 rounded-lg border border-border shadow-2xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('rentalReceived.customerName')}</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="customerName"
                                value={filters.customerName}
                                onChange={handleFilterChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 pl-7 text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                                placeholder={t('quotation.searchCustomer')}
                            />
                            <Search size={12} className="absolute left-2 top-2 text-foreground-muted pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('quotation.fromDate')}</label>
                        <div className="relative">
                            <input
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary pr-6"
                            />
                            <Calendar size={12} className="absolute right-1.5 top-1.5 text-foreground-muted pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('quotation.toDate')}</label>
                        <div className="relative">
                            <input
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                                className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary pr-6"
                            />
                            <Calendar size={12} className="absolute right-1.5 top-1.5 text-foreground-muted pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={fetchOrders}
                            className="w-full h-7 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        >
                            <Search size={12} /> {t('quotation.filterBtn')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-lg border border-border shadow-2xs overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center p-8">
                        <Loader2 className="animate-spin text-primary h-7 w-7" />
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-rose-500 text-xs font-semibold">{error}</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px] text-left border-collapse">
                                <thead>
                                    <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                        <th className="px-2 py-1.5 border-r border-border text-center w-10">{t('quotation.sno')}</th>
                                        <th className="px-2 py-1.5 border-r border-border">{t('qview.quotationDate')}</th>
                                        <th className="px-2 py-1.5 border-r border-border">{t('qview.expiryDate')}</th>
                                        <th className="px-2 py-1.5 border-r border-border">{t('rentalReceived.dcNo')}</th>
                                        <th className="px-2 py-1.5 border-r border-border">{t('qview.refNo')}</th>
                                        <th className="px-2 py-1.5 border-r border-border">{t('rentalReceived.customerName')}</th>
                                        <th className="px-2 py-1.5 border-r border-border text-center">{t('rentalReceived.receivedQty')}</th>
                                        <th className="px-2 py-1.5 border-r border-border text-center">{t('rentalReceived.remainingQty')}</th>
                                        <th className="px-2 py-1.5 border-r border-border text-center">{t('rentalReceived.returnStatus')}</th>
                                        <th className="px-2 py-1.5 text-center w-40">{t('quotation.action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="px-4 py-8 text-center text-foreground-muted">
                                                {t('quotation.noRecords')}
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order, index) => {
                                            const stats = orderStats[order.id] || { received: 0, remaining: 0, status: 'PENDING' };
                                            const totalOrdered = order.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;

                                            return (
                                                <tr key={order.id} className="hover:bg-hover transition-colors text-foreground">
                                                    <td className="px-2 py-1.5 text-center border-r border-border font-medium text-foreground-muted">
                                                        {currentPage * pageSize + index + 1}
                                                    </td>
                                                    <td className="px-2 py-1.5 border-r border-border">
                                                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-2 py-1.5 border-r border-border">
                                                        {order.toDate ? new Date(order.toDate).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td
                                                        className="px-2 py-1.5 border-r border-border font-semibold text-primary cursor-pointer hover:underline"
                                                        onClick={() => navigate(`/sales-dashboard/rental-item-received/by-order/${order.id}`)}
                                                    >
                                                        {order.orderNumber}
                                                    </td>
                                                    <td className="px-2 py-1.5 border-r border-border text-foreground-muted">
                                                        {order.reference || '-'}
                                                    </td>
                                                    <td className="px-2 py-1.5 border-r border-border font-semibold">
                                                        {order.customerName}
                                                    </td>
                                                    <td className="px-2 py-1.5 border-r border-border text-center font-bold text-sky-600 font-mono">
                                                        {stats.received}
                                                    </td>
                                                    <td className="px-2 py-1.5 border-r border-border text-center font-bold text-amber-600 font-mono">
                                                        {Math.max(0, totalOrdered - stats.received)}
                                                    </td>
                                                    <td className="px-2 py-1.5 border-r border-border text-center">
                                                        {getReturnStatusBadge(stats.status)}
                                                    </td>
                                                    <td className="px-2 py-1.5 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/sales-dashboard/rental-item-received/new?orderId=${order.id}`)}
                                                                className="px-2 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                                                                title={t('rentalReceived.receiveBtn')}
                                                            >
                                                                <MousePointerClick size={11} /> {t('rentalReceived.receiveBtn')}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/sales-dashboard/rental-item-received/by-order/${order.id}`)}
                                                                className="w-5 h-5 rounded border border-border flex items-center justify-center text-foreground hover:bg-hover transition-colors"
                                                                title={t('qview.title')}
                                                            >
                                                                <Eye size={11} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-2 border-t border-border flex justify-between items-center text-[11px] text-foreground-muted bg-background">
                            <span>
                                Showing {orders.length} of {totalPages * pageSize} entries
                            </span>
                            <div className="flex gap-1 items-center">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                    disabled={currentPage === 0}
                                    className="px-2 py-1 bg-card border border-border rounded hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center text-foreground"
                                >
                                    <ChevronLeft size={12} className="mr-0.5" /> Previous
                                </button>
                                <div className="flex gap-0.5">
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i)}
                                            className={`w-6 h-6 flex items-center justify-center rounded border text-[11px] font-medium ${currentPage === i
                                                ? 'bg-primary text-primary-foreground border-primary font-bold'
                                                : 'bg-card text-foreground border-border hover:bg-hover'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-2 py-1 bg-card border border-border rounded hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center text-foreground"
                                >
                                    Next <ChevronRight size={12} className="ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RentalItemRecieved;
