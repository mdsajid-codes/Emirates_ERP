import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, RefreshCw } from 'lucide-react';
import { inventorySubLedgerApi } from '../../api/inventorySubLedgerApi';
import { toast } from 'react-toastify';

export default function StockValuationPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchValuation();
  }, []);

  const fetchValuation = async () => {
    setLoading(true);
    try {
      const res = await inventorySubLedgerApi.getStockValuation();
      setData(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load stock valuation report');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => item.netQty > 0 || item.netValue !== 0);
  const totalQty = filteredData.reduce((sum, item) => sum + item.netQty, 0);
  const totalValue = filteredData.reduce((sum, item) => sum + item.netValue, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground print:p-0 print:bg-white print:text-black"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
            <Link to="/account-dashboard" className="hover:text-primary">Accounting</Link>
            <span>&gt;</span>
            <Link to="/account-dashboard/sub-ledger/inventory" className="hover:text-primary">Inventory Ledger</Link>
            <span>&gt;</span>
            <span className="text-foreground-muted font-medium">Stock Valuation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Valuation Report</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchValuation}
            className="p-2 border border-border rounded-theme text-foreground-muted hover:text-foreground hover:bg-card"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-theme text-sm hover:opacity-95 shadow-sm inline-flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 border-b border-gray-300 pb-4">
        <h1 className="text-3xl font-bold text-center">Stock Valuation Report</h1>
        <p className="text-center text-sm text-gray-500">As of: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Value Summary Card */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-w-xl">
        <div className="bg-card border border-border rounded-theme p-4 print:border-gray-300">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Total Stock Quantity</p>
          <p className="text-2xl font-bold font-mono">{totalQty.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-theme p-4 print:border-gray-300">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Total Stock Valuation</p>
          <p className="text-2xl font-bold font-mono text-primary print:text-black">
            {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm print:border-none print:shadow-none">
        {loading ? (
          <div className="flex items-center justify-center h-64 print:hidden">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-background-muted z-10 print:static print:bg-transparent">
              <tr className="text-foreground-muted border-b border-border text-xs uppercase font-semibold print:text-black print:border-black">
                <th className="p-3">SKU</th>
                <th className="p-3">Item Description</th>
                <th className="p-3 text-right">Qty on Hand</th>
                <th className="p-3 text-right">Average Unit Cost</th>
                <th className="p-3 text-right">Total Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border print:divide-gray-300">
              {filteredData.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-foreground-muted">No stock on hand.</td></tr>
              ) : (
                filteredData.map((item) => {
                  const avgCost = item.netQty > 0 ? (item.netValue / item.netQty) : 0;
                  return (
                    <tr key={item.itemId} className="hover:bg-background-muted/20 transition-colors">
                      <td className="p-3 font-mono text-xs">{item.itemSku || 'N/A'}</td>
                      <td className="p-3 font-semibold">{item.itemName}</td>
                      <td className="p-3 text-right font-mono">{item.netQty.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono">
                        {avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {item.netValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredData.length > 0 && (
              <tfoot className="border-t border-border bg-background-muted font-bold sticky bottom-0 print:static">
                <tr className="print:border-t-2 print:border-black">
                  <td colSpan="2" className="p-3">Total</td>
                  <td className="p-3 text-right font-mono">{totalQty.toLocaleString()}</td>
                  <td className="p-3"></td>
                  <td className="p-3 text-right font-mono text-primary print:text-black">
                    {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </motion.div>
  );
}
