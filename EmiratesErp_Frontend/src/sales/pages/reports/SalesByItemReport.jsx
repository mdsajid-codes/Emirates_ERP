import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { Search, FileSpreadsheet, Printer, Loader2, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const SalesByItemReport = () => {
    const { isRTL, t } = useLanguage();

    // Filter States
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), 0, 1).toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState('');
    const [subCategoryId, setSubCategoryId] = useState('');
    const [itemId, setItemId] = useState('');
    const [tableSearch, setTableSearch] = useState('');

    // Dropdown Data States
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [items, setItems] = useState([]);

    // Report Data States
    const [reportData, setReportData] = useState([]);
    const [totals, setTotals] = useState({ totalQuantity: 0, totalAmount: 0 });
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0
    });

    const componentRef = useRef();

    // Fetch Categories on Mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/production/categories`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setCategories(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch SubCategories when Category changes
    useEffect(() => {
        if (!categoryId) {
            setSubCategories([]);
            setSubCategoryId('');
            return;
        }
        const fetchSubCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/production/sub-categories?categoryId=${categoryId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setSubCategories(response.data);
            } catch (error) {
                console.error("Failed to fetch sub-categories", error);
            }
        };
        fetchSubCategories();
    }, [categoryId]);

    // Fetch Items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get(`${API_URL}/crm/sales-products`, {
                    params: { size: 500 },
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setItems(response.data.content || []);
            } catch (error) {
                console.error("Failed to fetch items", error);
            }
        };
        fetchItems();
    }, []);

    // Fetch Report Data
    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {
                fromDate,
                toDate,
                categoryId: categoryId || null,
                subCategoryId: subCategoryId || null,
                itemId: itemId || null,
                page: pagination.currentPage,
                size: pagination.pageSize
            };

            const response = await axios.get(`${API_URL}/sales/reports/sales-by-item`, {
                params,
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const data = response.data;
            setReportData(data.items || []);
            setTotals({
                totalQuantity: data.totalQuantity || 0,
                totalAmount: data.totalAmount || 0
            });
            setPagination(prev => ({
                ...prev,
                totalElements: data.totalCount || 0,
                totalPages: data.totalPages || 0
            }));
        } catch (error) {
            console.error("Failed to fetch report data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [pagination.currentPage, pagination.pageSize]);

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, currentPage: 0 }));
        fetchReport();
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Sales By Item Report',
    });

    const handleExport = () => {
        const exportData = reportData.map(item => ({
            'Item Name': item.itemName,
            'Quantity': item.quantity,
            'UOM': item.uom,
            'Amount (AED)': item.amount,
            'Average Price (AED)': item.averagePrice
        }));

        exportData.push({
            'Item Name': 'Total',
            'Quantity': totals.totalQuantity,
            'UOM': '',
            'Amount (AED)': totals.totalAmount,
            'Average Price (AED)': ''
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'SalesByItem');
        XLSX.writeFile(wb, 'SalesByItemReport.xlsx');
    };

    const filteredReportData = reportData.filter(item =>
        !tableSearch || (item.itemName && item.itemName.toLowerCase().includes(tableSearch.toLowerCase()))
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
                            {isRTL ? 'تقرير المبيعات حسب الصنف' : 'Sales by Item'}
                        </h1>
                        <p className="text-[10px] text-foreground-muted leading-none">
                            {isRTL ? 'عرض وتحليل تفاصيل المبيعات حسب الصنف' : 'Track and analyze detailed sales performance by individual items'}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-[11px] items-end">
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
                    <div>
                        <label className="block text-[10px] font-semibold text-foreground mb-0.5">{t('qform.category')}</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full h-7 text-[11px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="">All</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-foreground mb-0.5">{t('qform.subcategory')}</label>
                        <select
                            value={subCategoryId}
                            onChange={(e) => setSubCategoryId(e.target.value)}
                            disabled={!categoryId}
                            className="w-full h-7 text-[11px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
                        >
                            <option value="">All</option>
                            {subCategories.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-foreground mb-0.5">{t('qform.item')}</label>
                        <select
                            value={itemId}
                            onChange={(e) => setItemId(e.target.value)}
                            className="w-full h-7 text-[11px] bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="">--Select--</option>
                            {items.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleSearch}
                            className="w-full h-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        >
                            <Search size={12} /> {t('quotation.search')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Data Table Card */}
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
                                <th className="px-3 py-1.5 text-start border-r border-border min-w-[180px]">{t('qform.item')}</th>
                                <th className="px-3 py-1.5 text-end border-r border-border w-28">{t('qform.quantity')}</th>
                                <th className="px-3 py-1.5 text-start border-r border-border w-24">UOM</th>
                                <th className="px-3 py-1.5 text-end border-r border-border w-36">{t('qform.amount')} (AED)</th>
                                <th className="px-3 py-1.5 text-end w-36">{isRTL ? 'متوسط السعر' : 'Average Price'} (AED)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-6">
                                        <Loader2 className="animate-spin h-5 w-5 text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredReportData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-foreground-muted">
                                        {t('quotation.noRecord')}
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {filteredReportData.map((item, index) => (
                                        <tr key={index} className="hover:bg-hover">
                                            <td className="px-3 py-1.5 font-semibold text-foreground border-r border-border">{item.itemName}</td>
                                            <td className="px-3 py-1.5 text-end font-mono border-r border-border">{item.quantity}</td>
                                            <td className="px-3 py-1.5 text-foreground-muted border-r border-border">{item.uom || 'Unit'}</td>
                                            <td className="px-3 py-1.5 text-end font-mono font-bold text-primary border-r border-border">{(item.amount || 0).toFixed(2)}</td>
                                            <td className="px-3 py-1.5 text-end font-mono text-foreground-muted">{(item.averagePrice || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {/* Summary Row */}
                                    <tr className="bg-primary/5 font-bold border-t-2 border-border">
                                        <td className="px-3 py-1.5 text-start uppercase text-[10px] tracking-wider text-foreground">{isRTL ? 'الإجمالي' : 'Total'}</td>
                                        <td className="px-3 py-1.5 text-end font-mono text-primary border-r border-border">{totals.totalQuantity}</td>
                                        <td className="px-3 py-1.5 border-r border-border"></td>
                                        <td className="px-3 py-1.5 text-end font-mono text-primary font-bold border-r border-border">{(totals.totalAmount || 0).toFixed(2)}</td>
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
                            {t('quotation.showing')} {filteredReportData.length === 0 ? 0 : pagination.currentPage * pagination.pageSize + 1} {t('quotation.to')} {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements || filteredReportData.length)} {t('quotation.of')} {pagination.totalElements || filteredReportData.length} {t('quotation.entries')}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => handlePageChange(Math.max(0, pagination.currentPage - 1))}
                                disabled={pagination.currentPage === 0}
                                className="w-7 h-7 rounded border border-border bg-card flex items-center justify-center text-foreground-muted hover:text-foreground disabled:opacity-40"
                            >
                                <ChevronLeft size={14} className={isRTL ? 'rotate-180' : ''} />
                            </button>

                            {[...Array(pagination.totalPages || 1)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePageChange(i)}
                                    className={`w-7 h-7 rounded font-semibold text-[11px] ${pagination.currentPage === i ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-hover'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(Math.min((pagination.totalPages || 1) - 1, pagination.currentPage + 1))}
                                disabled={pagination.currentPage >= (pagination.totalPages || 1) - 1}
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

export default SalesByItemReport;
