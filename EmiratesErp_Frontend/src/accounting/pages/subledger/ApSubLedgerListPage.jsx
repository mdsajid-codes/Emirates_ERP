import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Eye, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { subLedgerApi } from '../../api/subLedgerApi';
import { toast } from 'react-toastify';

export default function ApSubLedgerListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, WITH_BALANCE, OVERDUE

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await subLedgerApi.getApSummary();
      setData(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load AP Sub-Ledger summary');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    const matchSearch = item.partyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'WITH_BALANCE') {
      return matchSearch && item.balance !== 0;
    }
    if (filterType === 'OVERDUE') {
      const overdue = item.aging30 + item.aging60 + item.aging90 + item.agingOver90;
      return matchSearch && overdue > 0;
    }
    return matchSearch;
  });

  const totalOutstanding = filteredData.reduce((sum, item) => sum + item.balance, 0);
  const totalOverdue30Plus = filteredData.reduce((sum, item) => sum + item.aging60 + item.aging90 + item.agingOver90, 0);

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
            <span className="text-foreground-muted font-medium">Accounts Payable</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts Payable Sub-Ledger</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-theme p-4 flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground-muted uppercase">Amount Owed to Suppliers</p>
            <p className="text-2xl font-bold">{totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-theme p-4 flex items-center gap-4">
          <div className="bg-success/10 text-success p-3 rounded-full">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground-muted uppercase">Suppliers with Balance</p>
            <p className="text-2xl font-bold">{filteredData.filter(i => i.balance !== 0).length}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-theme p-4 flex items-center gap-4">
          <div className="bg-error/10 text-error p-3 rounded-full">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground-muted uppercase">Overdue &gt; 30 Days</p>
            <p className="text-2xl font-bold">{totalOverdue30Plus.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-theme p-4 mb-6 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search supplier name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex bg-background border border-border rounded-theme p-1">
          {['ALL', 'WITH_BALANCE', 'OVERDUE'].map(tab => (
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

      {/* Main Table */}
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
                <th className="p-3 text-right">Balance</th>
                <th className="p-3 text-right">Current</th>
                <th className="p-3 text-right">1-30 Days</th>
                <th className="p-3 text-right">31-60 Days</th>
                <th className="p-3 text-right">61-90 Days</th>
                <th className="p-3 text-right">90+ Days</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length === 0 ? (
                <tr><td colSpan="8" className="p-6 text-center text-foreground-muted">No records found.</td></tr>
              ) : (
                filteredData.map((item, index) => (
                  <motion.tr
                    key={item.partyId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.15 }}
                    onClick={() => navigate(`/account-dashboard/sub-ledger/ap/${item.partyId}`)}
                    className="hover:bg-background-muted/40 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-semibold">{item.partyName}</td>
                    <td className={`p-3 text-right font-mono font-bold ${item.balance > 0 ? 'text-error' : ''}`}>
                      {item.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono">{item.agingCurrent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className={`p-3 text-right font-mono ${item.aging30 > 0 ? 'text-warning' : ''}`}>
                      {item.aging30.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`p-3 text-right font-mono ${item.aging60 > 0 ? 'text-orange-500' : ''}`}>
                      {item.aging60.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`p-3 text-right font-mono ${item.aging90 > 0 ? 'text-error' : ''}`}>
                      {item.aging90.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`p-3 text-right font-mono ${item.agingOver90 > 0 ? 'text-error font-bold' : ''}`}>
                      {item.agingOver90.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                      <Link
                        to={`/account-dashboard/sub-ledger/ap/${item.partyId}`}
                        className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background-muted rounded inline-flex"
                        title="View Statement"
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
