import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { Search, FileSpreadsheet, Printer, Loader2 } from 'lucide-react';
import Pagination from '../../../components/Pagination';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SalesByItemReport = () => {
    // Filter States
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), 0, 1).toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState('');
    const [subCategoryId, setSubCategoryId] = useState('');
    const [itemId, setItemId] = useState('');

    // Dropdown Data States
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [itemSearch, setItemSearch] = useState('');

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

    // Fetch Items (Debounced Search)
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const params = {
                    search: itemSearch,
                    size: 50 // Limit to 50 suggestions
                };
                const response = await axios.get(`${API_URL}/crm/sales-products`, {
                    params,
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setItems(response.data.content || []);
            } catch (error) {
                console.error("Failed to fetch items", error);
            }
        };

        const timer = setTimeout(() => {
            fetchItems();
        }, 300);

        return () => clearTimeout(timer);
    }, [itemSearch]);

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
    }, [pagination.currentPage, pagination.pageSize]); // Refetch on pagination change

    // Handle Search Button Click
    const handleSearch = () => {
        setPagination(prev => ({ ...prev, currentPage: 0 })); // Reset to first page
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
            'Amount': item.amount,
            'Average Price': item.averagePrice
        }));

        // Add Totals Row
        exportData.push({
            'Item Name': 'Total',
            'Quantity': totals.totalQuantity,
            'UOM': '',
            'Amount': totals.totalAmount,
            'Average Price': ''
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'SalesByItem');
        XLSX.writeFile(wb, 'SalesByItemReport.xlsx');
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handlePageSizeChange = (size) => {
        setPagination(prev => ({ ...prev, pageSize: size, currentPage: 0 }));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Sales by Item</h1>
                    <div className="text-xs text-slate-500 mt-1">
                        <span className="text-slate-400">Home</span> &gt; <span className="text-slate-400">Reports</span> &gt; <span className="text-fuchsia-600 font-medium">Sales by Item</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handlePrint} className="p-2 bg-fuchsia-800 text-white rounded hover:bg-fuchsia-900 transition-colors" title="Print">
                        <Printer size={18} />
                    </button>
                    <button onClick={handleExport} className="p-2 bg-fuchsia-800 text-white rounded hover:bg-fuchsia-900 transition-colors" title="Export to Excel">
                        <FileSpreadsheet size={18} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 m-4 rounded-lg shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">From Date</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full text-sm border-slate-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">To Date</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full text-sm border-slate-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
                        />
                    </div>

                    <div className="col-span-1 lg:col-span-2 flex flex-col gap-2">
                         <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full text-sm border-slate-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
                                >
                                    <option value="">All</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Sub Category</label>
                                <select
                                    value={subCategoryId}
                                    onChange={(e) => setSubCategoryId(e.target.value)}
                                    disabled={!categoryId}
                                    className="w-full text-sm border-slate-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500 disabled:bg-slate-100"
                                >
                                    <option value="">All</option>
                                    {subCategories.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>
                         </div>
                    </div>
                    
                    <div className="col-span-1 lg:col-span-3">
                         <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Item Name</label>
                         <select 
                            value={itemId} 
                            onChange={(e) => setItemId(e.target.value)}
                            className="w-full text-sm border-slate-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
                         >
                             <option value="">--Select--</option>
                             {items.map(item => (
                                 <option key={item.id} value={item.id}>{item.name}</option>
                             ))}
                         </select>
                         {/* Optional: Add a real search input to filter the dropdown if the list is long, 
                             or rely on the combo box nature if it was a better component.
                             For now, let's keep it simple with a Search Input above if needed, 
                             but here we are fetching items based on `itemSearch` state? 
                             Wait, I implemented `itemSearch` in useEffect but didn't provide an input for it.
                             Let's fix that. */}
                    </div>

                    <div className="col-span-1 flex justify-end">
                        <button
                            onClick={handleSearch}
                            className="bg-fuchsia-800 hover:bg-fuchsia-900 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Search size={16} /> Search
                        </button>
                    </div>
                </div>
                
                 {/* Item Search Input to filter the dropdown above - a bit crude but works without custom combobox */}
                 <div className="mt-2 text-xs text-slate-500">
                    <input 
                        type="text" 
                        placeholder="Type to filter items list..." 
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1 text-xs w-64"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-4 overflow-hidden flex flex-col">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                    {/* Report Header for Print */}
                    <div ref={componentRef} className="flex flex-col h-full"> 
                        <div className="p-4 text-center border-b hidden print:block">
                            <h2 className="text-xl font-bold uppercase">Absolute ERP</h2>
                            <h3 className="text-lg font-semibold uppercase">Sales By Item</h3>
                            <p className="text-sm text-slate-600">From {new Date(fromDate).toLocaleDateString()} To {new Date(toDate).toLocaleDateString()}</p>
                        </div>

                        {/* Pagination Controls (Top) */}
                        <div className="p-2 border-b flex justify-between items-center print:hidden bg-slate-50">
                             <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                pageSize={pagination.pageSize}
                                totalElements={pagination.totalElements}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                            />
                            <div className="relative">
                                <input type="text" placeholder="Search..." className="pl-8 pr-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500" />
                                <Search className="absolute left-2.5 top-1.5 text-slate-400 h-4 w-4" />
                            </div>
                        </div>

                        <div className="overflow-auto flex-1">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold bg-fuchsia-100/50">Item Name</th>
                                        <th className="px-4 py-3 font-semibold bg-fuchsia-100/50 text-right">Quantity</th>
                                        <th className="px-4 py-3 font-semibold bg-fuchsia-100/50">UOM</th>
                                        <th className="px-4 py-3 font-semibold bg-fuchsia-100/50 text-right">Amount</th>
                                        <th className="px-4 py-3 font-semibold bg-fuchsia-100/50 text-right">Average Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Loader2 className="animate-spin h-5 w-5 text-fuchsia-600" /> Loading data...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : reportData.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-slate-500">No records found</td>
                                        </tr>
                                    ) : (
                                        <>
                                            {reportData.map((item, index) => (
                                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-slate-800">{item.itemName}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-fuchsia-700 font-medium">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-slate-600">{item.uom}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-fuchsia-700 font-medium">{item.amount?.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-slate-600">{item.averagePrice?.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            {/* Summary Row */}
                                            <tr className="bg-fuchsia-50 font-bold border-t-2 border-slate-300">
                                                <td className="px-4 py-3 text-right uppercase text-xs tracking-wider text-slate-600">Total</td>
                                                <td className="px-4 py-3 text-right font-mono text-fuchsia-800">{totals.totalQuantity}</td>
                                                <td className="px-4 py-3"></td>
                                                <td className="px-4 py-3 text-right font-mono text-fuchsia-800">{totals.totalAmount?.toFixed(2)}</td>
                                                <td className="px-4 py-3"></td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Footer Pagination Info for Print (Optional) or just bottom spacing */}
                        <div className="p-2 border-t text-xs text-slate-400 print:hidden">
                            Showing {reportData.length} records
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesByItemReport;
