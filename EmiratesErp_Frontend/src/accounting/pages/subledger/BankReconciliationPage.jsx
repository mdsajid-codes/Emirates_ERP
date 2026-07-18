import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';
import { reconciliationApi } from '../../api/reconciliationApi';
import moment from 'moment';
import { toast } from 'react-toastify';

export default function BankReconciliationPage() {
  const { id: bankAccountId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [reconciliation, setReconciliation] = useState(null);

  const loadReconciliation = async () => {
    try {
      setLoading(true);
      const list = await reconciliationApi.getByBank(bankAccountId);
      const activeDraft = list?.data?.find(r => r.status === 'DRAFT');
      
      if (activeDraft) {
        const recDetails = await reconciliationApi.getById(activeDraft.id);
        setReconciliation(recDetails.data);
      } else {
        setReconciliation(null); // No draft, can create one
      }
    } catch (err) {
      toast.error('Failed to load bank reconciliation data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReconciliation();
    // eslint-disable-next-line
  }, [bankAccountId]);

  const handleCreateDraft = async () => {
    try {
      setLoading(true);
      const newRec = {
        bankAccountId: parseInt(bankAccountId),
        statementDate: moment().endOf('month').format('YYYY-MM-DD'),
        statementOpeningBalance: 0, // Should be fetched from previous closing in real app
        statementClosingBalance: 1000, // Dummy target for now, usually user inputs this
      };
      await reconciliationApi.start(newRec);
      toast.success('Draft reconciliation session started.');
      loadReconciliation();
    } catch (err) {
      toast.error('Failed to create reconciliation session');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClear = async (matchId, currentStatus) => {
    try {
      // Assuming resolve endpoint handles toggle in backend, or passing specific param.
      // Modifying to call resolve API, might need a different API for just toggle in reality if resolve is line-to-line.
      await reconciliationApi.resolve(matchId, null);
      // Refresh data to get updated cleared balance
      const recDetails = await reconciliationApi.getById(reconciliation.id);
      setReconciliation(recDetails.data);
    } catch (err) {
      toast.error('Failed to update match status');
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      await reconciliationApi.complete(reconciliation.id);
      toast.success('Bank reconciliation completed successfully!');
      navigate(`/account-dashboard/sub-ledger/bank/${bankAccountId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to complete reconciliation (variance must be 0).');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !reconciliation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!reconciliation) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground">
        <div className="mb-6">
          <Link to={`/account-dashboard/sub-ledger/bank/${bankAccountId}`} className="text-primary hover:underline flex items-center gap-1 text-sm font-medium mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Bank Statement
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Bank Reconciliation</h1>
        </div>
        <div className="bg-card border border-border rounded-theme p-8 text-center max-w-2xl mx-auto mt-12 shadow-sm">
          <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Active Reconciliation</h2>
          <p className="text-foreground-muted mb-6">There is no draft reconciliation session for this bank account.</p>
          <button
            onClick={handleCreateDraft}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-theme font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
          >
            <PlayCircle className="h-5 w-5" />
            Start New Reconciliation
          </button>
        </div>
      </div>
    );
  }

  const variance = reconciliation.statementClosingBalance - reconciliation.clearedBalance;

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
            <Link to={`/account-dashboard/sub-ledger/bank/${bankAccountId}`} className="hover:text-primary flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Bank Statement
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bank Reconciliation Session
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {variance !== 0 && (
            <span className="text-sm text-foreground-muted font-medium bg-background-muted px-3 py-1.5 rounded-full border border-border">
              Variance must be 0 to complete
            </span>
          )}
          <button
            disabled={variance !== 0}
            onClick={handleComplete}
            className={`px-4 py-2 rounded-theme font-medium flex items-center gap-2 transition-colors ${
              variance === 0
                ? 'bg-success text-success-foreground hover:bg-success/90 cursor-pointer shadow-sm'
                : 'bg-background-muted text-foreground-muted cursor-not-allowed border border-border'
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            Complete Reconciliation
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-theme p-5 text-center shadow-sm">
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1">Statement Closing Balance</p>
          <p className="text-3xl font-bold font-mono">
            {reconciliation.statementClosingBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </p>
        </div>
        <div className="bg-card border border-border rounded-theme p-5 text-center shadow-sm">
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1">Cleared Balance</p>
          <p className="text-3xl font-bold font-mono">
            {reconciliation.clearedBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </p>
        </div>
        <div className={`border rounded-theme p-5 text-center shadow-sm transition-colors ${variance === 0 ? 'bg-success/10 border-success/30' : 'bg-error/10 border-error/30'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${variance === 0 ? 'text-success' : 'text-error'}`}>
            Variance
          </p>
          <p className={`text-3xl font-bold font-mono ${variance === 0 ? 'text-success' : 'text-error'}`}>
            {variance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-background/50 z-20 flex items-center justify-center backdrop-blur-sm">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-background-muted z-10">
            <tr className="text-foreground-muted border-b border-border text-xs uppercase font-semibold">
              <th className="p-3 text-center w-16">Clear</th>
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(!reconciliation.matches || reconciliation.matches.length === 0) ? (
              <tr><td colSpan="4" className="p-6 text-center text-foreground-muted">No transactions to match.</td></tr>
            ) : (
              reconciliation.matches.map((row, index) => (
                <tr
                  key={row.matchId}
                  className={`transition-colors ${row.isCleared ? 'bg-success/5' : 'hover:bg-background-muted/40'}`}
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.isCleared}
                      onChange={() => handleToggleClear(row.matchId, row.isCleared)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 whitespace-nowrap font-medium">{row.entryDate}</td>
                  <td className="p-3 text-foreground-muted">{row.description || '-'}</td>
                  <td className={`p-3 text-right font-mono font-bold ${row.amount >= 0 ? 'text-success' : 'text-error'}`}>
                    {Math.abs(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
