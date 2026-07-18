import React, { useState, useEffect } from 'react';
import { Plus, Building2, CreditCard, X, Save, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bankApi } from '../api/bankApi';
import { coaApi } from '../api/coaApi';
import { toast } from 'react-toastify';

export const BankMaster = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', swiftCode: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await bankApi.getAllBanks();
      setBanks(res.data || []);
    } catch (err) {
      toast.error('Failed to load banks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setSubmitting(true);
    try {
      await bankApi.createBank(formData);
      toast.success('Bank added successfully');
      setShowModal(false);
      setFormData({ name: '', swiftCode: '' });
      fetchBanks();
    } catch (err) {
      toast.error('Failed to create bank');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen text-foreground relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Master</h1>
          <p className="text-foreground-muted mt-1">Manage partner and internal banking institutions</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-theme flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={20} />
          <span>Add Bank</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-foreground-muted">Loading banks...</div>
        ) : banks.length === 0 ? (
          <div className="col-span-full text-center py-8 text-foreground-muted">No banks found.</div>
        ) : (
          banks.map((bank, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              key={bank.id} 
              className="bg-card rounded-theme shadow-sm border border-border p-6 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="p-3 bg-primary/10 text-primary rounded-theme">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{bank.name}</h3>
                <p className="text-foreground-muted text-sm mt-1">SWIFT: {bank.swiftCode || bank.swift || 'N/A'}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-theme shadow-lg border border-border overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background-muted">
                <h2 className="text-lg font-semibold text-foreground">Add New Bank</h2>
                <button onClick={() => setShowModal(false)} className="text-foreground-muted hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. Standard Chartered Bank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1">SWIFT Code</label>
                  <input
                    type="text"
                    value={formData.swiftCode}
                    onChange={(e) => setFormData({...formData, swiftCode: e.target.value})}
                    className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. SCBLAEAD"
                  />
                </div>
                <div className="pt-4 border-t border-border flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-foreground-muted hover:bg-background-muted rounded-theme transition-colors font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="bg-primary hover:opacity-90 text-primary-foreground px-5 py-2 rounded-theme flex items-center gap-2 shadow-sm transition-all font-medium disabled:opacity-50">
                    <Save size={18} />
                    <span>{submitting ? 'Saving...' : 'Save Bank'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const BankAccountMaster = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [banks, setBanks] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [formData, setFormData] = useState({ 
    bankId: '', 
    accountName: '', 
    accountNumber: '', 
    currencyId: 1, 
    glAccountId: '' 
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBankAccounts();
    bankApi.getAllBanks().then(res => setBanks(res.data || [])).catch(console.error);
    coaApi.getAll().then(res => setGlAccounts(res.data?.data || [])).catch(console.error);
  }, []);

  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      const res = await bankApi.getAllBankAccounts();
      setAccounts(res.data || []);
    } catch (err) {
      toast.error('Failed to load bank accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bankId || !formData.accountName || !formData.accountNumber || !formData.glAccountId) return;
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        bankId: Number(formData.bankId),
        glAccountId: Number(formData.glAccountId),
        currencyId: 1
      };
      
      if (editingId) {
        await bankApi.updateBankAccount(editingId, payload);
        toast.success('Bank Account updated successfully');
      } else {
        await bankApi.createBankAccount(payload);
        toast.success('Bank Account created successfully');
      }
      
      setShowModal(false);
      setEditingId(null);
      setFormData({ bankId: '', accountName: '', accountNumber: '', currencyId: 1, glAccountId: '' });
      fetchBankAccounts();
    } catch (err) {
      toast.error(editingId ? 'Failed to update account' : 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen text-foreground relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
          <p className="text-foreground-muted mt-1">Manage internal bank accounts and GL mappings</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ bankId: '', accountName: '', accountNumber: '', currencyId: 1, glAccountId: '' });
            setShowModal(true);
          }}
          className="bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-theme flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={20} />
          <span>Add Account</span>
        </button>
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
              className="bg-card rounded-theme shadow-sm border border-border p-6 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 text-primary rounded-theme">
                  <CreditCard size={24} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-background-muted text-foreground-muted text-xs font-semibold rounded-full uppercase tracking-wide border border-border">
                    AED
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(acc.id);
                      setFormData({
                        bankId: acc.bankId,
                        accountName: acc.accountName,
                        accountNumber: acc.accountNumber,
                        currencyId: 1,
                        glAccountId: acc.glAccountId
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-theme transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-lg text-foreground">{acc.accountName}</h3>
              <p className="text-foreground-muted font-mono mt-1 text-sm">{acc.accountNumber}</p>
              
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-foreground-muted uppercase font-semibold tracking-wider mb-1">Bank</p>
                <p className="text-sm text-foreground">{acc.bank?.name || acc.bankName || 'Unknown'}</p>
                
                <p className="text-xs text-foreground-muted uppercase font-semibold tracking-wider mt-3 mb-1">GL Account</p>
                <p className="text-sm font-medium text-foreground">
                  {acc.glAccountCode && acc.glAccountDescription 
                    ? `${acc.glAccountCode} - ${acc.glAccountDescription}` 
                    : acc.glAccountId || 'Not Linked'}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-lg rounded-theme shadow-lg border border-border overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background-muted">
                <h2 className="text-lg font-semibold text-foreground">{editingId ? 'Edit Bank Account' : 'Add New Bank Account'}</h2>
                <button onClick={() => setShowModal(false)} className="text-foreground-muted hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground-muted mb-1">Bank *</label>
                    <select
                      required
                      value={formData.bankId}
                      onChange={(e) => setFormData({...formData, bankId: e.target.value})}
                      className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none text-foreground"
                    >
                      <option value="">Select Bank...</option>
                      {banks.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground-muted mb-1">Account Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.accountName}
                      onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                      className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none"
                      placeholder="e.g. Main Operating Account"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-1">Account Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                      className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none"
                      placeholder="e.g. 1234567890"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground-muted mb-1">GL Account *</label>
                    <select
                      required
                      value={formData.glAccountId}
                      onChange={(e) => setFormData({...formData, glAccountId: e.target.value})}
                      className="w-full px-4 py-2 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none text-foreground"
                    >
                      <option value="">Select GL Account...</option>
                      {glAccounts.map(gl => (
                        <option key={gl.accountId || gl.id} value={gl.accountId || gl.id}>
                          {gl.accountCode} - {gl.description || gl.accountName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-foreground-muted hover:bg-background-muted rounded-theme transition-colors font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="bg-primary hover:opacity-90 text-primary-foreground px-5 py-2 rounded-theme flex items-center gap-2 shadow-sm transition-all font-medium disabled:opacity-50">
                    <Save size={18} />
                    <span>{submitting ? 'Saving...' : 'Save Account'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
