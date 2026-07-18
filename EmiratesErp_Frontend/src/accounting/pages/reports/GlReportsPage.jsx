import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Download, RefreshCw, FileSpreadsheet, FileText } from 'lucide-react';
import { reportsApi } from '../../api/reportsApi';
import { toast } from 'react-toastify';

export default function GlReportsPage() {
  const [activeTab, setActiveTab] = useState('tb'); // tb: Trial Balance, pl: Profit & Loss, bs: Balance Sheet
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  
  // Dates
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]); // Jan 1st of current year
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  // Data
  const [tbData, setTbData] = useState([]);
  const [plData, setPlData] = useState(null);
  const [bsData, setBsData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [activeTab, fromDate, toDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tb') {
        const res = await reportsApi.getTrialBalance({ fromDate, toDate });
        setTbData(res.data?.data || []);
      } else if (activeTab === 'pl') {
        const res = await reportsApi.getIncomeStatement({ fromDate, toDate });
        setPlData(res.data?.data || null);
      } else if (activeTab === 'bs') {
        const res = await reportsApi.getBalanceSheet({ toDate });
        setBsData(res.data?.data || null);
      }
    } catch (err) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    setDownloading(true);
    try {
      let response;
      let filename = '';
      if (activeTab === 'tb') {
        filename = `trial_balance_${fromDate}_to_${toDate}.${format}`;
        response = format === 'pdf' 
          ? await reportsApi.downloadTrialBalancePdf({ fromDate, toDate })
          : await reportsApi.downloadTrialBalanceExcel({ fromDate, toDate });
      } else if (activeTab === 'pl') {
        filename = `profit_and_loss_${fromDate}_to_${toDate}.${format}`;
        response = format === 'pdf'
          ? await reportsApi.downloadIncomeStatementPdf({ fromDate, toDate })
          : await reportsApi.downloadIncomeStatementExcel({ fromDate, toDate });
      } else if (activeTab === 'bs') {
        filename = `balance_sheet_as_of_${toDate}.${format}`;
        response = format === 'pdf'
          ? await reportsApi.downloadBalanceSheetPdf({ toDate })
          : await reportsApi.downloadBalanceSheetExcel({ toDate });
      }

      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: response.headers?.['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success(`${format.toUpperCase()} report downloaded successfully`);
    } catch (err) {
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  // TB Totals
  const tbTotals = tbData.reduce(
    (acc, row) => ({
      openingDebit: acc.openingDebit + (row.openingDebit || 0),
      openingCredit: acc.openingCredit + (row.openingCredit || 0),
      debitTurnover: acc.debitTurnover + (row.debitTurnover || 0),
      creditTurnover: acc.creditTurnover + (row.creditTurnover || 0),
      closingDebit: acc.closingDebit + (row.closingDebit || 0),
      closingCredit: acc.closingCredit + (row.closingCredit || 0),
    }),
    { openingDebit: 0, openingCredit: 0, debitTurnover: 0, creditTurnover: 0, closingDebit: 0, closingCredit: 0 }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground"
    >
      {/* Header and navigation breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
            <Link to="/account-dashboard" className="hover:text-primary">Accounting</Link>
            <span>&gt;</span>
            <span className="text-foreground-muted font-medium">Reports</span>
            <span>&gt;</span>
            <span className="text-foreground-muted font-medium">GL Reports</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Reports</h1>
        </div>

        {/* Date Filter & Export buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {activeTab !== 'bs' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-foreground-muted uppercase">From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-background border border-border rounded-theme px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-foreground-muted uppercase">
              {activeTab === 'bs' ? 'As Of Date:' : 'To:'}
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-background border border-border rounded-theme px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => handleDownload('excel')}
              disabled={downloading || loading}
              className="flex items-center gap-2 bg-success text-success-foreground hover:opacity-90 px-3.5 py-1.5 rounded-theme text-sm font-semibold shadow transition-all disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading || loading}
              className="flex items-center gap-2 bg-error text-error-foreground hover:opacity-90 px-3.5 py-1.5 rounded-theme text-sm font-semibold shadow transition-all disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('tb')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'tb'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          Trial Balance
        </button>
        <button
          onClick={() => setActiveTab('pl')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'pl'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          Profit & Loss
        </button>
        <button
          onClick={() => setActiveTab('bs')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'bs'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          Balance Sheet
        </button>
      </div>

      {/* Main Report View */}
      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'tb' ? (
          // Trial Balance Table
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-background-muted text-foreground-muted border-b border-border text-xs uppercase font-bold">
                  <th className="p-3">Code</th>
                  <th className="p-3">Account Description</th>
                  <th className="p-3 text-right">Opening DR</th>
                  <th className="p-3 text-right">Opening CR</th>
                  <th className="p-3 text-right">Debit Turnover</th>
                  <th className="p-3 text-right">Credit Turnover</th>
                  <th className="p-3 text-right">Closing DR</th>
                  <th className="p-3 text-right">Closing CR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tbData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-foreground-muted">No data found for this period.</td>
                  </tr>
                ) : (
                  (function renderTbRows(rows) {
                    return rows.map((row) => (
                      <React.Fragment key={row.accountId || Math.random()}>
                        <tr className={`hover:bg-background-muted/40 transition-colors ${row.isGroup ? 'font-bold bg-background-muted/20' : ''}`}>
                          <td className={`p-3 font-mono ${!row.isGroup ? 'text-primary font-semibold' : ''}`} style={{ paddingLeft: `calc(0.75rem + ${(row.level || 1) * 16 - 16}px)` }}>{row.accountCode}</td>
                          <td className="p-3 font-medium" style={{ paddingLeft: `calc(0.75rem + ${(row.level || 1) * 16 - 16}px)` }}>{row.description}</td>
                          <td className="p-3 text-right font-mono">{row.openingDebit > 0 ? row.openingDebit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                          <td className="p-3 text-right font-mono">{row.openingCredit > 0 ? row.openingCredit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                          <td className="p-3 text-right font-mono text-success">{row.debitTurnover > 0 ? row.debitTurnover.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                          <td className="p-3 text-right font-mono text-error">{row.creditTurnover > 0 ? row.creditTurnover.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                          <td className="p-3 text-right font-mono font-semibold">{row.closingDebit > 0 ? row.closingDebit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                          <td className="p-3 text-right font-mono font-semibold">{row.closingCredit > 0 ? row.closingCredit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                        </tr>
                        {row.children && row.children.length > 0 && renderTbRows(row.children)}
                      </React.Fragment>
                    ));
                  })(tbData)
                )}
              </tbody>
              {tbData.length > 0 && (
                <tfoot className="bg-background-muted border-t border-border font-bold">
                  <tr>
                    <td colSpan="2" className="p-3 uppercase text-xs tracking-wider">Totals</td>
                    <td className="p-3 text-right font-mono">{tbTotals.openingDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono">{tbTotals.openingCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono">{tbTotals.debitTurnover.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono">{tbTotals.creditTurnover.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono">{tbTotals.closingDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono">{tbTotals.closingCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : activeTab === 'pl' ? (
          // Profit and Loss Page
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-lg font-bold text-foreground border-b border-border pb-2 uppercase tracking-wide">Statement of Profit or Loss (IFRS)</h2>
            {plData?.sections?.map((section) => (
              <div key={section.sectionName} className="space-y-2">
                <h3 className="text-xs uppercase font-bold text-foreground-muted bg-background-muted px-3 py-1.5 rounded">{section.sectionName}</h3>
                <div className="divide-y divide-border px-3">
                  {section.accounts?.map((acc) => (
                    <div key={acc.accountCode} className="flex justify-between py-2 text-sm">
                      <span className="text-foreground-muted font-medium">{acc.accountCode} — {acc.description}</span>
                      <span className="font-mono font-semibold">{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2.5 font-bold border-t border-border mt-1 text-sm bg-background-muted/30 px-2 rounded">
                    <span>Total {section.sectionName}</span>
                    <span className="font-mono">{section.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t-2 border-double border-border pt-4 mt-6 space-y-3">
              <div className="flex justify-between text-base font-bold bg-primary/10 p-3 rounded-theme">
                <span>Gross Profit</span>
                <span className="font-mono text-primary">{(plData?.grossProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg font-bold bg-success/10 p-3 rounded-theme">
                <span>Net Profit / (Loss)</span>
                <span className="font-mono text-success">{(plData?.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        ) : (
          // Balance Sheet Page
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">Statement of Financial Position</h2>
              {bsData && (
                <span className={`text-xs font-bold px-2 py-1 rounded ${bsData.balanced ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                  {bsData.balanced ? 'BALANCED' : 'UNBALANCED'}
                </span>
              )}
            </div>

            {bsData?.sections?.map((section) => (
              <div key={section.sectionName} className="space-y-2">
                <h3 className="text-xs uppercase font-bold text-foreground-muted bg-background-muted px-3 py-1.5 rounded">{section.sectionName}</h3>
                <div className="divide-y divide-border px-3">
                  {section.accounts?.map((acc) => (
                    <div key={acc.accountCode} className="flex justify-between py-2 text-sm">
                      <span className="text-foreground-muted font-medium">{acc.accountCode} — {acc.description}</span>
                      <span className="font-mono font-semibold">{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2.5 font-bold border-t border-border mt-1 text-sm bg-background-muted/30 px-2 rounded">
                    <span>Total {section.sectionName}</span>
                    <span className="font-mono">{section.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t-2 border-double border-border pt-4 mt-6 space-y-3">
              <div className="flex justify-between text-base font-bold bg-primary/10 p-3 rounded-theme">
                <span>Total Assets</span>
                <span className="font-mono text-primary">{(bsData?.totalAssets || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-bold bg-card border border-border p-3 rounded-theme shadow-sm">
                <span>Total Liabilities and Equity</span>
                <span className="font-mono">{(bsData?.totalLiabilitiesAndEquity || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
