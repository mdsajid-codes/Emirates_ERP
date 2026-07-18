import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { subLedgerApi } from '../../api/subLedgerApi';
import { toast } from 'react-toastify';

export default function ApAgingPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAging();
  }, [asOfDate]);

  const fetchAging = async () => {
    setLoading(true);
    try {
      const res = await subLedgerApi.getApAging({ asOfDate });
      setData(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load AP Aging report');
    } finally {
      setLoading(false);
    }
  };

  const totals = {
    totalOutstanding: data.reduce((sum, item) => sum + item.totalOutstanding, 0),
    current: data.reduce((sum, item) => sum + item.current, 0),
    days1to30: data.reduce((sum, item) => sum + item.days1to30, 0),
    days31to60: data.reduce((sum, item) => sum + item.days31to60, 0),
    days61to90: data.reduce((sum, item) => sum + item.days61to90, 0),
    daysOver90: data.reduce((sum, item) => sum + item.daysOver90, 0),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
            <Link to="/account-dashboard" className="hover:text-primary">Accounting</Link>
            <span>&gt;</span>
            <span className="text-foreground-muted font-medium">Sub-Ledgers</span>
            <span>&gt;</span>
            <span className="text-foreground-muted font-medium">AP Aging</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AP Aging Report</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-foreground-muted">As Of Date:</label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="bg-background border border-border rounded-theme px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-background-muted z-10">
              <tr className="text-foreground-muted border-b border-border text-xs uppercase font-semibold">
                <th className="p-3">Supplier Name</th>
                <th className="p-3 text-right">Total O/S</th>
                <th className="p-3 text-right">Current</th>
                <th className="p-3 text-right">1-30 Days</th>
                <th className="p-3 text-right">31-60 Days</th>
                <th className="p-3 text-right">61-90 Days</th>
                <th className="p-3 text-right">90+ Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-foreground-muted">No aging data found.</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.partyId} className="hover:bg-background-muted/40 transition-colors">
                    <td className="p-3 font-semibold">{item.partyName}</td>
                    <td className="p-3 text-right font-mono font-bold">{item.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono text-success">{item.current.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono text-warning">{item.days1to30.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono text-orange-500">{item.days31to60.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono text-error">{item.days61to90.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono text-error font-bold">{item.daysOver90.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
            {data.length > 0 && (
              <tfoot className="bg-background-muted sticky bottom-0 border-t border-border font-bold">
                <tr>
                  <td className="p-3 uppercase text-xs tracking-wider">Total</td>
                  <td className="p-3 text-right font-mono">{totals.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right font-mono text-success">{totals.current.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right font-mono text-warning">{totals.days1to30.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right font-mono text-orange-500">{totals.days31to60.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right font-mono text-error">{totals.days61to90.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right font-mono text-error font-bold">{totals.daysOver90.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </motion.div>
  );
}
