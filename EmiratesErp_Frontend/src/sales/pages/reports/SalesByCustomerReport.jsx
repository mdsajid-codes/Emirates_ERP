import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, Printer, FileText, Search } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import Pagination from "../../../components/Pagination";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SalesByCustomerReport = () => {
    const componentRef = useRef();
    const [loading, setLoading] = useState(false);

    // Filters
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]; // Start of current month
    });
    const [toDate, setToDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]; // End of current month
    });

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

            const response = await axios.get(`${API_URL}/sales/reports/sales-by-customer`, {
                headers: { Authorization: token },
                params
            });

            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(0, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePageChange = (newPage) => {
        fetchReport(newPage, pageSize);
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        fetchReport(0, newSize);
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Sales By Customer Report',
    });

    const handleExport = () => {
        const exportData = reportData.items.map((item) => ({
            "Customer Name": item.customerName,
            "Invoice Count": item.invoiceCount,
            "Sales": item.totalSales || 0
        }));

        // Add Total Row
        exportData.push({
            "Customer Name": "Total",
            "Invoice Count": reportData.totalInvoiceCount,
            "Sales": reportData.totalSalesAmount
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SalesByCustomer");
        XLSX.writeFile(wb, "SalesByCustomerReport.xlsx");
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header / Filter */}
            <div className="bg-white p-4 shadow-sm border-b">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
                    <div className="flex items-end gap-4 flex-wrap">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">From Date</label>
                            <input
                                type="date"
                                className="input h-9 text-sm w-40"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">To Date</label>
                            <input
                                type="date"
                                className="input h-9 text-sm w-40"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>
                        <button onClick={() => fetchReport(0, pageSize)} disabled={loading} className="btn-primary h-9 flex items-center gap-2 px-4">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Search
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="p-2 bg-fuchsia-800 text-white rounded hover:bg-fuchsia-900 transition-colors" title="Print"><Printer className="h-5 w-5" /></button>
                        <button onClick={handleExport} className="p-2 bg-fuchsia-800 text-white rounded hover:bg-fuchsia-900 transition-colors" title="Export Excel"><FileText className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                <div ref={componentRef} className="bg-white p-6 shadow-sm min-h-[500px]">
                    <div className="mb-6">
                        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1 print:hidden">
                            <span className="text-slate-400">Home</span> &gt; <span className="text-slate-400">Reports</span> &gt; <span className="text-fuchsia-600 font-medium">Sales by Customer</span>
                        </div>
                        <div className="bg-[#a15c8e] text-white py-2 px-4 text-left font-semibold text-lg mb-4 print:hidden">
                            Sales by Customer
                        </div>

                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-800 uppercase">ABSOLUTE ERP</h2>
                            <h3 className="text-lg font-semibold text-gray-700 uppercase">
                                SALES BY CUSTOMER
                            </h3>
                            <p className="text-gray-600 text-sm">
                                From {new Date(fromDate).toLocaleDateString()} To {new Date(toDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Pagination - Top (Screen only) */}
                    <div className="flex justify-between items-center mb-4 print:hidden">
                        <div className="flex items-center gap-2">
                            <select
                                value={pageSize}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                className="border rounded p-1 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-sm text-gray-600">records per page</span>
                        </div>
                        <div className="relative w-64">
                            <input type="text" placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 text-sm border rounded hover:border-gray-400 focus:outline-none focus:border-fuchsia-500 transition-colors" />
                            <Search className="absolute left-2.5 top-2 text-gray-400 h-4 w-4" />
                        </div>
                    </div>

                    <div className="overflow-x-auto border-t border-b border-gray-200">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#e4d4e2] text-gray-800 border-b border-gray-300 h-10">
                                    <th className="py-2 px-3 text-left font-bold w-1/2">Customer Name</th>
                                    <th className="py-2 px-3 text-right font-bold w-1/4">Invoice Count</th>
                                    <th className="py-2 px-3 text-right font-bold w-1/4">Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="py-10 text-center text-gray-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="animate-spin h-5 w-5 text-fuchsia-600" /> Loading data...
                                            </div>
                                        </td>
                                    </tr>
                                ) : reportData.items && reportData.items.length > 0 ? (
                                    <>
                                        {reportData.items.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 h-9">
                                                <td className="py-2 px-3 text-left font-medium text-gray-800">{item.customerName || 'Unknown'}</td>
                                                <td className="py-2 px-3 text-right font-mono text-gray-600">{item.invoiceCount}</td>
                                                <td className="py-2 px-3 text-right font-semibold font-mono text-fuchsia-800">
                                                    {item.totalSales?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="py-8 text-center text-gray-500 italic">No data found.</td>
                                    </tr>
                                )}
                                <tr className="border-t-2 border-gray-300 font-bold bg-gray-50 h-10">
                                    <td className="py-2 px-3 text-left">Total</td>
                                    <td className="py-2 px-3 text-right font-mono">{reportData.totalInvoiceCount || 0}</td>
                                    <td className="py-2 px-3 text-right font-mono text-gray-900">
                                        {reportData.totalSalesAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-2 text-xs font-semibold text-gray-800">
                        **Amount is displayed in your base currency AED
                    </div>

                    {/* Footer Pagination Info */}
                    <div className="mt-4 flex justify-between items-center print:hidden">
                        <div className="text-xs text-gray-600">
                            Showing {reportData.items?.length > 0 ? reportData.currentPage * pageSize + 1 : 0} to {Math.min((reportData.currentPage + 1) * pageSize, reportData.totalCount)} of {reportData.totalCount} entries
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => handlePageChange(Math.max(0, reportData.currentPage - 1))}
                                disabled={reportData.currentPage === 0}
                                className="px-3 py-1 border rounded text-xs hover:bg-gray-100 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button className="px-3 py-1 bg-[#4a103d] text-white rounded text-xs">{reportData.currentPage + 1}</button>
                            <button
                                onClick={() => handlePageChange(Math.min(reportData.totalPages - 1, reportData.currentPage + 1))}
                                disabled={reportData.currentPage >= reportData.totalPages - 1}
                                className="px-3 py-1 border rounded text-xs hover:bg-gray-100 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesByCustomerReport;
