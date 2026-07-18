import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, Printer, FileText, Search } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import Pagination from '../../../components/Pagination';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ListOfDueBillsReport = () => {
    const componentRef = useRef();
    const [loading, setLoading] = useState(false);

    // Filters
    const [asOnDate, setAsOnDate] = useState(new Date().toISOString().split('T')[0]);
    const [customerId, setCustomerId] = useState('');
    const [branchId, setBranchId] = useState('');

    // Data & Pagination State
    const [reportData, setReportData] = useState({
        items: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        totalAmount: 0,
        totalPendingAmount: 0
    });
    const [pageSize, setPageSize] = useState(10);
    const [customers, setCustomers] = useState([]);

    // Fetch Customers for dropdown
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const token = `Bearer ${localStorage.getItem('token')}`;
                const response = await axios.get(`${API_URL}/parties`, {
                    headers: { Authorization: token },
                    params: { type: 'Customer' } // Assuming endpoint supports type filtering or returns all
                });
                // Adjust based on actual API response structure for parties
                const data = Array.isArray(response.data) ? response.data : (response.data.content || []);
                setCustomers(data);
            } catch (error) {
                console.error("Failed to fetch customers", error);
            }
        };
        fetchCustomers();
    }, []);

    const fetchReport = async (page = 0, size = pageSize) => {
        setLoading(true);
        try {
            const token = `Bearer ${localStorage.getItem('token')}`;
            const params = {
                asOnDate,
                ...(customerId && { customerId }),
                ...(branchId && { branchId }),
                page,
                size
            };

            const response = await axios.get(`${API_URL}/sales/reports/due-bills`, {
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

    // Initial load
    useEffect(() => {
        fetchReport();
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
        documentTitle: 'List of Due Bills Report',
    });

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(reportData.items.map((item, index) => ({
            "S.No": index + 1 + (reportData.currentPage * pageSize),
            "Ref No": item.refNo,
            "Customer Name": item.customerName,
            "Type": item.type,
            "Dated": item.dated,
            "Total Amt": item.totalAmt,
            "Pending Amt": item.pendingAmt,
            "Due Date": item.dueDate,
            "Days": item.days
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DueBills");
        XLSX.writeFile(wb, "ListOfDueBillsReport.xlsx");
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header / Filter */}
            <div className="bg-white p-4 shadow-sm border-b">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            className="input w-full"
                            value={asOnDate}
                            onChange={(e) => setAsOnDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <select
                            className="input w-full"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                        >
                            <option value="">Select Customer (Optional)</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name || c.partyName || c.companyName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                        <select
                            className="input w-full"
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                        >
                            <option value="">Head Office</option>
                        </select>
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
                            LIST OF DUE BILLS
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 uppercase">ABSOLUTE ERP</h2>
                        <h3 className="text-lg font-semibold text-gray-700 uppercase">
                            LIST OF DUE BILLS
                        </h3>
                        <p className="text-gray-600">
                            ( Bills status as on {asOnDate.split('-').reverse().join('/')} )
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#e4d4e2] text-gray-800 border-b border-gray-300">
                                    <th className="py-2 px-3 text-left font-semibold">S.no</th>
                                    <th className="py-2 px-3 text-left font-semibold">Ref. No.</th>
                                    <th className="py-2 px-3 text-left font-semibold">Customer Name</th>
                                    <th className="py-2 px-3 text-left font-semibold">Type</th>
                                    <th className="py-2 px-3 text-center font-semibold">Dated</th>
                                    <th className="py-2 px-3 text-right font-semibold">Total Amt.</th>
                                    <th className="py-2 px-3 text-right font-semibold">Pending Amt.</th>
                                    <th className="py-2 px-3 text-center font-semibold">Due Date</th>
                                    <th className="py-2 px-3 text-center font-semibold">Days</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.items && reportData.items.length > 0 ? (
                                    <>
                                        {reportData.items.map((item, index) => (
                                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-2 px-3 text-left">{index + 1 + (reportData.currentPage * pageSize)}</td>
                                                <td className="py-2 px-3 text-left font-medium text-fuchsia-700">{item.refNo}</td>
                                                <td className="py-2 px-3 text-left font-medium">{item.customerName}</td>
                                                <td className="py-2 px-3 text-left">{item.type}</td>
                                                <td className="py-2 px-3 text-center">{item.dated?.split('T')[0]}</td>
                                                <td className="py-2 px-3 text-right font-semibold text-fuchsia-800">{item.totalAmt?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="py-2 px-3 text-right font-semibold text-fuchsia-800">{item.pendingAmt?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="py-2 px-3 text-center">{item.dueDate?.split('T')[0]}</td>
                                                <td className="py-2 px-3 text-center">{item.days}</td>
                                            </tr>
                                        ))}
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="py-8 text-center text-gray-500">No data found.</td>
                                    </tr>
                                )}
                                <tr className="border-t-2 border-gray-300 font-bold bg-gray-50">
                                    <td colSpan="5" className="py-2 px-3 text-left">Total</td>
                                    <td className="py-2 px-3 text-right">{reportData.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-2 px-3 text-right">{reportData.totalPendingAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td colSpan="2"></td>
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
                        totalElements={reportData.totalElements}
                    />
                </div>
            </div>
        </div>
    );
};

export default ListOfDueBillsReport;
