import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { Search, FileSpreadsheet, Printer, Loader2, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const SalesBySalesPersonReport = () => {
    const { isRTL, t } = useLanguage();
    const componentRef = useRef();
    const [loading, setLoading] = useState(false);
    const [tableSearch, setTableSearch] = useState('');

    // Filters
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

    // Data & Pagination State
    const [reportData, setReportData] = useState({
        items: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        totalInvoiceCount: 0,
        totalSalesAmount: 0
    });
    const [pageSize, setPageSize] = useState(10);

    const fetchReport = async (page = 0, size = pageSize) => {
        setLoading(true);
        try {
            const token = `Bearer ${localStorage.getItem('token')}`;
            const params = {
                fromDate,
                toDate,
                page,
                size
            };

            const response = await axios.get(`${API_URL}/sales/reports/sales-by-salesperson`, {
                headers: { Authorization: token },
                params
            });

            setReportData(response.data || { items: [], totalCount: 0, totalPages: 0, currentPage: 0 });
        } catch (error) {
            console.error("Error fetching report", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(0, pageSize);
    }, []);

    const handlePageChange = (newPage) => {
        fetchReport(newPage, pageSize);
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Sales By Salesperson Report',
    });

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet((reportData.items || []).map((item) => ({
            "Sales Person": item.salesPersonName,
            "Invoice Count": item.invoiceCount,
            "Sales Amount (AED)": item.totalSales
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SalesBySalesperson");
        XLSX.writeFile(wb, "SalesBySalesPersonReport.xlsx");
    };

    const filteredItems = (reportData.items || []).filter(item =>
        !tableSearch || (item.salesPersonName && item.salesPersonName.toLowerCase().includes(tableSearch.toLowerCase()))
    );

    return (
        <div className="space-y-2 bg-background min-h-screen text-foreground font-sans w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-card p-2 rounded-lg border border-border shadow-2xs">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <BarChart3 size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-tight">
                            {isRTL ? 'تقرير المبيعات حسب مندوب المبيعات' : 'Sales by Salesperson'}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            {isRTL ? 'عرض وتحليل المبيعات وعدد الفواتير لكل مندوب مبيعات' : 'Analyze individual salesperson revenue and total invoice volume'}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px] items-end">
                    <div>
                        <label className="block text-[10px] font-semibold text-foreground mb-0.5">{t('quotation.fromDate')}</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full h-7 text-[11px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-foreground mb-0.5">{t('quotation.toDate')}</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full h-7 text-[11px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => fetchReport(0, pageSize)}
                            disabled={loading}
                            className="w-full h-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        >
                            {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                            {t('quotation.search')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Container Card */}
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
                                <th className="px-3 py-1.5 text-start border-r border-border min-w-[200px]">{t('qform.salesperson')}</th>
                                <th className="px-3 py-1.5 text-end border-r border-border w-36">{isRTL ? 'عدد الفواتير' : 'Invoice Count'}</th>
                                <th className="px-3 py-1.5 text-end w-40">{t('qform.amount')} (AED)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-6">
                                        <Loader2 className="animate-spin h-5 w-5 text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-4 text-foreground-muted">
                                        {t('quotation.noRecord')}
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {filteredItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-hover">
                                            <td className="px-3 py-1.5 font-semibold text-foreground border-r border-border">{item.salesPersonName || 'Unknown'}</td>
                                            <td className="px-3 py-1.5 text-end font-mono border-r border-border">{item.invoiceCount}</td>
                                            <td className="px-3 py-1.5 text-end font-mono font-bold text-primary">{(item.totalSales || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {/* Summary Row */}
                                    <tr className="bg-primary/5 font-bold border-t-2 border-border">
                                        <td className="px-3 py-1.5 text-start uppercase text-[10px] tracking-wider text-foreground">{isRTL ? 'الإجمالي' : 'Total'}</td>
                                        <td className="px-3 py-1.5 text-end font-mono text-primary border-r border-border">{reportData.totalInvoiceCount || 0}</td>
                                        <td className="px-3 py-1.5 text-end font-mono text-primary font-bold">{(reportData.totalSalesAmount || 0).toFixed(2)}</td>
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
                            {t('quotation.showing')} {filteredItems.length === 0 ? 0 : (reportData.currentPage || 0) * pageSize + 1} {t('quotation.to')} {Math.min(((reportData.currentPage || 0) + 1) * pageSize, reportData.totalCount || filteredItems.length)} {t('quotation.of')} {reportData.totalCount || filteredItems.length} {t('quotation.entries')}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => handlePageChange(Math.max(0, (reportData.currentPage || 0) - 1))}
                                disabled={(reportData.currentPage || 0) === 0}
                                className="w-7 h-7 rounded border border-border bg-card flex items-center justify-center text-foreground-muted hover:text-foreground disabled:opacity-40"
                            >
                                <ChevronLeft size={14} className={isRTL ? 'rotate-180' : ''} />
                            </button>

                            {[...Array(reportData.totalPages || 1)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePageChange(i)}
                                    className={`w-7 h-7 rounded font-semibold text-[11px] ${(reportData.currentPage || 0) === i ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-hover'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(Math.min((reportData.totalPages || 1) - 1, (reportData.currentPage || 0) + 1))}
                                disabled={(reportData.currentPage || 0) >= (reportData.totalPages || 1) - 1}
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

export default SalesBySalesPersonReport;
