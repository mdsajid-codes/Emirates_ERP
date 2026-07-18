import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, RefreshCw } from 'lucide-react';
import { fixedAssetSubLedgerApi } from '../../api/fixedAssetSubLedgerApi';
import { toast } from 'react-toastify';

export default function FixedAssetSubLedgerDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ rows: [], closingBalance: 0 });

  useEffect(() => {
    fetchMovement();
  }, [id]);

  const fetchMovement = async () => {
    setLoading(true);
    try {
      const res = await fixedAssetSubLedgerApi.getAssetMovement(id);
      setData(res.data?.data || { rows: [], closingBalance: 0 });
    } catch (err) {
      toast.error('Failed to load asset movement statement');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const costTotal = data.rows
    .filter(row => row.documentType === 'ASSET_ACQUISITION')
    .reduce((sum, row) => sum + row.debitAmount - row.creditAmount, 0);

  const accumDepTotal = data.rows
    .filter(row => row.documentType === 'DEPRECIATION_RUN')
    .reduce((sum, row) => sum + row.creditAmount - row.debitAmount, 0);

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
            <Link to="/account-dashboard/sub-ledger/fixed-assets" className="hover:text-primary">Fixed Asset Register</Link>
            <span>&gt;</span>
            <span className="text-foreground-muted font-medium">Asset Ledger Statement</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/account-dashboard/sub-ledger/fixed-assets" className="p-2 hover:bg-card border border-border rounded-theme">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Asset Movement Ledger</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchMovement}
            className="p-2 border border-border rounded-theme text-foreground-muted hover:text-foreground hover:bg-card"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-border rounded-theme text-sm font-semibold hover:bg-card inline-flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Statement
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 border-b border-gray-300 pb-4">
        <h1 className="text-3xl font-bold text-center">Asset Movement Ledger</h1>
        <p className="text-center text-sm text-gray-500">Asset ID: {id}</p>
        <p className="text-center text-sm text-gray-500">Generated: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-theme p-4 print:border-gray-300">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Acquisition Cost</p>
          <p className="text-xl font-bold font-mono">{costTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border border-border rounded-theme p-4 print:border-gray-300">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Accum. Depreciation</p>
          <p className="text-xl font-bold font-mono text-error">{accumDepTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border border-border rounded-theme p-4 print:border-gray-300">
          <p className="text-xs font-semibold text-foreground-muted uppercase">Net Book Value (NBV)</p>
          <p className="text-xl font-bold font-mono text-primary print:text-black">
            {data.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                <th className="p-3">Date</th>
                <th className="p-3">Reference Number</th>
                <th className="p-3">Doc Type</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Debit (Addition)</th>
                <th className="p-3 text-right">Credit (Depreciation/Disposal)</th>
                <th className="p-3 text-right">Running Balance (NBV)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border print:divide-gray-300">
              {data.rows.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-foreground-muted">No movement records found.</td></tr>
              ) : (
                data.rows.map((row, index) => (
                  <tr key={index} className="hover:bg-background-muted/20 transition-colors">
                    <td className="p-3 font-mono text-xs">{row.entryDate}</td>
                    <td className="p-3 font-semibold text-xs">{row.entryNumber}</td>
                    <td className="p-3 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold bg-background-muted border border-border`}>
                        {row.documentType}
                      </span>
                    </td>
                    <td className="p-3 text-xs">{row.description}</td>
                    <td className="p-3 text-right font-mono text-success text-xs">
                      {row.debitAmount > 0 ? `+${row.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono text-error text-xs">
                      {row.creditAmount > 0 ? `-${row.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-xs">
                      {row.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
