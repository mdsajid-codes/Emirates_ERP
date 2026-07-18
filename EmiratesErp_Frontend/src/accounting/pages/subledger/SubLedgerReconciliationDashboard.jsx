import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, RefreshCw, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reconApi } from '../../api/reconApi';
import { motion } from 'framer-motion';

const SubLedgerReconciliationDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [untaggedLines, setUntaggedLines] = useState({});
  const [loadingLines, setLoadingLines] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await reconApi.getReconciliationSummary();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load reconciliation summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleToggleRow = async (key) => {
    if (expandedRow === key) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(key);
    
    if (!untaggedLines[key]) {
      try {
        setLoadingLines(true);
        const res = await reconApi.getUntaggedLines(key);
        if (res.data.success) {
          setUntaggedLines(prev => ({ ...prev, [key]: res.data.data }));
        }
      } catch (err) {
        console.error("Failed to load untagged lines", err);
      } finally {
        setLoadingLines(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount || 0);
  };

  const balancedCount = data.filter(d => d.balanced).length;
  const unbalancedCount = data.length - balancedCount;
  const totalDifference = data.reduce((sum, d) => sum + Math.abs(d.difference || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6 bg-background text-foreground flex-1"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sub-Ledger Reconciliation Dashboard</h1>
          <p className="text-foreground-muted text-sm mt-1">Monitor discrepancies between General Ledger control accounts and detailed sub-ledgers.</p>
        </div>
        <button 
          onClick={fetchSummary} 
          disabled={loading} 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-theme font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-theme p-6 flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-success/10 rounded-full text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Balanced Sub-Ledgers</p>
            <h3 className="text-2xl font-bold">{balancedCount}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-theme p-6 flex items-center space-x-4 shadow-sm">
          <div className={`p-3 rounded-full ${unbalancedCount > 0 ? 'bg-error/10 text-error' : 'bg-background-muted text-foreground-muted'}`}>
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Differences Found</p>
            <h3 className="text-2xl font-bold">{unbalancedCount}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-theme p-6 flex items-center space-x-4 shadow-sm">
          <div className={`p-3 rounded-full ${totalDifference > 0 ? 'bg-orange-500/10 text-orange-600' : 'bg-background-muted text-foreground-muted'}`}>
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Total Absolute Difference</p>
            <h3 className="text-2xl font-bold font-mono">{formatCurrency(totalDifference)}</h3>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold">Reconciliation Status</h2>
          <p className="text-sm text-foreground-muted">Compares the raw GL balance against the sum of all tagged dimension entries.</p>
        </div>
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="h-32 flex items-center justify-center text-foreground-muted">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-background-muted sticky top-0 z-10">
                <tr className="border-b border-border text-foreground-muted text-xs uppercase font-semibold">
                  <th className="p-4 whitespace-nowrap">Sub-Ledger</th>
                  <th className="p-4">Control Account(s)</th>
                  <th className="p-4 text-right whitespace-nowrap">GL Balance</th>
                  <th className="p-4 text-right whitespace-nowrap">Sub-Ledger Total</th>
                  <th className="p-4 text-right whitespace-nowrap">Difference</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((row) => (
                  <React.Fragment key={row.subLedgerKey}>
                    <tr className={`transition-colors ${!row.balanced ? 'bg-error/5 hover:bg-error/10' : 'hover:bg-background-muted/40'}`}>
                      <td className="p-4 font-semibold">{row.subLedgerName}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {row.controlAccountCodes && row.controlAccountCodes.length > 0 ? (
                            row.controlAccountCodes.map(code => (
                              <span key={code} className="px-2 py-0.5 text-xs font-mono font-medium bg-background border border-border rounded">
                                {code}
                              </span>
                            ))
                          ) : (
                            <span className="text-foreground-muted text-xs italic">Not Mapped</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono">{formatCurrency(row.glBalance)}</td>
                      <td className="p-4 text-right font-mono">{formatCurrency(row.subLedgerTotal)}</td>
                      <td className={`p-4 text-right font-mono font-bold ${!row.balanced ? 'text-error' : 'text-success'}`}>
                        {formatCurrency(row.difference)}
                      </td>
                      <td className="p-4 text-center">
                        {row.balanced ? (
                          <span className="inline-flex items-center gap-1 text-success bg-success/10 border border-success/20 px-2 py-1 rounded-full text-xs font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" /> Balanced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-error bg-error/10 border border-error/20 px-2 py-1 rounded-full text-xs font-medium">
                            <ShieldAlert className="w-3.5 h-3.5" /> Difference
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {row.drillDownUrl && (
                            <button 
                              onClick={() => navigate(row.drillDownUrl)} 
                              title="View Sub-Ledger"
                              className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background-muted rounded transition-colors"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleToggleRow(row.subLedgerKey)}
                            disabled={row.untaggedLineCount === 0 && row.balanced}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                              !row.balanced 
                                ? 'bg-error text-error-foreground hover:bg-error/90 border-error' 
                                : 'bg-background hover:bg-background-muted text-foreground border-border disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            {expandedRow === row.subLedgerKey ? 'Hide' : 'Show Untagged'}
                            {row.untaggedLineCount > 0 && (
                              <span className="ml-1 px-1.5 py-0.5 rounded-sm bg-background/20 text-xs font-bold border border-background/20">
                                {row.untaggedLineCount}
                              </span>
                            )}
                            {expandedRow === row.subLedgerKey ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Panel */}
                    {expandedRow === row.subLedgerKey && (
                      <tr>
                        <td colSpan={7} className="p-0 border-b border-border bg-background-muted/30">
                          <div className="m-4 ml-8 p-5 bg-card border-l-4 border-l-warning rounded-r-theme shadow-sm border border-border border-l-0">
                            <h4 className="text-sm font-bold flex items-center gap-2 mb-2 text-warning">
                              <AlertCircle className="h-4 w-4" />
                              Untagged Journal Lines ({untaggedLines[row.subLedgerKey]?.length || 0})
                            </h4>
                            <p className="text-xs text-foreground-muted mb-4">
                              These lines were posted to the control account without a specific dimension tag, causing the discrepancy.
                            </p>
                            
                            {loadingLines ? (
                              <div className="flex items-center gap-2 text-sm text-foreground-muted py-2">
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                Loading...
                              </div>
                            ) : untaggedLines[row.subLedgerKey]?.length > 0 ? (
                              <div className="overflow-hidden border border-border rounded-theme">
                                <table className="w-full text-xs">
                                  <thead className="bg-background-muted text-foreground-muted uppercase font-semibold">
                                    <tr>
                                      <th className="p-2.5 text-left border-b border-border">Date</th>
                                      <th className="p-2.5 text-left border-b border-border">Entry No</th>
                                      <th className="p-2.5 text-left border-b border-border">Type</th>
                                      <th className="p-2.5 text-left border-b border-border">Account</th>
                                      <th className="p-2.5 text-left border-b border-border">Description</th>
                                      <th className="p-2.5 text-right border-b border-border">Debit</th>
                                      <th className="p-2.5 text-right border-b border-border">Credit</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border bg-background">
                                    {untaggedLines[row.subLedgerKey].map(line => (
                                      <tr key={line.journalEntryId + line.accountCode} className="hover:bg-background-muted/40">
                                        <td className="p-2.5 whitespace-nowrap">{new Date(line.entryDate).toLocaleDateString()}</td>
                                        <td className="p-2.5 font-medium text-primary">{line.entryNumber}</td>
                                        <td className="p-2.5"><span className="px-1.5 py-0.5 bg-background-muted rounded border border-border">{line.documentType}</span></td>
                                        <td className="p-2.5 font-mono">{line.accountCode}</td>
                                        <td className="p-2.5">{line.description || line.referenceNumber || '-'}</td>
                                        <td className="p-2.5 text-right font-mono text-success">{formatCurrency(line.debitAmount)}</td>
                                        <td className="p-2.5 text-right font-mono text-error">{formatCurrency(line.creditAmount)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-sm text-foreground-muted py-6 text-center border rounded-theme border-dashed border-border bg-background">
                                No untagged lines found for these control accounts.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SubLedgerReconciliationDashboard;
