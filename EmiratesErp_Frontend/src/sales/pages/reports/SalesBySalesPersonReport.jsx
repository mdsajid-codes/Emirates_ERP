import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, Printer, FileText, Search } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import Pagination from '../../../components/Pagination';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SalesBySalesPersonReport = () => {
    const componentRef = useRef();
    const [loading, setLoading] = useState(false);

    // Filters
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]); // Start of current year
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]); // Today

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
        documentTitle: 'Sales By Salesperson Report',
    });

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(reportData.items.map((item) => ({
            "Sales Person": item.salesPersonName,
            "Invoice Count": item.invoiceCount,
            "Sales Amount": item.totalSales
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SalesBySalesperson");
        XLSX.writeFile(wb, "SalesBySalesPersonReport.xlsx");
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header / Filter */}
            <div className="bg-white p-4 shadow-sm border-b">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            className="input w-full"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            className="input w-full"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => fetchReport(0, pageSize)} disabled={loading} className="btn-primary flex items-center gap-2">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Search
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
                            Sales by Salesperson
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 uppercase">ABSOLUTE ERP</h2>
                        <h3 className="text-lg font-semibold text-gray-700 uppercase">
                            SALES BY SALES PERSON
                        </h3>
                        <p className="text-gray-600">
                            From {fromDate.split('-').reverse().join('/')} To {toDate.split('-').reverse().join('/')}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#e4d4e2] text-gray-800 border-b border-gray-300">
                                    <th className="py-2 px-3 text-left font-semibold">Name</th>
                                    <th className="py-2 px-3 text-right font-semibold">Invoice Count</th>
                                    <th className="py-2 px-3 text-right font-semibold">Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.items && reportData.items.length > 0 ? (
                                    <>
                                        {reportData.items.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-2 px-3 text-left font-medium">{item.salesPersonName || 'Unknown'}</td>
                                                <td className="py-2 px-3 text-right">{item.invoiceCount}</td>
                                                <td className="py-2 px-3 text-right font-semibold text-fuchsia-800">
                                                    {item.totalSales?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="py-8 text-center text-gray-500">No data found.</td>
                                    </tr>
                                )}
                                <tr className="border-t-2 border-gray-300 font-bold bg-gray-50">
                                    <td className="py-2 px-3 text-left">Total</td>
                                    <td className="py-2 px-3 text-right">{reportData.totalInvoiceCount}</td>
                                    <td className="py-2 px-3 text-right">{reportData.totalSalesAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 text-xs text-black font-semibold">
                        **Amount is displayed in your base currency AED
                    </div>

                    <Pagination
                        currentPage={reportData.currentPage}
                        totalPages={reportData.totalPages}
                        onPageChange={handlePageChange}
                        pageSize={pageSize}
                        onPageSizeChange={handlePageSizeChange}
                        totalElements={reportData.totalCount}
                    />
                </div>
            </div>
        </div>
    );
};

export default SalesBySalesPersonReport;
