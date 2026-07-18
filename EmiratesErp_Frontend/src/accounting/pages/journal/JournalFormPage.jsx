import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Play, CheckCircle } from 'lucide-react';
import { journalApi } from '../../api/journalApi';
import JournalLineTable from '../../components/JournalLineTable';
import { toast } from 'react-toastify';

export default function JournalFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'undefined';

  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split('T')[0],
    documentType: 'MANUAL_JOURNAL',
    dueDate: '',
    description: '',
    referenceNumber: '',
  });

  const [lines, setLines] = useState([
    { lineNumber: 1, accountId: '', debitAmount: '', creditAmount: '', description: '' },
    { lineNumber: 2, accountId: '', debitAmount: '', creditAmount: '', description: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchEntry();
    }
  }, [id]);

  const fetchEntry = async () => {
    setLoading(true);
    try {
      const res = await journalApi.getById(id);
      const data = res.data?.data;
      if (data) {
        if (data.status !== 'DRAFT') {
          toast.error('Only DRAFT journal entries can be edited.');
          navigate('/account-dashboard/journal-entries');
          return;
        }
        setFormData({
          entryDate: new Date(data.entryDate).toISOString().split('T')[0],
          documentType: data.documentType || 'MANUAL_JOURNAL',
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
          description: data.description || '',
          referenceNumber: data.referenceNumber || '',
        });
        setLines(
          data.lines?.map(l => ({
            lineNumber: l.lineNumber,
            accountId: l.accountId,
            debitAmount: l.debitAmount || '',
            creditAmount: l.creditAmount || '',
            description: l.description || '',
            dimCompanyId: l.dimCompanyId || '',
            dimItemId: l.dimItemId || '',
            dimEmployeeId: l.dimEmployeeId || '',
            dimBankAccountId: l.dimBankAccountId || '',
            dimFixedAssetId: l.dimFixedAssetId || ''
          })) || []
        );
      }
    } catch (err) {
      toast.error('Failed to load journal entry details');
      navigate('/account-dashboard/journal-entries');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setDirty(true);
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLinesChange = (updatedLines) => {
    setDirty(true);
    setLines(updatedLines);
  };

  const validate = () => {
    if (!formData.entryDate) {
      toast.error('Entry date is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Entry description is required');
      return false;
    }
    if (lines.length < 2) {
      toast.error('A journal entry must contain at least 2 lines');
      return false;
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!l.accountId) {
        toast.error(`Line ${l.lineNumber}: GL Account is required`);
        return false;
      }
      const Dr = parseFloat(l.debitAmount) || 0;
      const Cr = parseFloat(l.creditAmount) || 0;
      
      if (Dr <= 0 && Cr <= 0) {
        toast.error(`Line ${l.lineNumber}: Debit or Credit amount must be greater than zero`);
        return false;
      }
      if (Dr > 0 && Cr > 0) {
        toast.error(`Line ${l.lineNumber}: A line cannot have both Debit and Credit amounts`);
        return false;
      }
      totalDebit += Dr;
      totalCredit += Cr;
    }

    if (Math.abs(totalDebit - totalCredit) >= 0.001) {
      toast.error(`Journal entry is unbalanced. Debit and Credit totals must match. Difference: ${(Math.abs(totalDebit - totalCredit)).toFixed(2)}`);
      return false;
    }

    return true;
  };

  const saveEntry = async (shouldPost = false) => {
    if (!validate()) return;
    setLoading(true);

    const payload = {
      ...formData,
      status: 'DRAFT',
      lines: lines.map(l => ({
        lineNumber: l.lineNumber,
        accountId: parseInt(l.accountId),
        debitAmount: parseFloat(l.debitAmount) || null,
        creditAmount: parseFloat(l.creditAmount) || null,
        description: l.description || null,
        dimCompanyId: l.dimCompanyId ? parseInt(l.dimCompanyId) : null,
        dimItemId: l.dimItemId ? parseInt(l.dimItemId) : null,
        dimEmployeeId: l.dimEmployeeId ? parseInt(l.dimEmployeeId) : null,
        dimBankAccountId: l.dimBankAccountId ? parseInt(l.dimBankAccountId) : null,
        dimFixedAssetId: l.dimFixedAssetId ? parseInt(l.dimFixedAssetId) : null
      }))
    };

    try {
      let savedId = id;
      if (isEdit) {
        await journalApi.update(id, payload);
        toast.success('Journal entry updated as draft!');
      } else {
        const res = await journalApi.create(payload);
        savedId = res.data?.data?.journalEntryId;
        toast.success('Journal entry created as draft!');
      }

      if (shouldPost && savedId) {
        await journalApi.post(savedId);
        toast.success('Journal entry posted successfully!');
      }
      setDirty(false);
      navigate('/account-dashboard/journal-entries');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save journal entry');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (dirty && !window.confirm('You have unsaved changes. Are you sure you want to discard them?')) return;
    navigate('/account-dashboard/journal-entries');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground"
    >
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground mb-2 transition-colors focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? 'Edit Draft Journal Entry' : 'New Journal Entry'}
        </h1>
      </div>

      {/* Form Area */}
      <div className="flex-1 overflow-y-auto space-y-6 w-full pb-12 pr-4">
        <div className="bg-card border border-border rounded-theme p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* Entry Number */}
            <div>
              <label className="block text-sm font-semibold mb-2">Entry Number</label>
              <input
                type="text"
                disabled
                placeholder="Auto-generated"
                className="w-full px-3 py-2 bg-background-muted border border-border rounded-theme text-foreground-muted focus:outline-none"
              />
            </div>

            {/* Entry Date */}
            <div>
              <label className="block text-sm font-semibold mb-2">Entry Date *</label>
              <input
                type="date"
                name="entryDate"
                required
                disabled={loading}
                value={formData.entryDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-theme text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Document Type */}
            <div>
              <label className="block text-sm font-semibold mb-2">Document Type *</label>
              <select
                name="documentType"
                required
                disabled={loading}
                value={formData.documentType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-theme text-foreground focus:outline-none focus:border-primary"
              >
                <option value="MANUAL_JOURNAL">Manual Journal</option>
                <option value="OPENING_BALANCE">Opening Balance</option>
                <option value="CUSTOMER_INVOICE">Customer Invoice</option>
                <option value="SUPPLIER_INVOICE">Supplier Invoice</option>
                <option value="CREDIT_NOTE">Credit Note</option>
                <option value="DEBIT_NOTE">Debit Note</option>
                <option value="PAYMENT_VOUCHER_BANK">Bank Payment</option>
                <option value="RECEIPT_VOUCHER_BANK">Bank Receipt</option>
              </select>
            </div>
            
            {['CUSTOMER_INVOICE', 'SUPPLIER_INVOICE', 'CREDIT_NOTE', 'DEBIT_NOTE'].includes(formData.documentType) && (
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  disabled={loading}
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Description *</label>
              <input
                type="text"
                name="description"
                required
                disabled={loading}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief reason or description for this entry..."
                className="w-full px-3 py-2 bg-background border border-border rounded-theme text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-semibold mb-2">Reference Number</label>
              <input
                type="text"
                name="referenceNumber"
                disabled={loading}
                value={formData.referenceNumber}
                onChange={handleInputChange}
                placeholder="e.g. invoice/receipt id"
                className="w-full px-3 py-2 bg-background border border-border rounded-theme text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Lines Entry Table */}
        <div className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-primary">Transaction Lines</h2>
          <JournalLineTable
            lines={lines}
            onChange={handleLinesChange}
            readOnly={loading}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-border text-foreground hover:bg-background-muted transition-colors rounded-theme text-sm font-semibold"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={loading}
            onClick={() => saveEntry(false)}
            className="flex items-center gap-2 border border-border text-foreground hover:bg-background-muted px-4 py-2 rounded-theme text-sm font-semibold transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => saveEntry(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-theme text-sm font-semibold shadow transition-all"
          >
            <Play className="h-4 w-4" />
            Post Entry
          </button>
        </div>
      </div>
    </motion.div>
  );
}
