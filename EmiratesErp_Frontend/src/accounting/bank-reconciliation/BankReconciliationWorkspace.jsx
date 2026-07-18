import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RefreshCcw, Check, Zap, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reconciliationApi } from '../api/reconciliationApi';
import { toast } from 'react-toastify';

export const BankReconciliationWorkspace = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reconId = searchParams.get('id');
  
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [statementLines, setStatementLines] = useState([]);
  const [glLines, setGlLines] = useState([]);

  useEffect(() => {
    if (reconId) {
      fetchReconciliation();
    } else {
      // Mock Data if no ID provided (for UI dev)
      setStatementLines([
        { id: 's1', date: '2026-06-10', description: 'Wire Transfer IN - Global Supplies', amount: 3200, type: 'DEPOSIT' },
        { id: 's2', date: '2026-06-11', description: 'POS Settlement', amount: 500, type: 'DEPOSIT' },
      ]);
      setGlLines([
        { id: 'g1', date: '2026-06-10', description: 'Payment Received APP-2026-0002', amount: 3200, type: 'DEBIT' },
        { id: 'g2', date: '2026-06-11', description: 'Daily Sales POS', amount: 500, type: 'DEBIT' },
      ]);
      setLoading(false);
    }
  }, [reconId]);

  const fetchReconciliation = async () => {
    setLoading(true);
    try {
      const res = await reconciliationApi.getById(reconId);
      const data = res.data;
      // Filter out already matched lines if any
      setStatementLines(data.statementLines?.filter(l => !l.isMatched) || []);
      setGlLines(data.glLines?.filter(l => !l.isMatched) || []);
    } catch (err) {
      toast.error('Failed to fetch reconciliation data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoMatch = async () => {
    if (!reconId) {
      toast.info('Auto-match mock triggered');
      setStatementLines([]);
      setGlLines([]);
      return;
    }
    
    setIsAutoMatching(true);
    try {
      await reconciliationApi.autoMatch(reconId);
      toast.success('Auto-match complete');
      fetchReconciliation();
    } catch (err) {
      toast.error('Auto-match failed');
      console.error(err);
    } finally {
      setIsAutoMatching(false);
    }
  };
  
  const handleComplete = async () => {
    if (!reconId) {
      navigate('/account-dashboard/bank-reconciliation');
      return;
    }
    
    try {
      await reconciliationApi.complete(reconId);
      toast.success('Reconciliation completed!');
      navigate('/account-dashboard/bank-reconciliation');
    } catch (err) {
      toast.error('Failed to complete reconciliation');
    }
  };

  const handleImportStatement = async () => {
    if (!reconId) {
      toast.info('Mock import not available in demo mode');
      return;
    }
    
    setLoading(true);
    try {
      await reconciliationApi.importMockLines(reconId);
      toast.success('Successfully imported bank statement');
      fetchReconciliation();
    } catch (err) {
      toast.error('Failed to import bank statement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 bg-background min-h-screen text-foreground flex items-center justify-center">Loading Workspace...</div>;
  }

  return (
    <div className="p-6 bg-background min-h-screen flex flex-col text-foreground">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/account-dashboard/bank-reconciliation')} className="p-2 bg-card rounded-full shadow-sm hover:bg-hover transition-colors border border-border">
            <ArrowLeft size={20} className="text-foreground-muted" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliation Workspace</h1>
            <p className="text-foreground-muted mt-1">Match bank statements with General Ledger entries</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={handleImportStatement} className="bg-card border border-border text-foreground hover:bg-hover px-5 py-2.5 rounded-theme flex items-center gap-2 shadow-sm transition-all font-medium">
            <FileSpreadsheet size={20} className="text-success" />
            <span>Import Statement</span>
          </button>
          <button 
            onClick={handleAutoMatch}
            disabled={isAutoMatching || statementLines.length === 0}
            className={`px-5 py-2.5 rounded-theme flex items-center gap-2 shadow-sm transition-all font-medium ${
              isAutoMatching || statementLines.length === 0 ? 'bg-background-muted text-foreground-muted cursor-not-allowed border border-border' : 'bg-primary hover:opacity-90 text-primary-foreground'
            }`}
          >
            {isAutoMatching ? <RefreshCcw size={20} className="animate-spin" /> : <Zap size={20} />}
            <span>{isAutoMatching ? 'Matching...' : 'Auto-Match'}</span>
          </button>
        </div>
      </div>

      {statementLines.length === 0 && glLines.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center bg-card rounded-theme border border-border shadow-sm">
          <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
            <Check size={40} />
          </div>
          <h2 className="text-2xl font-bold">All Caught Up!</h2>
          <p className="text-foreground-muted mt-2 text-center max-w-md">There are no unreconciled items left for this bank account. Everything matches perfectly.</p>
          <button 
            onClick={handleComplete}
            className="mt-6 bg-success hover:bg-success/90 text-white px-6 py-2.5 rounded-theme shadow-sm transition-all font-medium"
          >
            Mark as Complete
          </button>
        </div>
      )}

      {(statementLines.length > 0 || glLines.length > 0) && (
        <div className="flex gap-6 flex-1 h-[calc(100vh-200px)]">
          {/* Left Column: Bank Statement */}
          <div className="flex-1 bg-card rounded-theme shadow-sm border border-border flex flex-col overflow-hidden">
            <div className="bg-background-muted px-6 py-4 border-b border-border flex justify-between items-center">
              <h2 className="font-semibold">Bank Statement Lines</h2>
              <span className="bg-card text-foreground-muted text-xs px-2 py-1 rounded-full font-medium border border-border">{statementLines.length} Unreconciled</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <AnimatePresence>
                {statementLines.map(line => (
                  <motion.div 
                    key={line.id}
                    exit={{ opacity: 0, x: -50, backgroundColor: 'var(--color-success)' }}
                    className="p-4 border border-border bg-background rounded-theme hover:border-primary/50 transition-colors cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <input type="checkbox" className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-card" />
                      <div>
                        <p className="font-medium text-foreground">{line.description}</p>
                        <p className="text-xs text-foreground-muted mt-1">{line.date}</p>
                      </div>
                    </div>
                    <div className={`font-semibold text-lg ${line.amount > 0 ? 'text-success' : 'text-foreground'}`}>
                      {line.amount > 0 ? '+' : ''}{line.amount?.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: GL Entries */}
          <div className="flex-1 bg-card rounded-theme shadow-sm border border-border flex flex-col overflow-hidden">
            <div className="bg-background-muted px-6 py-4 border-b border-border flex justify-between items-center">
              <h2 className="font-semibold">General Ledger (In System)</h2>
              <span className="bg-card text-foreground-muted text-xs px-2 py-1 rounded-full font-medium border border-border">{glLines.length} Unreconciled</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <AnimatePresence>
                {glLines.map(line => (
                  <motion.div 
                    key={line.id}
                    exit={{ opacity: 0, x: 50, backgroundColor: 'var(--color-success)' }}
                    className="p-4 border border-border bg-background rounded-theme hover:border-primary/50 transition-colors cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <input type="checkbox" className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-card" />
                      <div>
                        <p className="font-medium text-foreground">{line.description}</p>
                        <p className="text-xs text-foreground-muted mt-1">{line.date}</p>
                      </div>
                    </div>
                    <div className={`font-semibold text-lg ${line.amount > 0 ? 'text-success' : 'text-foreground'}`}>
                      {line.amount > 0 ? '+' : ''}{line.amount?.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
