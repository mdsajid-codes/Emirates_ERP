import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Play, Power, Layers } from 'lucide-react';
import { coaApi } from '../../api/coaApi';
import { useAccounting } from '../../context/AccountingContext';
import { toast } from 'react-toastify';

export default function CoaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useAccounting();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccount();
  }, [id]);

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const res = await coaApi.getById(id);
      setAccount(res.data?.data || null);
    } catch (err) {
      toast.error('Failed to load account details');
      navigate('/account-dashboard/chart-of-accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!account) return;
    try {
      if (account.isActive) {
        await coaApi.deactivate(id);
        toast.success('Account deactivated successfully!');
      } else {
        await coaApi.activate(id);
        toast.success('Account activated successfully!');
      }
      refresh();
      fetchAccount();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground flex flex-col items-center justify-center">
        <p className="text-foreground-muted mb-4">Account not found.</p>
        <Link to="/account-dashboard/chart-of-accounts" className="text-primary hover:underline font-semibold">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground"
    >
      {/* Header breadcrumbs */}
      <div className="mb-6">
        <Link
          to="/account-dashboard/chart-of-accounts"
          className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GL Account Details</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/account-dashboard/chart-of-accounts/edit/${account.accountId}`}
              className="flex items-center gap-2 border border-border text-foreground hover:bg-background-muted px-4 py-2 rounded-theme text-sm font-semibold transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Edit Account
            </Link>
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-theme shadow ${
                account.isActive
                  ? 'bg-error text-white hover:opacity-90'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              <Power className="h-4 w-4" />
              {account.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="flex-1 overflow-y-auto space-y-6 max-w-4xl">
        <div className="bg-card border border-border rounded-theme p-6 shadow-sm">
          {/* Main summary card */}
          <div className="flex items-center gap-4 border-b border-border pb-6 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold bg-background-muted px-2 py-0.5 rounded-theme">
                  {account.accountCode}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${account.isActive ? 'bg-success/15 text-success' : 'bg-foreground-muted/15 text-foreground-muted'}`}>
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1">{account.description}</h2>
            </div>
          </div>

          {/* Details list grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-xs uppercase font-bold text-foreground-muted">Account Type</span>
              <p className="text-sm font-semibold mt-1">{account.accountType}</p>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-foreground-muted">Account Section</span>
              <p className="text-sm font-semibold mt-1">{account.section}</p>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-foreground-muted">Parent Group</span>
              <p className="text-sm font-semibold mt-1">{account.parentGroup || '—'}</p>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-foreground-muted">Currency</span>
              <p className="text-sm font-semibold mt-1">{account.currency}</p>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-foreground-muted">Quantitative Tracking</span>
              <p className="text-sm font-semibold mt-1">{account.isQuantitative ? 'Enabled (Physical Quantity)' : 'Disabled'}</p>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-foreground-muted">Off-Balance Sheet</span>
              <p className="text-sm font-semibold mt-1">{account.isOffBalance ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Dimensions tag list */}
          <div className="border-t border-border/60 pt-6 mt-6">
            <span className="text-xs uppercase font-bold text-foreground-muted">Active Dimension Tracking</span>
            <div className="flex flex-wrap gap-2 mt-3">
              {account.dimensions && account.dimensions.length > 0 ? (
                account.dimensions.map(dim => (
                  <span
                    key={dim.dimensionId}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                  >
                    {dim.dimensionType}
                  </span>
                ))
              ) : (
                <p className="text-sm text-foreground-muted italic">No dimensions linked to this account.</p>
              )}
            </div>
          </div>

          {/* Account Details Notes */}
          <div className="border-t border-border/60 pt-6 mt-6">
            <span className="text-xs uppercase font-bold text-foreground-muted">Details / Notes</span>
            <p className="text-sm mt-2 text-foreground/80 leading-relaxed bg-background/50 p-3 border border-border rounded-theme">
              {account.details || 'No notes provided.'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
