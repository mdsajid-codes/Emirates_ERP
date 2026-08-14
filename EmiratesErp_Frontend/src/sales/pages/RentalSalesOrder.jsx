import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Loader2, Edit, Trash2, ShoppingCart, Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import PaymentScheduleModal from '../components/PaymentScheduleModal';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getStatusBadge = (status) => {
    const s = (status || 'DRAFT').toUpperCase();
    switch (s) {
        case 'DRAFT':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F7FC] text-[#617198]">DRAFT</span>;
        case 'SENT':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E7F1FF] text-[#1263E9]">SENT</span>;
        case 'ACCEPTED':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E0F5EB] text-[#00862E]">ACCEPTED</span>;
        case 'REJECTED':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FDE8E8] text-[#D03D4E]">REJECTED</span>;
        case 'INVOICED':
        case 'RENTAL_INVOICED':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-200">INVOICED</span>;
        case 'CANCELLED':
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-600 border border-orange-200">CANCELLED</span>;
        default:
            return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F7FC] text-[#617198]">{s}</span>;
    }
};

const RentalSalesOrder = () => {
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        customerName: '',
        fromDate: '',
        toDate: '',
        status: 'All',
        teamMember: ''
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/employees/all`, authHeaders);
            setEmployees(response.data || []);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    }, [authHeaders]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                search: filters.customerName || undefined,
                fromDate: filters.fromDate || undefined,
                toDate: filters.toDate || undefined,
                status: filters.status !== 'All' ? filters.status : undefined,
                salespersonId: filters.teamMember || undefined
            };
            const response = await axios.get(`${API_URL}/sales/rental-sales-orders`, { params, ...authHeaders });
            let fetchedOrders = response.data.content || response.data || [];

            const customerIds = [...new Set(fetchedOrders.map(q => q.customerId).filter(Boolean))];

            if (customerIds.length > 0) {
                const partyPromises = customerIds.map(id =>
                    axios.get(`${API_URL}/parties/${id}`, authHeaders)
                        .then(res => ({ id, data: res.data }))
                        .catch(() => ({ id, data: null }))
                );

                const parties = await Promise.all(partyPromises);
                const partyMap = parties.reduce((acc, curr) => {
                    if (curr.data) acc[curr.id] = curr.data;
                    return acc;
                }, {});

                fetchedOrders = fetchedOrders.map(q => ({
                    ...q,
                    customerParty: partyMap[q.customerId] || q.customerParty
                }));
            }

            setOrders(fetchedOrders);
            setTotalPages(response.data.totalPages || 1);
            setError(null);
        } catch (err) {
            setError('Failed to fetch rental sales orders. Please try again.');
            console.error('Error fetching rental sales orders:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, authHeaders]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(0);
    };

    const handleOpenPaymentSchedule = (order) => {
        setSelectedOrder(order);
        setIsPaymentModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this rental sales order?')) {
            try {
                await axios.delete(`${API_URL}/sales/rental-sales-orders/${id}`, authHeaders);
                fetchOrders();
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete order.'}`);
            }
        }
    };

    return (
        <div className="bg-background text-foreground font-sans space-y-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <ShoppingCart size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {t('rentalOrder.title')}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            Home &gt; Sales &gt; {t('rentalOrder.title')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/sales-dashboard/rental-sales-orders/new')}
                    className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs self-end sm:self-auto"
                >
                    <Plus size={14} /> {t('rentalOrder.newBtn')}
                </button>
            </div>

            {/* Single Row Compact Filter Grid */}
            <div className="bg-card p-2 rounded-lg border border-border shadow-2xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('quotation.customerName')}</label>
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

                    <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">{t('quotation.teamMember')}</label>
                        <select
                            name="teamMember"
                            value={filters.teamMember}
                            onChange={handleFilterChange}
                            className="w-full h-7 text-[11px] border border-border bg-background rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="">{t('quotation.allMembers')}</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                            ))}
                        </select>
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

            {/* Orders Table */}
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
                                        <th className="px-2 py-1.5 border-r border-border">{t('rentalOrder.orderNumber')}</th>
                                        <th className="px-2 py-1.5 border-r border-border">{t('rentalOrder.shipmentDate')}</th>
                                        <th className="px-2 py-1.5 border-r border-border">{t('qview.refNo')}</th>
                                        <th className="px-2 py-1.5 border-r border-border">{t('rentalReceived.customerName')}</th>
                                        <th className="px-2 py-1.5 border-r border-border text-center">{t('quotation.status')}</th>
                                        <th className="px-2 py-1.5 border-r border-border text-right">{t('rentalOrder.orderAmount')}</th>
                                        <th className="px-2 py-1.5 border-r border-border text-right">{t('qview.amount')}</th>
                                        <th className="px-2 py-1.5 text-center w-36">{t('quotation.action')}</th>
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
                                        orders.map((order, index) => (
                                            <tr key={order.id} className="hover:bg-hover transition-colors text-foreground">
                                                <td className="px-2 py-1.5 text-center border-r border-border font-medium text-foreground-muted">
                                                    {currentPage * pageSize + index + 1}
                                                </td>
                                                <td className="px-2 py-1.5 border-r border-border">
                                                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}
                                                </td>
                                                <td
                                                    className="px-2 py-1.5 border-r border-border font-semibold text-primary cursor-pointer hover:underline"
                                                    onClick={() => navigate(`/sales-dashboard/rental-sales-orders/${order.id}`)}
                                                >
                                                    {order.orderNumber}
                                                </td>
                                                <td className="px-2 py-1.5 border-r border-border">
                                                    {order.shipmentDate ? new Date(order.shipmentDate).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-2 py-1.5 border-r border-border text-foreground-muted">
                                                    {order.reference || '-'}
                                                </td>
                                                <td className="px-2 py-1.5 border-r border-border font-semibold">
                                                    {order.customerParty?.companyName || order.customerName || 'N/A'}
                                                </td>
                                                <td className="px-2 py-1.5 border-r border-border text-center">
                                                    {getStatusBadge(order.status)}
                                                </td>
                                                <td className="px-2 py-1.5 border-r border-border text-right font-bold font-mono text-primary">
                                                    AED {order.netTotal?.toLocaleString('en-AE', { minimumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-2 py-1.5 border-r border-border text-right font-bold font-mono">
                                                    AED {order.netTotal?.toLocaleString('en-AE', { minimumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-2 py-1.5 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenPaymentSchedule(order)}
                                                            className="px-1.5 py-0.5 border border-border rounded text-[10px] hover:bg-hover transition-colors"
                                                            title="Payment Schedule"
                                                        >
                                                            Schedule
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/sales-dashboard/rental-sales-orders/edit/${order.id}`)}
                                                            className="w-5 h-5 rounded border border-border flex items-center justify-center text-foreground hover:bg-hover transition-colors"
                                                            title={t('qview.edit')}
                                                        >
                                                            <Edit size={11} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(order.id)}
                                                            className="w-5 h-5 rounded border border-border flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors"
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

            <PaymentScheduleModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                rentalSalesOrder={selectedOrder}
            />
        </div>
    );
};

export default RentalSalesOrder;
