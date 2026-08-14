import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { Search, FileSpreadsheet, Printer, Loader2, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const SalesOrderByItemReport = () => {
    const { isRTL, t } = useLanguage();
    const componentRef = useRef();

    const [filters, setFilters] = useState({
        fromDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        itemId: ''
    });

    const [items, setItems] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [tableSearch, setTableSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const fetchItems = async () => {
        try {
            const token = `Bearer ${localStorage.getItem('token')}`;
            const [productsRes, fgRes] = await Promise.all([
                axios.get(`${API_URL}/crm/sales-products`, { headers: { Authorization: token }, params: { size: 1000 } }),
                axios.get(`${API_URL}/production/finished-goods`, { headers: { Authorization: token }, params: { size: 1000 } })
            ]);

            const getList = (res) => Array.isArray(res.data) ? res.data : (res.data.content || []);

            const products = getList(productsRes).map(p => ({ 
                id: p.id, 
                name: `${p.name} (${p.itemCode})`, 
                type: 'Product' 
            }));
            
            const finishedGoods = getList(fgRes).map(f => ({ 
                id: f.id, 
                name: `${f.name} (FG: ${f.itemCode})`, 
                type: 'Finished Good' 
            }));

            setItems([...products, ...finishedGoods]);
        } catch (error) {
            console.error("Failed to fetch items", error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const token = `Bearer ${localStorage.getItem('token')}`;
            const params = {
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                ...(filters.itemId && { itemId: filters.itemId })
            };

            const response = await axios.get(`${API_URL}/sales/reports/sales-order-by-item`, {
                headers: { Authorization: token },
                params
            });

            setReportData(response.data || []);
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Sales Order By Item Report',
    });

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(reportData.map(item => ({
            "Customer Name": item.customerName,
            "Quantity": item.quantity,
            "Amount (AED)": item.amount,
            "Average Price (AED)": item.averagePrice
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, "SalesOrderByItemReport.xlsx");
    };

    const totals = reportData.reduce((acc, curr) => ({
        quantity: acc.quantity + (Number(curr.quantity) || 0),
        amount: acc.amount + (Number(curr.amount) || 0)
    }), { quantity: 0, amount: 0 });

    const filteredData = reportData.filter(item =>
        !tableSearch || (item.customerName && item.customerName.toLowerCase().includes(tableSearch.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredData.length / size) || 1;
    const paginatedData = filteredData.slice(page * size, (page + 1) * size);

    return (
        <div className="space-y-2 bg-background min-h-screen text-foreground font-sans w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Action Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <BarChart3 size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {isRTL ? 'تقرير أوامر المبيعات حسب الصنف' : 'Sales Order by Item'}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            {isRTL ? 'تحليل المبيعات حسب الصنف والعميل' : 'Detailed breakdown of sales order performance by items'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        onClick={handlePrint}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold border border-border bg-card hover:bg-hover text-foreground flex items-center gap-1 transition-colors"
                        title="Print"
                    >
                        <Printer size={12} /> {t('quotation.print')}
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold border border-border bg-card hover:bg-hover text-emerald-600 flex items-center gap-1 transition-colors"
                        title="Export to Excel"
                    >
                        <FileSpreadsheet size={12} /> {isRTL ? 'تصدير' : 'Export'}
                    </button>
                </div>
            </div>

            {/* Filter Section Card */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] items-end">
                    <div>
                        <label className="block text-[10px] font-semibold text-foreground mb-0.5">{t('quotation.fromDate')}</label>
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                            className="w-full h-7 text-[11px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-foreground mb-0.5">{t('quotation.toDate')}</label>
                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                            className="w-full h-7 text-[11px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-foreground mb-0.5">{t('qform.item')}</label>
                        <select
                            value={filters.itemId}
                            onChange={(e) => setFilters(prev => ({ ...prev, itemId: e.target.value }))}
                            className="w-full h-7 text-[11px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="">{isRTL ? 'جميع الأصناف' : 'Select Item (Optional)'}</option>
                            {items.map(item => (
                                <option key={`${item.type}-${item.id}`} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={fetchReport}
                            disabled={loading}
                            className="w-full h-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        >
                            {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                            {t('quotation.search')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2" ref={componentRef}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-border print:hidden">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder={t('quotation.searchInTable')}
                            value={tableSearch}
                            onChange={(e) => setTableSearch(e.target.value)}
                            className="w-full h-7 text-[11px] bg-background border border-border rounded px-2.5 pr-8 text-foreground focus:outline-none focus:border-primary"
                        />
                        <Search className={`absolute ${isRTL ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted`} />
                    </div>
                </div>

                <div className="rounded border border-border overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse">
                        <thead>
                            <tr className="bg-primary/10 text-foreground font-semibold border-b border-border">
                                <th className="px-3 py-1.5 text-start border-r border-border min-w-[180px]">{t('quotation.customerName')}</th>
                                <th className="px-3 py-1.5 text-end border-r border-border w-28">{t('qform.quantity')}</th>
                                <th className="px-3 py-1.5 text-end border-r border-border w-36">{t('qform.amount')} (AED)</th>
                                <th className="px-3 py-1.5 text-end w-36">{isRTL ? 'متوسط السعر' : 'Average Price'} (AED)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-6">
                                        <Loader2 className="animate-spin h-5 w-5 text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-foreground-muted">
                                        {t('quotation.noRecord')}
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {paginatedData.map((item, index) => (
                                        <tr key={index} className="hover:bg-hover">
                                            <td className="px-3 py-1.5 font-semibold text-foreground border-r border-border">{item.customerName}</td>
                                            <td className="px-3 py-1.5 text-end font-mono border-r border-border">{item.quantity}</td>
                                            <td className="px-3 py-1.5 text-end font-mono font-bold text-primary border-r border-border">{(item.amount || 0).toFixed(2)}</td>
                                            <td className="px-3 py-1.5 text-end font-mono text-foreground-muted">{(item.averagePrice || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {/* Summary Row */}
                                    <tr className="bg-primary/5 font-bold border-t-2 border-border">
                                        <td className="px-3 py-1.5 text-start uppercase text-[10px] tracking-wider text-foreground">{isRTL ? 'الإجمالي' : 'Total'}</td>
                                        <td className="px-3 py-1.5 text-end font-mono text-primary border-r border-border">{totals.quantity}</td>
                                        <td className="px-3 py-1.5 text-end font-mono text-primary font-bold border-r border-border">{(totals.amount || 0).toFixed(2)}</td>
                                        <td className="px-3 py-1.5"></td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-1 text-xs print:hidden">
                        <div className="text-[10px] text-foreground-muted">
                            {t('quotation.showing')} {filteredData.length === 0 ? 0 : page * size + 1} {t('quotation.to')} {Math.min((page + 1) * size, filteredData.length)} {t('quotation.of')} {filteredData.length} {t('quotation.entries')}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="w-7 h-7 rounded border border-border bg-card flex items-center justify-center text-foreground-muted hover:text-foreground disabled:opacity-40"
                            >
                                <ChevronLeft size={14} className={isRTL ? 'rotate-180' : ''} />
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`w-7 h-7 rounded font-semibold text-[11px] ${page === i ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-hover'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="w-7 h-7 rounded border border-border bg-card flex items-center justify-center text-foreground-muted hover:text-foreground disabled:opacity-40"
                            >
                                <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesOrderByItemReport;
