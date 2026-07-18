import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { bankApi } from '../api/bankApi';
import { reconciliationApi } from '../api/reconciliationApi';
import { toast } from 'react-toastify';

export const BankReconciliationList = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      // For each bank account, we ideally want the reconciliation status.
      // We will fetch bank accounts first.
      const res = await bankApi.getAllBankAccounts();
      const accountsData = res.data || [];
      
      // We can map over them. In a real app with a dedicated endpoint, 
      // the unreconciled statements/GL would come from the backend. 
      // For now, we will add default 0 counts if not provided by backend.
      const enrichedAccounts = accountsData.map(acc => ({
        ...acc,
        unreconciledStatements: acc.unreconciledStatements || 0,
        unreconciledGl: acc.unreconciledGl || 0
      }));
      
      setAccounts(enrichedAccounts);
    } catch (err) {
      toast.error('Failed to load bank accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startReconciliation = async (e, accountId) => {
    e.stopPropagation();
    try {
      // In a real scenario, you'd open a modal to select dates and upload file.
      // Here we simulate starting one.
      const res = await reconciliationApi.start({ 
        bankAccountId: accountId, 
        statementDate: new Date().toISOString().split('T')[0], 
        statementBalance: 0,
        lines: [] 
      });
      toast.success('Started new reconciliation');
      navigate(`/account-dashboard/bank-reconciliation/workspace?id=${res.data.id}&accountId=${accountId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start reconciliation');
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen text-foreground">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h1>
          <p className="text-foreground-muted mt-1">Select an account to start matching</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-foreground-muted">Loading bank accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="col-span-full text-center py-8 text-foreground-muted">No bank accounts found.</div>
        ) : (
          accounts.map((acc, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              key={acc.id} 
              onClick={(e) => startReconciliation(e, acc.id)}
              className="bg-card rounded-theme shadow-sm border border-border p-6 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 text-primary rounded-theme">
                  <Layers size={24} />
                </div>
                <button className="text-foreground-muted group-hover:text-primary transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>
              <h3 className="font-semibold text-lg text-foreground">{acc.accountName}</h3>
              <p className="text-foreground-muted text-sm">{acc.bank?.name || acc.bank}</p>
              
              <div className="mt-5 pt-5 border-t border-border flex justify-between items-center">
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-foreground-muted uppercase font-semibold tracking-wider mb-1">Unreconciled Bank</p>
                    <p className={`font-semibold text-lg ${acc.unreconciledStatements > 0 ? 'text-warning' : 'text-foreground'}`}>
                      {acc.unreconciledStatements}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted uppercase font-semibold tracking-wider mb-1">Unreconciled GL</p>
                    <p className={`font-semibold text-lg ${acc.unreconciledGl > 0 ? 'text-warning' : 'text-foreground'}`}>
                      {acc.unreconciledGl}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={(e) => startReconciliation(e, acc.id)}
                  className="bg-background-muted hover:bg-primary hover:text-primary-foreground text-primary border border-border p-2 rounded-theme transition-colors shadow-sm"
                  title="Start New Reconciliation"
                >
                  <Plus size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
