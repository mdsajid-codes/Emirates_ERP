import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Printer, FileText, Search, ArrowUpDown, ChevronDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const PendingPurchaseReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  
  // Filters
  const [dateRange, setDateRange] = useState('This Month');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [branchId, setBranchId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [poNumberTerm, setPoNumberTerm] = useState('');
  
  // Client-side Table State
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayRange, setDisplayRange] = useState({ from: '', to: '' });

  // Fetch Suppliers for dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/parties`, { 
                headers: { Authorization: `Bearer ${token}` },
                params: { type: 'SUPPLIER' }
            });
            setSuppliers(res.data.content || res.data || []);
        } catch (err) {
            console.error("Failed to fetch suppliers", err);
        }
    };
    fetchSuppliers();
  }, []);

  // Date Range Helper
  const getDatesFromRange = (range) => {
    const today = new Date();
    let from = new Date();
    let to = new Date();

    switch(range) {
      case 'Today': break; 
      case 'This Week': 
        const day = today.getDay(); 
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        from.setDate(diff);
        to.setDate(diff + 6);
        break;
      case 'This Month':
        from.setDate(1); 
        to.setMonth(today.getMonth() + 1, 0); 
        break; 
      case 'This Quarter':
        const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
        from.setMonth(quarterMonth, 1);
        to.setMonth(quarterMonth + 3, 0);
        break;
      case 'This Year':
        from.setMonth(0, 1);
        to.setMonth(11, 31);
        break;
      case 'Yesterday':
        from.setDate(today.getDate() - 1);
        to.setDate(today.getDate() - 1);
        break;
      case 'Previous Week':
        const prevDay = today.getDay();
        const prevDiff = today.getDate() - prevDay - 7 + (prevDay === 0 ? -6 : 1);
        from.setDate(prevDiff);
        to.setDate(prevDiff + 6);
        break;
      case 'Previous Month':
        from.setMonth(today.getMonth() - 1, 1);
        to.setDate(0); 
        break;
      case 'Previous Quarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        from.setMonth((currentQuarter - 1) * 3, 1);
        to.setMonth(currentQuarter * 3, 0);
        break;
      case 'Previous Year':
        from.setFullYear(today.getFullYear() - 1, 0, 1);
        to.setFullYear(today.getFullYear() - 1, 11, 31);
        break;
      case 'Custom':
        return { from: new Date(customFromDate), to: new Date(customToDate) };
      default: break;
    }
    return { from, to };
  };

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const { from, to } = getDatesFromRange(dateRange);
      const formatDate = (d) => d && !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';

      if (!from || !to || isNaN(from.getTime()) || isNaN(to.getTime())) {
          if (dateRange === 'Custom') return; 
      }
      
      const fDate = formatDate(from);
      const tDate = formatDate(to);
      
      if (!fDate || !tDate) return;

      setDisplayRange({ from: fDate.split('-').reverse().join('/'), to: tDate.split('-').reverse().join('/') });

      const token = localStorage.getItem('token');
      const params = {
          fromDate: fDate,
          toDate: tDate,
          branchId: branchId === 'all' ? undefined : branchId || undefined,
          supplierId: supplierId || undefined,
          poNumber: poNumberTerm || undefined
      };

      const res = await axios.get(`${API_URL}/purchases/reports/pending-purchase`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setData(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching pending purchase report:', err);
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const paginatedData = React.useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return data.slice(firstPageIndex, lastPageIndex);
  }, [data, currentPage, pageSize]);

  // Totals Calculation
  const totals = React.useMemo(() => {
    return data.reduce((acc, item) => ({
      orderQty: acc.orderQty + (item.orderQty || 0),
      cancelQty: acc.cancelQty + (item.cancelQty || 0),
      orderValue: acc.orderValue + (item.orderValue || 0),
      billedQty: acc.billedQty + (item.billedQty || 0),
      billedValue: acc.billedValue + (item.billedValue || 0),
      pendingQty: acc.pendingQty + (item.pendingQty || 0),
      pendingValue: acc.pendingValue + (item.pendingValue || 0)
    }), {
      orderQty: 0, cancelQty: 0, orderValue: 0, billedQty: 0, billedValue: 0, pendingQty: 0, pendingValue: 0
    });
  }, [data]);

  const formatCurrency = (val) => val ? val.toFixed(2) : '0';
  const formatDateDisplay = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : '';

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-sans text-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
             <span>Home</span> <span>&gt;</span> <span>Reports</span>
        </div>
        <div className="bg-[#a65d8c] text-white px-4 py-3 rounded-t-md shadow-sm flex justify-between items-center">
            <h1 className="text-xl font-semibold">Pending Purchase Report</h1>
            <div className="flex gap-2">
                <button className="px-3 py-1 bg-[#5b2c4c] text-white rounded text-sm hover:bg-opacity-90">ExportToExcel</button>
            </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-b-md shadow-sm border border-slate-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search By (Mock for visual implementation mostly) */}
            <div>
                <label className="text-xs font-semibold text-slate-600">Search By</label>
                <select className="w-full border border-slate-300 rounded px-2 py-1.5 bg-slate-50 text-sm">
                    <option>Purchase Order</option>
                </select>
            </div>

            {/* Date Range - From */}
            {dateRange === 'Custom' ? (
                <div>
                   <label className="text-xs font-semibold text-slate-600">From</label>
                   <input type="date" value={customFromDate} onChange={e => setCustomFromDate(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" />
                </div>
            ) : (
                <div>
                    <label className="text-xs font-semibold text-slate-600">From</label>
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 bg-slate-50 text-sm">
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>This Quarter</option>
                        <option>This Year</option>
                        <option>Custom</option>
                    </select>
                </div>
            )}

             {/* Date Range - To (Only visible/active but we display range usually) */}
             {dateRange === 'Custom' ? (
                <div>
                    <label className="text-xs font-semibold text-slate-600">To</label>
                    <input type="date" value={customToDate} onChange={e => setCustomToDate(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" />
                </div>
             ) : (
                // Placeholder to match UI layout if needed, or just let the dropdown handle it. 
                // The UI shows explicit From/To inputs even for ranges sometimes. For simplicity, reusing logic.
                <div>
                     <label className="text-xs font-semibold text-slate-600">To</label>
                     <div className="w-full border border-slate-300 rounded px-2 py-1.5 bg-slate-100 text-sm text-gray-500">
                         {displayRange.to || 'Select Range'}
                     </div>
                </div>
             )}

             {/* Purchase Order Input */}
             <div>
                 <label className="text-xs font-semibold text-slate-600">Purchase Order</label>
                 <input 
                    type="text" 
                    value={poNumberTerm} 
                    onChange={e => setPoNumberTerm(e.target.value)} 
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                    placeholder="Enter PO Number"
                 />
             </div>

             {/* Supplier */}
             <div>
                <label className="text-xs font-semibold text-slate-600">Supplier Name</label>
                <select 
                    value={supplierId} 
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 bg-slate-50 text-sm"
                >
                    <option value="">--select--</option>
                    {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.companyName}</option>
                    ))}
                </select>
             </div>

             {/* Branch */}
             <div>
                <label className="text-xs font-semibold text-slate-600">Branch</label>
                <select 
                     className="w-full border border-slate-300 rounded px-2 py-1.5 bg-slate-50 text-sm"
                     value={branchId}
                     onChange={(e) => setBranchId(e.target.value)}
                >
                     <option value="">Head Office</option>
                     <option value="all">--All Location--</option>
                 </select>
             </div>

             {/* Search Button */}
             <div>
                 <button 
                    onClick={fetchReport}
                    className="bg-[#5b2c4c] text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-opacity-90 w-full"
                 >
                    Search
                 </button>
             </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
              <select 
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-slate-300 rounded px-2 py-1 bg-white text-sm focus:outline-none shadow-sm"
              >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
              </select>
              <span className="text-sm text-slate-600">records per page</span>
          </div>
          <div className="w-64">
             <input type="text" placeholder="Search..." className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none" />
          </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto rounded-t-md">
          {loading ? (
              <div className="flex justify-center items-center h-40"><Loader className="animate-spin text-[#a65d8c] h-8 w-8" /></div>
          ) : error ? (
              <div className="p-8 text-center text-red-600">{error}</div>
          ) : (
              <table className="min-w-full text-xs border-collapse">
                  <thead>
                      <tr className="bg-[#ead1dc] text-slate-800 font-bold text-center">
                          <th rowSpan="2" className="px-2 py-2 border border-white">SR NO</th>
                          <th rowSpan="2" className="px-2 py-2 border border-white">Action</th>
                          <th rowSpan="2" className="px-2 py-2 border border-white w-24">Purchase Order No.</th>
                          <th rowSpan="2" className="px-2 py-2 border border-white w-24">Purchase Order Date</th>
                          <th rowSpan="2" className="px-2 py-2 border border-white">Supplier Name</th>
                          <th rowSpan="2" className="px-2 py-2 border border-white w-24">Delivery Date</th>
                          <th rowSpan="2" className="px-2 py-2 border border-white">Left days</th>
                          <th rowSpan="2" className="px-2 py-2 border border-white text-left w-48">PRODUCT DESCRIPTION</th>
                          
                          <th colSpan="4" className="px-2 py-1 border border-white bg-[#ead1dc]">ORDER VALUE</th>
                          <th colSpan="3" className="px-2 py-1 border border-white bg-[#ead1dc]">BILLED AS ON DATE</th>
                          <th colSpan="3" className="px-2 py-1 border border-white bg-[#ead1dc]">PENDING ORDER</th>
                      </tr>
                      <tr className="bg-[#ead1dc] text-slate-800 font-bold text-center text-[10px]">
                          <th className="px-2 py-1 border border-white">QTY</th>
                          <th className="px-2 py-1 border border-white">CANCEL QTY</th>
                          <th className="px-2 py-1 border border-white">RATE</th>
                          <th className="px-2 py-1 border border-white">VALUE</th>
                          
                          <th className="px-2 py-1 border border-white">QTY</th>
                          <th className="px-2 py-1 border border-white">RATE</th>
                          <th className="px-2 py-1 border border-white">VALUE</th>
                          
                          <th className="px-2 py-1 border border-white">QTY</th>
                          <th className="px-2 py-1 border border-white">RATE</th>
                          <th className="px-2 py-1 border border-white">VALUE</th>
                      </tr>
                  </thead>
                  <tbody>
                      {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                          <tr key={`${item.poId}-${index}`} className="hover:bg-slate-50 text-slate-700 text-center border-b border-slate-100">
                              <td className="px-2 py-2 font-bold">{index + 1 + (currentPage - 1) * pageSize}</td>
                              <td className="px-2 py-2">
                                  <button className="bg-[#5b2c4c] text-white px-2 py-0.5 rounded text-[10px]">Close</button>
                              </td>
                              <td className="px-2 py-2 text-[#a65d8c] font-medium">{item.poNumber}</td>
                              <td className="px-2 py-2">{formatDateDisplay(item.poDate)}</td>
                              <td className="px-2 py-2 text-left font-medium">{item.supplierName}</td>
                              <td className="px-2 py-2">{formatDateDisplay(item.deliveryDate)}</td>
                              <td className="px-2 py-2">{item.leftDays}</td>
                              <td className="px-2 py-2 text-left">{item.productDescription}</td>
                              
                              {/* Order Value */}
                              <td className="px-2 py-2">{item.orderQty}</td>
                              <td className="px-2 py-2">{item.cancelQty}</td>
                              <td className="px-2 py-2">{item.orderRate}</td>
                              <td className="px-2 py-2">{item.orderValue}</td>
                              
                              {/* Billed */}
                              <td className="px-2 py-2">{item.billedQty}</td>
                              <td className="px-2 py-2">{item.billedRate}</td>
                              <td className="px-2 py-2">{item.billedValue}</td>
                              
                              {/* Pending */}
                              <td className="px-2 py-2 font-bold">{item.pendingQty}</td>
                              <td className="px-2 py-2">{item.pendingRate}</td>
                              <td className="px-2 py-2 font-bold">{item.pendingValue}</td>
                          </tr>
                      )) : (
                          <tr><td colSpan="18" className="text-center py-10 text-slate-500">No records found</td></tr>
                      )}
                      
                      {/* Totals Row */}
                      {paginatedData.length > 0 && (
                          <tr className="bg-slate-50 font-bold border-t border-slate-300 text-slate-900 text-center text-[11px]">
                             <td colSpan={8} className="px-2 py-2 text-right">Total</td>
                             <td className="px-2 py-2">{totals.orderQty}</td>
                             <td className="px-2 py-2">{totals.cancelQty}</td>
                             <td className="px-2 py-2"></td>
                             <td className="px-2 py-2">{totals.orderValue.toFixed(2)}</td>
                             
                             <td className="px-2 py-2">{totals.billedQty}</td>
                             <td className="px-2 py-2"></td>
                             <td className="px-2 py-2">{totals.billedValue.toFixed(2)}</td>
                             
                             <td className="px-2 py-2">{totals.pendingQty}</td>
                             <td className="px-2 py-2"></td>
                             <td className="px-2 py-2">{totals.pendingValue.toFixed(2)}</td>
                          </tr>
                      )}
                  </tbody>
              </table>
          )}
      </div>

      {/* Pagination Footer */}
      {!loading && !error && paginatedData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-slate-600">
              <div>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
              </div>
              <div className="flex gap-1 mt-2 sm:mt-0">
                  <button 
                      onClick={() => setCurrentPage(curr => Math.max(curr - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded hover:bg-slate-100 disabled:opacity-50"
                  >
                      Previous
                  </button>
                  <div className="px-3 py-1 bg-[#5b2c4c] text-white rounded">{currentPage}</div>
                  <button 
                      onClick={() => setCurrentPage(curr => curr < Math.ceil(data.length / pageSize) ? curr + 1 : curr)}
                      disabled={currentPage >= Math.ceil(data.length / pageSize)}
                      className="px-3 py-1 border rounded hover:bg-slate-100 disabled:opacity-50"
                  >
                      Next
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default PendingPurchaseReport;
