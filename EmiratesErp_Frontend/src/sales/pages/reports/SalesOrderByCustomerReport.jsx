import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, Printer, FileText, Search } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SalesOrderByCustomerReport = () => {
    const componentRef = useRef();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);

    // Date Logic Helper
    const getDateRange = (type) => {
        const today = new Date();
        let from = new Date();
        let to = new Date();

        const formatDate = (date) => date.toISOString().split('T')[0];

        switch (type) {
            case 'Today':
                break; // from/to are already today
            case 'Yesterday':
                from.setDate(today.getDate() - 1);
                to.setDate(today.getDate() - 1);
                break;
            case 'This Week':
                // Assuming Week starts on Monday? Or Sunday? Let's generic it to start of week
                // current day - day of week (0-6)
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                from.setDate(diff);
                to.setDate(from.getDate() + 6);
                break;
            case 'This Month':
                from = new Date(today.getFullYear(), today.getMonth(), 1);
                to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'This Quarter':
                const currMonth = today.getMonth();
                const startMonth = Math.floor(currMonth / 3) * 3;
                from = new Date(today.getFullYear(), startMonth, 1);
                to = new Date(today.getFullYear(), startMonth + 3, 0);
                break;
            case 'This Year':
                from = new Date(today.getFullYear(), 0, 1);
                to = new Date(today.getFullYear(), 11, 31);
                break;
            case 'Previous Week':
                const prevWeekDay = today.getDay();
                const prevWeekDiff = today.getDate() - prevWeekDay + (prevWeekDay === 0 ? -6 : 1) - 7;
                from.setDate(prevWeekDiff);
                to.setDate(from.getDate() + 6);
                break;
            case 'Previous Month':
                from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                to = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'Previous Quarter':
                const pMonth = today.getMonth();
                const pStartMonth = Math.floor(pMonth / 3) * 3 - 3;
                from = new Date(today.getFullYear(), pStartMonth, 1);
                to = new Date(today.getFullYear(), pStartMonth + 3, 0);
                break;
            case 'Previous Year':
                from = new Date(today.getFullYear() - 1, 0, 1);
                to = new Date(today.getFullYear() - 1, 11, 31);
                break;
            default:
                return { from: '', to: '' };
        }
        return { from: formatDate(from), to: formatDate(to) };
    };

    const [dateRangeType, setDateRangeType] = useState('This Month');
    const [fromDate, setFromDate] = useState(getDateRange('This Month').from);
    const [toDate, setToDate] = useState(getDateRange('This Month').to);
    const [branchId, setBranchId] = useState(''); // Placeholder for Branch

    // Update dates when range type changes
    useEffect(() => {
        if (dateRangeType !== 'Custom') {
            const { from, to } = getDateRange(dateRangeType);
            setFromDate(from);
            setToDate(to);
        }
    }, [dateRangeType]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const token = `Bearer ${localStorage.getItem('token')}`;
            const response = await axios.get(`${API_URL}/sales/reports/sales-order-by-customer`, {
                headers: { Authorization: token },
                params: {
                    fromDate,
                    toDate,
                    branchId: branchId || undefined
                }
            });
            setReportData(response.data || []);
        } catch (error) {
            console.error("Error fetching report", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch on mount or date change? Mockup shows "Search" or similar but usually auto-fetch is nice.
    // Let's stick to explicit button or auto-fetch on changes? 
    // Given the date range selector behavior in some apps, implicit fetch on change is common.
    // But let's keep it safe with a Generate/Search button or fetch on mount + manual.
    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Initial load

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Sales Order By Customer Report',
    });

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(reportData.map(item => ({
            "Customer Name": item.customerName,
            "Sales Count": item.salesCount,
            "Sales": item.salesAmount
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, "SalesOrderByCustomer.xlsx");
    };

    const totals = reportData.reduce((acc, curr) => ({
        count: acc.count + (curr.salesCount || 0),
        amount: acc.amount + (curr.salesAmount || 0)
    }), { count: 0, amount: 0 });

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header / Filter */}
            <div className="bg-white p-4 shadow-sm border-b header-section">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <select
                            className="input w-full bg-yellow-300 font-medium"
                            value={dateRangeType}
                            onChange={(e) => setDateRangeType(e.target.value)}
                        >
                            {['Today', 'Yesterday', 'This Week', 'This Month', 'This Quarter', 'This Year',
                                'Previous Week', 'Previous Month', 'Previous Quarter', 'Previous Year', 'Custom'].map(o => (
                                    <option key={o} value={o}>{o}</option>
                                ))}
                        </select>
                    </div>

                    {dateRangeType === 'Custom' && (
                        <>
                            <div>
                                <label className="text-xs text-gray-500">From</label>
                                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input w-full" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">To</label>
                                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input w-full" />
                            </div>
                        </>
                    )}

                    {/* Branch Placeholder */}
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Branch</div>
                        <select className="input w-full" value={branchId} onChange={e => setBranchId(e.target.value)}>
                            <option value="">Head Office</option>
                            {/* Fetch branches if needed later */}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={fetchReport} disabled={loading} className="btn-primary flex items-center gap-2">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Generate
                        </button>
                        <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded border"><Printer className="h-5 w-5" /></button>
                        <button onClick={handleExport} className="p-2 text-gray-600 hover:bg-gray-100 rounded border"><FileText className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                <div ref={componentRef} className="bg-white p-6 shadow-sm min-h-[500px]">
                    <div className="mb-6 text-center">
                        <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                            <span className="font-semibold text-gray-700">Home</span> &gt; <span>Reports</span>
                        </div>
                        <div className="bg-[#a15c8e] text-white py-2 px-4 text-left font-semibold text-lg mb-4">
                            Sales Order by Customer
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 uppercase">ABSOLUTE ERP</h2>
                        <h3 className="text-lg font-semibold text-gray-700 uppercase">
                            SALES ORDER BY CUSTOMER
                        </h3>
                        <p className="text-gray-600">
                            From {fromDate.split('-').reverse().join('/')} To {toDate.split('-').reverse().join('/')}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#e4d4e2] text-gray-800 border-b border-gray-300">
                                    <th className="py-2 px-3 text-left font-semibold">Customer Name</th>
                                    <th className="py-2 px-3 text-right font-semibold">Sales Count</th>
                                    <th className="py-2 px-3 text-right font-semibold">Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.length > 0 ? (
                                    <>
                                        {reportData.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-2 px-3 text-left font-medium">{item.customerName}</td>
                                                <td className="py-2 px-3 text-right text-red-600">{item.salesCount}</td>
                                                <td className="py-2 px-3 text-right text-red-600 font-semibold">{item.salesAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                        <tr className="border-t-2 border-gray-300 font-bold bg-gray-50">
                                            <td className="py-2 px-3 text-left">Total</td>
                                            <td className="py-2 px-3 text-right">{totals.count}</td>
                                            <td className="py-2 px-3 text-right">{totals.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="py-8 text-center text-gray-500">No data found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 text-xs text-black font-semibold">
                        **Amount is displayed in your base currency AED
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesOrderByCustomerReport;
