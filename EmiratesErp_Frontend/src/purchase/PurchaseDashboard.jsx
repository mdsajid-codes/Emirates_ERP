import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    Calendar,
    RefreshCw,
    Download,
    DollarSign,
    ShoppingCart,
    Users,
    Receipt,
    Clock,
    ArrowUpRight,
    ArrowRight,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { loadThemeFromStorage, applyTheme } from '../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const PurchaseDashboard = () => {
    const { isRTL, t } = useLanguage();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timeframe, setTimeframe] = useState('This Month');

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get(`${API_URL}/purchases/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data) {
                    setData(response.data);
                }
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const theme = loadThemeFromStorage();
        if (theme) applyTheme(theme);
        fetchDashboardData();
    }, []);

    // Extract real or fallback data
    const stats = data?.stats || {
        outstandingPayment: 125750,
        outstandingTrend: 12.5,
        totalOrders: 18,
        totalOrdersTrend: 5.6,
        activeSuppliers: 32,
        activeSuppliersTrend: 3.2,
        totalBills: 14,
        totalBillsTrend: 8.1,
        pendingApprovals: 8
    };

    const categories = [
        { name: isRTL ? 'المواد الخام' : 'Raw Materials', amount: '42,700 AED', percent: '34.3%', color: 'var(--color-primary, #1680A0)' },
        { name: isRTL ? 'التعبئة والتغليف' : 'Packaging', amount: '29,000 AED', percent: '23.3%', color: '#57C1D2' },
        { name: isRTL ? 'قطع غيار ميكانيكية' : 'Mechanical Items', amount: '20,120 AED', percent: '16.3%', color: '#B0E1E7' },
        { name: isRTL ? 'مستلزمات كهربائية' : 'Electrical Items', amount: '15,300 AED', percent: '12.4%', color: '#3BADBE' },
        { name: isRTL ? 'مستلزمات مكتبية' : 'Office Supplies', amount: '10,450 AED', percent: '8.5%', color: '#009B9A' },
        { name: isRTL ? 'أخرى' : 'Others', amount: '7,580 AED', percent: '6.1%', color: '#40B4B3' }
    ];

    const recentOrders = data?.recentActivity || [
        { id: 1, number: 'PO-2026-0018', supplier: 'Star Enterprises Dubai', date: '12 May 2026', amount: '25,000 AED', status: 'APPROVED' },
        { id: 2, number: 'PO-2026-0017', supplier: 'Emirates Packaging LLC', date: '10 May 2026', amount: '18,500 AED', status: 'PENDING' },
        { id: 3, number: 'PO-2026-0016', supplier: 'Al Quoz Industrial Supply', date: '08 May 2026', amount: '12,400 AED', status: 'APPROVED' },
        { id: 4, number: 'PO-2026-0015', supplier: 'Jebel Ali Tools & Logistics', date: '05 May 2026', amount: '34,200 AED', status: 'APPROVED' }
    ];

    return (
        <div className="space-y-3.5 select-none font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-[26px] font-bold text-[var(--color-foreground,#071B62)] leading-tight tracking-tight">
                        {isRTL ? 'لوحة تحكم المشتريات' : 'Purchase Dashboard'}
                    </h1>
                    <p className="text-xs text-[#62708E] font-normal mt-0.5">
                        {isRTL ? 'نظرة عامة على المشتريات وتحليل النفقات في الوقت الفعلي.' : 'Real-time procurement overview and spending analysis.'}
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Timeframe selector */}
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,9px)] text-xs font-semibold text-[var(--color-foreground,#071B62)] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">
                        <Calendar size={13} className="text-[var(--color-primary,#0956E8)]" />
                        <span>{timeframe}</span>
                        <ChevronDown size={13} className="text-[var(--color-foreground,#071B62)]" />
                    </button>

                    {/* Refresh button */}
                    <button
                        onClick={fetchDashboardData}
                        className="w-[36px] h-[36px] bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,9px)] flex items-center justify-center text-[var(--color-primary,#0956E8)] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                        title="Refresh"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin text-[var(--color-primary,#0956E8)]" /> : <RefreshCw size={16} />}
                    </button>

                    {/* Download Report Button */}
                    <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--color-primary,#0956E8)] text-white rounded-[var(--theme-border-radius,9px)] text-xs font-semibold hover:opacity-90 transition-all shadow-[0px_3px_6px_-1px_rgba(0,0,0,0.1)] active:scale-95 cursor-pointer">
                        <Download size={13} className="text-white" />
                        <span>{isRTL ? 'تحميل التقرير' : 'Download Report'}</span>
                    </button>
                </div>
            </div>

            {/* Top 5 Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Outstanding Payment */}
                <div className="bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,12px)] p-3.5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-3 relative overflow-hidden">
                    <div className="w-[44px] h-[44px] rounded-[10px] bg-[var(--color-primary,#0956E8)]/10 flex items-center justify-center text-[var(--color-primary,#0956E8)] shrink-0">
                        <svg width="20" height="20" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.34131 15.0039H6.81264C7.73112 15.0039 8.59599 15.4364 9.14707 16.1712L9.80363 17.0466C10.9058 18.5161 12.6356 19.381 14.4725 19.381C16.3095 19.381 18.0392 18.5161 19.1414 17.0466L19.7979 16.1712C20.349 15.4364 21.2139 15.0039 22.1324 15.0039H27.6037M1.34131 9.16785H27.6037" stroke="var(--color-primary, #0956E8)" strokeWidth="2.68222" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4.25935 1.34106H24.6857C26.2962 1.34106 27.6037 2.6486 27.6037 4.25911V24.6854C27.6037 26.2959 26.2962 27.6035 24.6857 27.6035H4.25935C2.64884 27.6035 1.34131 26.2959 1.34131 24.6854V4.25911C1.34131 2.6486 2.64884 1.34106 4.25935 1.34106Z" stroke="var(--color-primary, #0956E8)" strokeWidth="2.68222" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <span className="text-[11.5px] font-semibold text-[var(--color-foreground,#071B62)] block truncate">
                            {isRTL ? 'المبالغ المستحقة' : 'Outstanding Payment'}
                        </span>
                        <span className="text-[18px] font-bold text-[var(--color-foreground,#071B62)] block leading-tight">
                            {stats.outstandingPayment?.toLocaleString()} AED
                        </span>
                        <span className="text-[10px] font-bold text-[#008452] flex items-center gap-0.5 truncate">
                            <ArrowUpRight size={11} /> {stats.outstandingTrend || 12.5}% vs last month
                        </span>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,12px)] p-3.5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-3 relative overflow-hidden">
                    <div className="w-[44px] h-[44px] rounded-[10px] bg-[var(--color-primary,#0956E8)]/10 flex items-center justify-center text-[var(--color-primary,#0956E8)] shrink-0">
                        <ShoppingCart size={20} strokeWidth={2.3} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <span className="text-[11.5px] font-semibold text-[var(--color-foreground,#071B62)] block truncate">
                            {isRTL ? 'إجمالي الطلبات' : 'Total Orders'}
                        </span>
                        <span className="text-[18px] font-bold text-[var(--color-foreground,#071B62)] block leading-tight">
                            {stats.totalOrders || 18}
                        </span>
                        <span className="text-[10px] font-bold text-[#008452] flex items-center gap-0.5 truncate">
                            <ArrowUpRight size={11} /> {stats.totalOrdersTrend || 5.6}% vs last month
                        </span>
                    </div>
                </div>

                {/* Active Suppliers */}
                <div className="bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,12px)] p-3.5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-3 relative overflow-hidden">
                    <div className="w-[44px] h-[44px] rounded-[10px] bg-[#F2F6FC] flex items-center justify-center text-[#008452] shrink-0">
                        <Users size={20} strokeWidth={2.3} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <span className="text-[11.5px] font-semibold text-[var(--color-foreground,#071B62)] block truncate">
                            {isRTL ? 'الموردون النشطون' : 'Active Suppliers'}
                        </span>
                        <span className="text-[18px] font-bold text-[var(--color-foreground,#071B62)] block leading-tight">
                            {stats.activeSuppliers || 32}
                        </span>
                        <span className="text-[10px] font-bold text-[#008452] flex items-center gap-0.5 truncate">
                            <ArrowUpRight size={11} /> {stats.activeSuppliersTrend || 3.2}% vs last month
                        </span>
                    </div>
                </div>

                {/* Total Bills */}
                <div className="bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,12px)] p-3.5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-3 relative overflow-hidden">
                    <div className="w-[44px] h-[44px] rounded-[10px] bg-[#F2F6FC] flex items-center justify-center text-[var(--color-primary,#0956E8)] shrink-0">
                        <svg width="18" height="22" viewBox="0 0 25 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.0853 28.781C2.57085 28.781 1.34131 27.5515 1.34131 26.037V4.08506C1.34131 2.57061 2.57085 1.34107 4.0853 1.34107H15.0613C15.9385 1.33965 16.78 1.6883 17.3992 2.3097L22.3219 7.23243C22.945 7.85181 23.2947 8.6945 23.2933 9.57305V26.037C23.2933 27.5515 22.0637 28.781 20.5493 28.781H4.0853Z" stroke="var(--color-primary, #0956E8)" strokeWidth="2.68222" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14.3096 2.41296V9.27295C14.3096 10.0302 14.9244 10.6449 15.6816 10.6449H22.5416M8.82163 12.0169H6.07764M17.0536 17.5049H6.07764M17.0536 22.9929H6.07764" stroke="var(--color-primary, #0956E8)" strokeWidth="2.68222" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <span className="text-[11.5px] font-semibold text-[var(--color-foreground,#071B62)] block truncate">
                            {isRTL ? 'إجمالي الفواتير' : 'Total Bills'}
                        </span>
                        <span className="text-[18px] font-bold text-[var(--color-foreground,#071B62)] block leading-tight">
                            {stats.totalBills || 14}
                        </span>
                        <span className="text-[10px] font-bold text-[#008452] flex items-center gap-0.5 truncate">
                            <ArrowUpRight size={11} /> {stats.totalBillsTrend || 8.1}% vs last month
                        </span>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,12px)] p-3.5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-3 relative overflow-hidden">
                    <div className="w-[44px] h-[44px] rounded-[10px] bg-[#F2F6FC] flex items-center justify-center text-[#D93137] shrink-0">
                        <Clock size={20} strokeWidth={2.3} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <span className="text-[11.5px] font-semibold text-[var(--color-foreground,#071B62)] block truncate">
                            {isRTL ? 'في انتظار الموافقة' : 'Pending Approvals'}
                        </span>
                        <span className="text-[18px] font-bold text-[var(--color-foreground,#071B62)] block leading-tight">
                            {stats.pendingApprovals || 8}
                        </span>
                        <Link to="/purchase-dashboard/purchase-orders" className="text-[10px] font-semibold text-[var(--color-primary,#0956E8)] hover:underline flex items-center gap-0.5 truncate">
                            {isRTL ? 'عرض التفاصيل ←' : 'View Details →'}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Middle Section: 3 Cards in One Row (4 cols each) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
                {/* Purchase by Category (4 Cols) */}
                <div className="lg:col-span-4 bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,12px)] p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-[var(--color-foreground,#071B62)]">
                            {isRTL ? 'المشتريات حسب الفئة' : 'Purchase by Category'}
                        </h2>
                        <span className="text-[10.5px] px-2 py-0.5 border border-[#E4EAF4] rounded-[8px] text-[var(--color-foreground,#071B62)] font-medium bg-slate-50">
                            {timeframe}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        {/* Donut Visual Representation */}
                        <div className="flex items-center justify-center relative my-1">
                            <div className="w-[105px] h-[105px] rounded-full border-[10px] border-[var(--color-primary,#1680A0)] border-t-[#57C1D2] border-r-[#B0E1E7] border-b-[#3BADBE] flex items-center justify-center shadow-inner">
                                <div className="text-center">
                                    <span className="text-xs font-bold text-[var(--color-primary,#0956E8)] block">34.3%</span>
                                    <span className="text-[8.5px] text-[#62708E] font-medium">{isRTL ? 'الأعلى' : 'Top Share'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Category List */}
                        <div className="space-y-1 text-[10.5px]">
                            {categories.map((cat, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-1 border-b border-slate-100 pb-0.5 last:border-none">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                        <span className="font-semibold text-[var(--color-foreground,#071B62)] truncate">{cat.name}</span>
                                    </div>
                                    <span className="font-bold text-[var(--color-foreground,#071B62)] shrink-0">{cat.percent}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Spend Footer */}
                    <div className="pt-2 border-t border-[#E4EAF4] flex items-center justify-between">
                        <span className="text-[11px] text-[#62708E] font-normal">{isRTL ? 'إجمالي الإنفاق' : 'Total Spend'}</span>
                        <span className="text-base font-bold text-[var(--color-foreground,#071B62)]">124,450 AED</span>
                    </div>
                </div>

                {/* Recent Purchase Orders (4 Cols) */}
                <div className="lg:col-span-4 bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,12px)] p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-[var(--color-foreground,#071B62)]">
                            {isRTL ? 'أوامر الشراء الأخيرة' : 'Recent Purchase Orders'}
                        </h2>
                        <Link to="/purchase-dashboard/purchase-orders" className="text-[11px] font-semibold text-[var(--color-primary,#0956E8)] hover:underline">
                            {isRTL ? 'عرض الكل' : 'View All'}
                        </Link>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px]">
                            <thead>
                                <tr className="border-b border-[#E4EAF4] text-[#62708E] font-semibold text-left">
                                    <th className="py-1.5 px-1">{isRTL ? 'رقم الأمر' : 'PO Number'}</th>
                                    <th className="py-1.5 px-1">{isRTL ? 'المورد' : 'Supplier'}</th>
                                    <th className="py-1.5 px-1">{isRTL ? 'التاريخ' : 'Date'}</th>
                                    <th className="py-1.5 px-1">{isRTL ? 'المبلغ' : 'Amount'}</th>
                                    <th className="py-1.5 px-1 text-center">{isRTL ? 'الحالة' : 'Status'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders.map((po) => (
                                    <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-2 px-1 font-medium text-[var(--color-foreground,#071B62)] truncate max-w-[80px]">{po.number}</td>
                                        <td className="py-2 px-1 text-[var(--color-foreground,#071B62)] font-semibold truncate max-w-[85px]">{po.supplier}</td>
                                        <td className="py-2 px-1 text-[#62708E] whitespace-nowrap">{po.date}</td>
                                        <td className="py-2 px-1 font-bold text-[var(--color-foreground,#071B62)] whitespace-nowrap">{po.amount}</td>
                                        <td className="py-2 px-1 text-center">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-semibold uppercase tracking-wider ${
                                                po.status === 'APPROVED' ? 'bg-[#E6F7EE] text-[#308E6D]' : 'bg-[#FFF4E5] text-[#B76E00]'
                                            }`}>
                                                {po.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Outstanding Purchase Orders Card (4 Cols) */}
                <div className="lg:col-span-4 bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,12px)] p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-[var(--color-foreground,#071B62)]">
                            {isRTL ? 'أوامر الشراء المعلقة' : 'Outstanding Purchase Orders'}
                        </h2>
                        <Link to="/purchase-dashboard/purchase-orders" className="text-[11px] font-semibold text-[var(--color-primary,#0956E8)] hover:underline">
                            {isRTL ? 'عرض الكل' : 'View All'}
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px]">
                            <thead>
                                <tr className="border-b border-[#E4EAF4] text-[#62708E] font-semibold text-left">
                                    <th className="py-1.5 px-1">{isRTL ? 'رقم الأمر' : 'PO Number'}</th>
                                    <th className="py-1.5 px-1">{isRTL ? 'المورد' : 'Supplier'}</th>
                                    <th className="py-1.5 px-1">{isRTL ? 'التاريخ' : 'Date'}</th>
                                    <th className="py-1.5 px-1">{isRTL ? 'المبلغ' : 'Amount'}</th>
                                    <th className="py-1.5 px-1">{isRTL ? 'المتوقع' : 'Expected'}</th>
                                    <th className="py-1.5 px-1 text-center">{isRTL ? 'متأخر' : 'Overdue'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { po: 'PO-2026-0016', supplier: isRTL ? 'شركة تيك سوليوشنز' : 'Tech Solutions LLC', date: '09 May', amount: '12,600', exp: '16 May', overdue: isRTL ? '3 أيام' : '3 Days' },
                                    { po: 'PO-2026-0011', supplier: isRTL ? 'التجار الموثوقون' : 'Reliable Traders', date: '05 May', amount: '15,300', exp: '15 May', overdue: isRTL ? 'يومان' : '2 Days' },
                                    { po: 'PO-2026-0010', supplier: isRTL ? 'شركة الخليج الصناعية' : 'Gulf Industrial Co.', date: '04 May', amount: '8,750', exp: '18 May', overdue: isRTL ? '5 أيام' : '5 Days' },
                                    { po: 'PO-2026-0009', supplier: isRTL ? 'الإمارات للتغليف' : 'Emirates Packaging', date: '03 May', amount: '21,000', exp: '20 May', overdue: isRTL ? '7 أيام' : '7 Days' }
                                ].map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="py-2 px-1 font-medium text-[var(--color-foreground,#071B62)] truncate max-w-[80px]">{item.po}</td>
                                        <td className="py-2 px-1 text-[var(--color-foreground,#071B62)] truncate max-w-[85px]">{item.supplier}</td>
                                        <td className="py-2 px-1 text-[#62708E] whitespace-nowrap">{item.date}</td>
                                        <td className="py-2 px-1 font-bold text-[var(--color-foreground,#071B62)] whitespace-nowrap">{item.amount}</td>
                                        <td className="py-2 px-1 text-[#62708E] whitespace-nowrap">{item.exp}</td>
                                        <td className="py-2 px-1 text-center">
                                            <span className="bg-[#FFEAEA] text-[#D93137] px-1.5 py-0.5 rounded font-semibold text-[8.5px] whitespace-nowrap">
                                                {item.overdue}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Bottom Row: GRN, Invoices Donut, and Top Suppliers Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
                {/* GRN (Goods Received) */}
                <div className="lg:col-span-4 bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,12px)] p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-[var(--color-foreground,#071B62)]">
                            {isRTL ? 'استلام البضائع (GRN)' : 'GRN (Goods Received)'}
                        </h2>
                        <Link to="/purchase-dashboard/purchase-orders" className="text-[11px] font-semibold text-[var(--color-primary,#0956E8)] hover:underline">
                            {isRTL ? 'عرض الكل' : 'View All'}
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div className="flex flex-col items-center justify-center relative my-1">
                            <div className="w-[100px] h-[100px] rounded-full border-[10px] border-[#009B9A] border-b-transparent flex flex-col items-center justify-center">
                                <span className="text-xl font-bold text-[var(--color-foreground,#071B62)]">27</span>
                                <span className="text-[8.5px] text-[#62708E] font-medium">{isRTL ? 'هذا الشهر' : 'This Month'}</span>
                            </div>
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between">
                                <span className="text-[#62708E]">{isRTL ? 'عدد المستندات' : 'GRN Value'}</span>
                                <span className="font-bold text-[var(--color-foreground,#071B62)]">27</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#62708E]">{isRTL ? 'قيمة المستندات' : 'GRN Amount'}</span>
                                <span className="font-bold text-[var(--color-foreground,#071B62)]">98,450 AED</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#62708E]">{isRTL ? 'مكتمل' : 'Completed'}</span>
                                <span className="font-bold text-[#008452]">6</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#62708E]">{isRTL ? 'مرتجع' : 'Returned'}</span>
                                <span className="font-bold text-[#D93137]">2</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoices */}
                <div className="lg:col-span-4 bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,12px)] p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-[var(--color-foreground,#071B62)]">
                            {isRTL ? 'الفواتير' : 'Invoices'}
                        </h2>
                        <Link to="/purchase-dashboard/bills" className="text-[11px] font-semibold text-[var(--color-primary,#0956E8)] hover:underline">
                            {isRTL ? 'عرض الكل' : 'View All'}
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div className="flex flex-col items-center justify-center relative my-1">
                            <div className="w-[100px] h-[100px] rounded-full border-[10px] border-[var(--color-primary,#0956E8)] border-b-transparent flex flex-col items-center justify-center">
                                <span className="text-xl font-bold text-[var(--color-foreground,#071B62)]">22</span>
                                <span className="text-[8.5px] text-[#62708E] font-medium">{isRTL ? 'هذا الشهر' : 'This Month'}</span>
                            </div>
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between">
                                <span className="text-[#62708E]">{isRTL ? 'إجمالي الفواتير' : 'Total Invoices'}</span>
                                <span className="font-bold text-[var(--color-foreground,#071B62)]">22</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#62708E]">{isRTL ? 'قيمة الفواتير' : 'Invoice Value'}</span>
                                <span className="font-bold text-[var(--color-foreground,#071B62)]">88,300 AED</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#62708E]">{isRTL ? 'مدفوع' : 'Paid Invoices'}</span>
                                <span className="font-bold text-[#008452]">14</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#62708E]">{isRTL ? 'قيد الانتظار' : 'Pending Invoices'}</span>
                                <span className="font-bold text-[#B76E00]">8</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Suppliers by Spend */}
                <div className="lg:col-span-4 bg-white border border-[#E4EAF4] rounded-[var(--theme-border-radius,12px)] p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-[var(--color-foreground,#071B62)]">
                            {isRTL ? 'أعلى الموردين حسب الإنفاق' : 'Top Suppliers by Spend'}
                        </h2>
                        <span className="text-[10px] px-2 py-0.5 border border-[#E4EAF4] rounded-[6px] text-[var(--color-foreground,#071B62)] bg-slate-50 font-medium">
                            {timeframe}
                        </span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                        {[
                            { name: 'Star Enterprises', amount: '25,000 AED', width: '90%' },
                            { name: 'Emirates Packaging', amount: '18,750 AED', width: '70%' },
                            { name: 'Gulf Industrial Co.', amount: '18,900 AED', width: '68%' },
                            { name: 'Tech Solutions LLC', amount: '12,600 AED', width: '50%' },
                            { name: 'Al Bashir Supplies', amount: '9,850 AED', width: '38%' }
                        ].map((sup, idx) => (
                            <div key={idx} className="space-y-0.5">
                                <div className="flex justify-between items-center font-medium text-[var(--color-foreground,#071B62)]">
                                    <span className="truncate max-w-[140px]">{sup.name}</span>
                                    <span className="font-bold text-[10px]">{sup.amount}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--color-primary,#0956E8)] rounded-full transition-all duration-500" style={{ width: sup.width }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseDashboard;
