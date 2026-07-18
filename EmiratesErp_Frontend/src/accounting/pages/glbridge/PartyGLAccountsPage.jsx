import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, Save, Building2 } from 'lucide-react';
import { partyGlApi } from '../../api/partyGlApi';
import { useAccounting } from '../../context/AccountingContext';
import GLAccountSelector from '../../components/GLAccountSelector';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function PartyGLAccountsPage() {
  const { accounts, loading: accountsLoading } = useAccounting();
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [parties, setParties] = useState([]);
  const [loadingParties, setLoadingParties] = useState(false);

  // Drawer / Form state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    partyType: 'CUSTOMER',
    partyId: '',
    accountsReceivableId: null,
    accountsPayableId: null,
    advancesReceivedId: null,
    advancesPaidId: null,
    pdcsReceivedId: null,
    pdcsIssuedId: null,
    contractAssetsId: null,
    retentionReceivablesId: null,
    retentionPayablesId: null,
    retentionOutputVatId: null,
    retentionInputVatId: null,
    unbilledPurchasesId: null,
    advanceToReceiveId: null
  });

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const res = await partyGlApi.getAll();
      setMappings(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching party GL mappings', err);
      toast.error('Failed to load Party GL mappings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      const fetchParties = async () => {
        setLoadingParties(true);
        try {
          const token = localStorage.getItem('token');
          const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
          // Ensure we don't double /api if VITE_API_BASE_URL already contains it
          const baseURL = API_URL.endsWith('/api') ? API_URL.replace('/api', '') : API_URL;
          
          const res = await axios.get(`${baseURL}/api/parties?type=${formData.partyType}&size=1000`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setParties(res.data?.content || res.data?.data || res.data || []);
        } catch (err) {
          console.error('Error fetching parties', err);
        } finally {
          setLoadingParties(false);
        }
      };
      fetchParties();
    }
  }, [drawerOpen, formData.partyType]);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setFormData({
      id: null,
      partyType: 'CUSTOMER',
      partyId: '',
      accountsReceivableId: null,
      accountsPayableId: null,
      advancesReceivedId: null,
      advancesPaidId: null,
      pdcsReceivedId: null,
      pdcsIssuedId: null,
      contractAssetsId: null,
      retentionReceivablesId: null,
      retentionPayablesId: null,
      retentionOutputVatId: null,
      retentionInputVatId: null,
      unbilledPurchasesId: null,
      advanceToReceiveId: null
    });
    setDrawerOpen(true);
  };

  const handleOpenEdit = (mapping) => {
    setIsEdit(true);
    setFormData({
      id: mapping.id,
      partyType: mapping.partyType || 'CUSTOMER',
      partyId: mapping.partyId || '',
      accountsReceivableId: mapping.accountsReceivableId || null,
      accountsPayableId: mapping.accountsPayableId || null,
      advancesReceivedId: mapping.advancesReceivedId || null,
      advancesPaidId: mapping.advancesPaidId || null,
      pdcsReceivedId: mapping.pdcsReceivedId || null,
      pdcsIssuedId: mapping.pdcsIssuedId || null,
      contractAssetsId: mapping.contractAssetsId || null,
      retentionReceivablesId: mapping.retentionReceivablesId || null,
      retentionPayablesId: mapping.retentionPayablesId || null,
      retentionOutputVatId: mapping.retentionOutputVatId || null,
      retentionInputVatId: mapping.retentionInputVatId || null,
      unbilledPurchasesId: mapping.unbilledPurchasesId || null,
      advanceToReceiveId: mapping.advanceToReceiveId || null
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mapping?')) return;
    try {
      await partyGlApi.delete(id);
      toast.success('Mapping deleted successfully!');
      fetchMappings();
    } catch (err) {
      toast.error('Failed to delete mapping');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.partyId) {
      toast.error('Party ID is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        partyId: parseInt(formData.partyId)
      };
      
      await partyGlApi.save(payload);
      toast.success(isEdit ? 'Party GL mapping updated!' : 'Party GL mapping created!');
      setDrawerOpen(false);
      fetchMappings();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save mapping');
    } finally {
      setSubmitting(false);
    }
  };

  const getAccountCode = (accountId) => {
    const acc = accounts.find(a => a.accountId === accountId);
    return acc ? acc.accountCode : '';
  };

  const getFilteredMappings = () => {
    return mappings.filter(m => 
      String(m.partyId).includes(searchTerm) ||
      m.partyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.accountsReceivableCode && m.accountsReceivableCode.includes(searchTerm)) ||
      (m.accountsPayableCode && m.accountsPayableCode.includes(searchTerm))
    );
  };

  const filteredMappings = getFilteredMappings();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-1 flex flex-col overflow-hidden p-6 bg-background text-foreground"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
            <Link to="/account-dashboard" className="hover:text-primary">Accounting</Link>
            <span>&gt;</span>
            <span className="text-foreground-muted font-medium">Party GL Accounts</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Party GL Accounts Mapping</h1>
        </div>

        <div>
          <button
            id="btn-new-party-gl"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-all px-4 py-2 rounded-theme text-sm font-semibold shadow"
          >
            <Plus className="h-4 w-4" />
            New Party Mapping
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 bg-card border border-border p-3 rounded-theme flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            id="party-gl-search"
            placeholder="Search by Party ID, Type or Account Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-theme text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Main View Table */}
      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm">
        {loading || accountsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-background-muted text-foreground-muted border-b border-border text-xs uppercase font-semibold">
                  <th className="p-3">Party ID</th>
                  <th className="p-3">Party Type</th>
                  <th className="p-3">Accounts Receivable (AR)</th>
                  <th className="p-3">Accounts Payable (AP)</th>
                  <th className="p-3">Advances (Rec/Paid)</th>
                  <th className="p-3">PDCs (Rec/Issued)</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-foreground-muted">
                      No party mapping configurations found.
                    </td>
                  </tr>
                ) : (
                  filteredMappings.map(mapping => (
                    <tr key={mapping.id} className="border-b border-border/40 hover:bg-background-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-primary">{mapping.partyId}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          mapping.partyType === 'CUSTOMER' 
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {mapping.partyType}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-sm">
                        {mapping.accountsReceivableCode || '—'}
                      </td>
                      <td className="p-3 font-mono text-sm">
                        {mapping.accountsPayableCode || '—'}
                      </td>
                      <td className="p-3 font-mono text-sm">
                        {mapping.advancesReceivedCode ? `Rec: ${mapping.advancesReceivedCode}` : ''}
                        {mapping.advancesReceivedCode && mapping.advancesPaidCode ? ' / ' : ''}
                        {mapping.advancesPaidCode ? `Paid: ${mapping.advancesPaidCode}` : ''}
                        {!mapping.advancesReceivedCode && !mapping.advancesPaidCode ? '—' : ''}
                      </td>
                      <td className="p-3 font-mono text-sm">
                        {mapping.pdcsReceivedCode ? `Rec: ${mapping.pdcsReceivedCode}` : ''}
                        {mapping.pdcsReceivedCode && mapping.pdcsIssuedCode ? ' / ' : ''}
                        {mapping.pdcsIssuedCode ? `Iss: ${mapping.pdcsIssuedCode}` : ''}
                        {!mapping.pdcsReceivedCode && !mapping.pdcsIssuedCode ? '—' : ''}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(mapping)}
                            className="p-1 text-foreground-muted hover:text-primary hover:bg-background-muted rounded transition-all"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(mapping.id)}
                            className="p-1 text-foreground-muted hover:text-destructive hover:bg-background-muted rounded transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer / Modal for Create and Edit */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0"
            />

            {/* Sidebar Form container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-2xl h-full bg-card border-l border-border shadow-2xl flex flex-col z-10"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">
                    {isEdit ? 'Edit Party Mapping' : 'Create Party Mapping'}
                  </h2>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 hover:bg-background-muted rounded-theme text-foreground-muted hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Party Type */}
                  <div>
                    <label htmlFor="party-type-select" className="block text-sm font-semibold mb-2">Party Type *</label>
                    <select
                      id="party-type-select"
                      required
                      disabled={isEdit || submitting}
                      value={formData.partyType}
                      onChange={(e) => setFormData(prev => ({ ...prev, partyType: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-theme text-foreground focus:outline-none focus:border-primary disabled:opacity-60 text-sm"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="SUPPLIER">Supplier</option>
                    </select>
                  </div>

                  {/* Party ID */}
                  <div>
                    <label htmlFor="party-id-input" className="block text-sm font-semibold mb-2">Party ID *</label>
                    <select
                      id="party-id-input"
                      required
                      disabled={isEdit || submitting || loadingParties}
                      value={formData.partyId}
                      onChange={(e) => setFormData(prev => ({ ...prev, partyId: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-theme text-foreground focus:outline-none focus:border-primary disabled:opacity-60 text-sm"
                    >
                      <option value="">{loadingParties ? 'Loading...' : 'Select Party...'}</option>
                      {Array.isArray(parties) && parties.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.id} - {p.companyName || p.name || (p.firstName ? p.firstName + ' ' + (p.lastName || '') : 'Unnamed Party')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-bold mb-4 text-primary">Receivable & Asset Accounts</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">Accounts Receivable (AR)</label>
                      <GLAccountSelector
                        value={formData.accountsReceivableId}
                        onChange={(val) => setFormData(prev => ({ ...prev, accountsReceivableId: val }))}
                        placeholder="Select AR Account..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">Advances Received</label>
                      <GLAccountSelector
                        value={formData.advancesReceivedId}
                        onChange={(val) => setFormData(prev => ({ ...prev, advancesReceivedId: val }))}
                        placeholder="Select Advances Received..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">PDCs Received</label>
                      <GLAccountSelector
                        value={formData.pdcsReceivedId}
                        onChange={(val) => setFormData(prev => ({ ...prev, pdcsReceivedId: val }))}
                        placeholder="Select PDCs Received..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">Contract Assets</label>
                      <GLAccountSelector
                        value={formData.contractAssetsId}
                        onChange={(val) => setFormData(prev => ({ ...prev, contractAssetsId: val }))}
                        placeholder="Select Contract Assets..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">Retention Receivables</label>
                      <GLAccountSelector
                        value={formData.retentionReceivablesId}
                        onChange={(val) => setFormData(prev => ({ ...prev, retentionReceivablesId: val }))}
                        placeholder="Select Retention Receivables..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">Retention Output VAT</label>
                      <GLAccountSelector
                        value={formData.retentionOutputVatId}
                        onChange={(val) => setFormData(prev => ({ ...prev, retentionOutputVatId: val }))}
                        placeholder="Select Retention Output VAT..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">Advance to Receive</label>
                      <GLAccountSelector
                        value={formData.advanceToReceiveId}
                        onChange={(val) => setFormData(prev => ({ ...prev, advanceToReceiveId: val }))}
                        placeholder="Select Advance to Receive..."
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-bold mb-4 text-primary">Payable & Liability Accounts</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">Accounts Payable (AP)</label>
                      <GLAccountSelector
                        value={formData.accountsPayableId}
                        onChange={(val) => setFormData(prev => ({ ...prev, accountsPayableId: val }))}
                        placeholder="Select AP Account..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">Advances Paid</label>
                      <GLAccountSelector
                        value={formData.advancesPaidId}
                        onChange={(val) => setFormData(prev => ({ ...prev, advancesPaidId: val }))}
                        placeholder="Select Advances Paid..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">PDCs Issued</label>
                      <GLAccountSelector
                        value={formData.pdcsIssuedId}
                        onChange={(val) => setFormData(prev => ({ ...prev, pdcsIssuedId: val }))}
                        placeholder="Select PDCs Issued..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">Retention Payables</label>
                      <GLAccountSelector
                        value={formData.retentionPayablesId}
                        onChange={(val) => setFormData(prev => ({ ...prev, retentionPayablesId: val }))}
                        placeholder="Select Retention Payables..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">Retention Input VAT</label>
                      <GLAccountSelector
                        value={formData.retentionInputVatId}
                        onChange={(val) => setFormData(prev => ({ ...prev, retentionInputVatId: val }))}
                        placeholder="Select Retention Input VAT..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground-muted">Unbilled Purchases</label>
                      <GLAccountSelector
                        value={formData.unbilledPurchasesId}
                        onChange={(val) => setFormData(prev => ({ ...prev, unbilledPurchasesId: val }))}
                        placeholder="Select Unbilled Purchases..."
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Form Footer */}
              <div className="p-4 border-t border-border flex justify-end gap-3 bg-background-muted/40">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2 border border-border text-foreground hover:bg-background-muted transition-colors rounded-theme text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-theme text-sm font-semibold shadow"
                >
                  <Save className="h-4 w-4" />
                  {submitting ? 'Saving...' : 'Save Mapping'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
