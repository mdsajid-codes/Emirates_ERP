import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, Printer, FileText, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SalesOrderByItemReport = () => {
    const navigate = useNavigate();
    const componentRef = useRef();

    const [filters, setFilters] = useState({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        itemId: ''
    });

    const [items, setItems] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [itemsLoading, setItemsLoading] = useState(true);

    const fetchItems = async () => {
        try {
            const token = `Bearer ${localStorage.getItem('token')}`;
            // Fetching products and finished goods as they are most likely to be sold
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

            // Combine and sort
            setItems([...products, ...finishedGoods]);
        } catch (error) {
            console.error("Failed to fetch items", error);
        } finally {
            setItemsLoading(false);
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

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Sales Order By Item Report',
    });

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(reportData.map(item => ({
            "Customer Name": item.customerName,
            "Quantity": item.quantity,
            "Amount": item.amount,
            "Average Price": item.averagePrice
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, "SalesOrderByItemReport.xlsx");
    };

    const calculateTotals = () => {
        return reportData.reduce((acc, curr) => ({
            quantity: acc.quantity + (curr.quantity || 0),
            amount: acc.amount + (curr.amount || 0)
        }), { quantity: 0, amount: 0 });
    };

    const totals = calculateTotals();

    // Get selected item name for header
    const selectedItemName = filters.itemId 
        ? items.find(i => i.id.toString() === filters.itemId.toString())?.name 
        : '';

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header / Filter Section */}
            <div className="bg-white p-4 shadow-sm border-b">
                <div className="flex flex-wrap gap-4 items-end">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input 
                            type="date" 
                            className="input"
                            value={filters.fromDate}
                            onChange={(e) => setFilters(prev => ({...prev, fromDate: e.target.value}))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input 
                            type="date" 
                            className="input"
                            value={filters.toDate}
                            onChange={(e) => setFilters(prev => ({...prev, toDate: e.target.value}))}
                        />
                    </div>
                    <div className="min-w-[250px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                        <select 
                            className="input w-full"
                            value={filters.itemId}
                            onChange={(e) => setFilters(prev => ({...prev, itemId: e.target.value}))}
                        >
                            <option value="">Select Item (Optional)</option>
                            {items.map(item => (
                                <option key={`${item.type}-${item.id}`} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button 
                        onClick={fetchReport}
                        disabled={loading}
                        className="btn-primary flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        Generate
                    </button>

                    <div className="flex-grow"></div>

                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded border" title="Print">
                            <Printer className="h-5 w-5" />
                        </button>
                        <button onClick={handleExport} className="p-2 text-gray-600 hover:bg-gray-100 rounded border" title="Export to Excel">
                            <FileText className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="flex-1 overflow-auto p-4">
                {/* Print Container */}
                <div ref={componentRef} className="bg-white p-6 shadow-sm min-h-[500px]">
                    
                    {/* Report Header (Visible in print) */}
                    <div className="mb-6 text-center">
                        <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                            {/* Breadcrumb-like style from image */}
                             <span className="font-semibold text-gray-700">Home</span> &gt; <span>Reports</span>
                        </div>
                        <div className="bg-[#a15c8e] text-white py-2 px-4 text-left font-semibold text-lg mb-4">
                            Sales Order by Item
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 uppercase">ABSOLUTE ERP</h2>
                        <h3 className="text-lg font-semibold text-gray-700 uppercase">
                            SALES ORDER BY ITEM {selectedItemName ? `- ${selectedItemName}` : ''}
                        </h3>
                        <p className="text-gray-600">
                            From {filters.fromDate.split('-').reverse().join('/')} To {filters.toDate.split('-').reverse().join('/')}
                        </p>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#e4d4e2] text-gray-800 border-b border-gray-300">
                                    <th className="py-2 px-3 text-left font-semibold">Customer Name</th>
                                    <th className="py-2 px-3 text-right font-semibold">Quantity</th>
                                    <th className="py-2 px-3 text-right font-semibold">Amount</th>
                                    <th className="py-2 px-3 text-right font-semibold">Average Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.length > 0 ? (
                                    <>
                                        {reportData.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-2 px-3 text-left">{item.customerName}</td>
                                                <td className="py-2 px-3 text-right font-medium text-red-600">{item.quantity}</td>
                                                <td className="py-2 px-3 text-right font-medium text-red-600">{item.amount?.toFixed(2)}</td>
                                                <td className="py-2 px-3 text-right font-medium text-red-600">{item.averagePrice?.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        {/* Total Row */}
                                        <tr className="border-t-2 border-gray-300 font-bold bg-gray-50">
                                            <td className="py-2 px-3 text-left">Total</td>
                                            <td className="py-2 px-3 text-right">{totals.quantity}</td>
                                            <td className="py-2 px-3 text-right">{totals.amount.toFixed(2)}</td>
                                            <td className="py-2 px-3 text-right"></td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">
                                            No data found for the selected criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesOrderByItemReport;
