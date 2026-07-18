import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Eye, TrendingUp, Landmark, ShieldCheck } from 'lucide-react';
import { fixedAssetSubLedgerApi } from '../../api/fixedAssetSubLedgerApi';
import { toast } from 'react-toastify';

export default function FixedAssetRegisterPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ACTIVE, DISPOSED

  useEffect(() => {
    fetchRegister();
  }, []);

  const fetchRegister = async () => {
    setLoading(true);
    try {
      const res = await fixedAssetSubLedgerApi.getFixedAssetRegister();
      setData(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load Fixed Asset Register');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    const matchSearch = item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.assetNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'ACTIVE') {
      return matchSearch && item.status === 'ACTIVE';
    }
    if (filterStatus === 'DISPOSED') {
      return matchSearch && item.status === 'DISPOSED';
    }
    return matchSearch;
  });

  const totalCost = filteredData.reduce((sum, item) => sum + item.cost, 0);
  const totalDep = filteredData.reduce((sum, item) => sum + item.accumDepreciation, 0);
  const totalNbv = filteredData.reduce((sum, item) => sum + item.netBookValue, 0);

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
            <span className="text-foreground-muted font-medium">Fixed Asset Register</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Fixed Asset Register</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-theme p-4 flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground-muted uppercase">Total Cost Value</p>
            <p className="text-2xl font-bold">{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-theme p-4 flex items-center gap-4">
          <div className="bg-error/10 text-error p-3 rounded-full">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground-muted uppercase">Accum. Depreciation</p>
            <p className="text-2xl font-bold">{totalDep.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-theme p-4 flex items-center gap-4">
          <div className="bg-success/10 text-success p-3 rounded-full">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground-muted uppercase">Net Book Value (NBV)</p>
            <p className="text-2xl font-bold">{totalNbv.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-theme p-4 mb-6 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search Asset No or Description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-theme text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex bg-background border border-border rounded-theme p-1">
          {['ALL', 'ACTIVE', 'DISPOSED'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all ${
                filterStatus === tab ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              {tab}
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
                <th className="p-3">Asset Number</th>
                <th className="p-3">Description</th>
                <th className="p-3">Acquisition Date</th>
                <th className="p-3 text-right">Cost</th>
                <th className="p-3 text-right">Accum. Dep.</th>
                <th className="p-3 text-right">Net Book Value (NBV)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length === 0 ? (
                <tr><td colSpan="8" className="p-6 text-center text-foreground-muted">No assets found.</td></tr>
              ) : (
                filteredData.map((item, index) => (
                  <motion.tr
                    key={item.fixedAssetId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.15 }}
                    onClick={() => navigate(`/account-dashboard/sub-ledger/fixed-assets/${item.fixedAssetId}`)}
                    className="hover:bg-background-muted/40 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-semibold">{item.assetNumber}</td>
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 font-mono text-xs">{item.acquisitionDate || 'N/A'}</td>
                    <td className="p-3 text-right font-mono">{item.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono text-error-muted">
                      {item.accumDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      {item.netBookValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-foreground-muted/10 text-foreground-muted'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                      <Link
                        to={`/account-dashboard/sub-ledger/fixed-assets/${item.fixedAssetId}`}
                        className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background-muted rounded inline-flex"
                        title="View Asset Ledger"
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
