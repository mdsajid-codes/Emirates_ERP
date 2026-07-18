import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Play, RefreshCw, FileText } from 'lucide-react';
import { journalApi } from '../../api/journalApi';
import StatusBadge from '../../components/StatusBadge';
import JournalLineTable from '../../components/JournalLineTable';
import { toast } from 'react-toastify';

export default function JournalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    if (!id || id === 'undefined') {
      setLoading(false);
      setEntry(null);
      return;
    }
    setLoading(true);
    try {
      const res = await journalApi.getById(id);
      setEntry(res.data?.data || null);
    } catch (err) {
      toast.error('Failed to load journal entry details');
      navigate('/account-dashboard/journal-entries');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!window.confirm('Are you sure you want to post this entry? This action cannot be undone.')) return;
    try {
      await journalApi.post(id);
      toast.success('Journal entry posted successfully!');
      fetchEntry();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post entry');
    }
  };

  const handleReverse = async () => {
    if (!window.confirm(`Are you sure you want to reverse ${entry.entryNumber}? This will post a counter transaction.`)) return;
    try {
      await journalApi.reverse(id);
      toast.success('Reversal transaction generated successfully!');
      fetchEntry();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reverse entry');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground flex flex-col items-center justify-center">
        <p className="text-foreground-muted mb-4">Journal Entry not found.</p>
        <Link to="/account-dashboard/journal-entries" className="text-primary hover:underline font-semibold">
          Back to list
        </Link>
      </div>
    );
  }

  const mappedLines = entry.lines?.map(l => ({
    lineNumber: l.lineNumber,
    accountCode: l.accountCode,
    accountDescription: l.accountDescription,
    debitAmount: l.debitAmount,
    creditAmount: l.creditAmount,
    description: l.description || ''
  })) || [];

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
          to="/account-dashboard/journal-entries"
          className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{entry.entryNumber}</h1>
              <StatusBadge status={entry.status} />
            </div>
            <p className="text-sm text-foreground-muted mt-1">
              {entry.documentType?.replace('_', ' ')}  |  {new Date(entry.entryDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {entry.status === 'DRAFT' && (
              <>
                <Link
                  to={`/account-dashboard/journal-entries/edit/${entry.journalEntryId}`}
                  className="flex items-center gap-2 border border-border text-foreground hover:bg-background-muted px-4 py-2 rounded-theme text-sm font-semibold transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Draft
                </Link>
                <button
                  onClick={handlePost}
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-theme text-sm font-semibold shadow transition-all"
                >
                  <Play className="h-4 w-4" />
                  Post Entry
                </button>
              </>
            )}

            {entry.status === 'POSTED' && (
              <button
                onClick={handleReverse}
                className="flex items-center gap-2 bg-error text-white hover:opacity-90 px-4 py-2 rounded-theme text-sm font-semibold shadow transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Reverse Entry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Info */}
      <div className="flex-1 overflow-y-auto space-y-6 w-full pb-12">
        <div className="bg-card border border-border rounded-theme p-6 shadow-sm">
          <h2 className="text-xs uppercase font-bold text-foreground-muted mb-3">Audit Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-semibold text-foreground-muted">Description</span>
              <p className="text-sm font-medium mt-1">{entry.description}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground-muted">Reference Number</span>
              <p className="text-sm font-medium mt-1">{entry.referenceNumber || '—'}</p>
            </div>

            {entry.reversalOfEntryNumber && (
              <div className="md:col-span-2 bg-error/5 border border-error/20 p-3 rounded-theme text-xs text-error font-medium">
                ⚠️ This entry is a counter-reversal that nullified posted entry: <span className="font-bold underline">{entry.reversalOfEntryNumber}</span>
              </div>
            )}
            {entry.reversedByEntryNumber && (
              <div className="md:col-span-2 bg-warning/5 border border-warning/20 p-3 rounded-theme text-xs text-warning font-medium">
                ⚠️ This transaction was reversed and counter-posted by: <span className="font-bold underline">{entry.reversedByEntryNumber}</span>
              </div>
            )}
          </div>
        </div>


        {/* Lines Table */}
        <div className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-primary">Transaction Details</h2>
          <JournalLineTable
            lines={mappedLines}
            readOnly={true}
          />
        </div>

        {/* Related Entries */}
        {entry.relatedEntries && entry.relatedEntries.length > 0 && (
          <div className="bg-card border border-border rounded-theme p-6 shadow-sm">
            <h2 className="text-xs uppercase font-bold text-foreground-muted mb-3">Linked Transactions / Journal Entries</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-foreground-muted text-xs uppercase">
                    <th className="pb-2">Entry Number</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Debit</th>
                    <th className="pb-2 text-right">Credit</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entry.relatedEntries.map(rel => (
                    <tr key={rel.journalEntryId} className="hover:bg-background-muted transition-colors">
                      <td className="py-3 font-semibold text-primary">
                        <Link to={`/account-dashboard/journal-entries/${rel.journalEntryId}`} className="hover:underline">
                          {rel.entryNumber}
                        </Link>
                      </td>
                      <td className="py-3 text-xs">{rel.documentType?.replace('_', ' ')}</td>
                      <td className="py-3 text-xs">{new Date(rel.entryDate).toLocaleDateString()}</td>
                      <td className="py-3 text-xs">{rel.description}</td>
                      <td className="py-3 text-right font-medium">{rel.totalDebit?.toFixed(2)}</td>
                      <td className="py-3 text-right font-medium">{rel.totalCredit?.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${rel.status === 'POSTED' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                          }`}>{rel.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}
