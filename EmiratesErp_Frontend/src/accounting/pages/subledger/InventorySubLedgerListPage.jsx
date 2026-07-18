import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Eye, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { inventorySubLedgerApi } from '../../api/inventorySubLedgerApi';
import { toast } from 'react-toastify';

export default function InventorySubLedgerListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, IN_STOCK, OUT_OF_STOCK

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await inventorySubLedgerApi.getInventorySummary();
      setData(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load Inventory Sub-Ledger summary');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    const matchSearch = item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.itemSku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'IN_STOCK') {
      return matchSearch && item.netQty > 0;
    }
    if (filterType === 'OUT_OF_STOCK') {
      return matchSearch && item.netQty <= 0;
    }
    return matchSearch;
  });

  const totalValue = filteredData.reduce((sum, item) => sum + item.netValue, 0);
  const totalItemsCount = filteredData.length;
  const inStockCount = filteredData.filter(i => i.netQty > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
            <Link to="/account-dashboard" className="hover:text-primary">Accounting</Link>
            <span>&gt;</span>
            <span className="text-foreground-muted font-medium">Sub-Ledgers</span>
            <span>&gt;</span>
            <span className="text-foreground-muted font-medium">Inventory</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Sub-Ledger</h1>
        </div>
        <div>
          <Link
            to="/account-dashboard/sub-ledger/inventory/valuation"
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-theme text-sm hover:opacity-95 shadow-sm inline-flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Stock Valuation
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-theme p-4 flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground-muted uppercase">Total Inventory Value</p>
            <p className="text-2xl font-bold">{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-theme p-4 flex items-center gap-4">
          <div className="bg-success/10 text-success p-3 rounded-full">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground-muted uppercase">Active SKUs</p>
            <p className="text-2xl font-bold">{totalItemsCount}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-theme p-4 flex items-center gap-4">
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded-full">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground-muted uppercase">In Stock SKUs</p>
            <p className="text-2xl font-bold">{inStockCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-theme p-4 mb-6 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search SKU or Item name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex bg-background border border-border rounded-theme p-1">
          {['ALL', 'IN_STOCK', 'OUT_OF_STOCK'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all ${
                filterType === tab ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-background-muted z-10">
              <tr className="text-foreground-muted border-b border-border text-xs uppercase font-semibold">
                <th className="p-3">SKU</th>
                <th className="p-3">Item Name</th>
                <th className="p-3 text-right">Qty In</th>
                <th className="p-3 text-right">Qty Out</th>
                <th className="p-3 text-right">Net Qty</th>
                <th className="p-3 text-right">Total Debit</th>
                <th className="p-3 text-right">Total Credit</th>
                <th className="p-3 text-right">Net Value</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length === 0 ? (
                <tr><td colSpan="9" className="p-6 text-center text-foreground-muted">No items found.</td></tr>
              ) : (
                filteredData.map((item, index) => (
                  <motion.tr
                    key={item.itemId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.15 }}
                    onClick={() => navigate(`/account-dashboard/sub-ledger/inventory/${item.itemId}`)}
                    className="hover:bg-background-muted/40 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-mono text-xs">{item.itemSku || 'N/A'}</td>
                    <td className="p-3 font-semibold">{item.itemName}</td>
                    <td className="p-3 text-right font-mono">{item.totalQtyIn.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono">{item.totalQtyOut.toLocaleString()}</td>
                    <td className={`p-3 text-right font-mono font-bold ${item.netQty > 0 ? 'text-success' : 'text-foreground-muted'}`}>
                      {item.netQty.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono">{item.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono">{item.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono font-bold">
                      {item.netValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                      <Link
                        to={`/account-dashboard/sub-ledger/inventory/${item.itemId}`}
                        className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background-muted rounded inline-flex"
                        title="View Ledger Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
