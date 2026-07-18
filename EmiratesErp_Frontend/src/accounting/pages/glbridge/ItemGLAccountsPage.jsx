import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, Save, Tags } from 'lucide-react';
import { itemGlApi } from '../../api/itemGlApi';
import { useAccounting } from '../../context/AccountingContext';
import GLAccountSelector from '../../components/GLAccountSelector';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function ItemGLAccountsPage() {
  const { accounts, loading: accountsLoading } = useAccounting();
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [allItems, setAllItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemSearchInput, setItemSearchInput] = useState('');

  // Drawer / Form state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    itemId: '',
    glAccountId: null,
    goodsOnConsignmentAccountId: null,
    salesRevenueAccountId: null,
    tradeDiscountsAccountId: null,
    costOfGoodsSoldAccountId: null,
    deferredExpensesAccountId: null,
    outputVatAccountId: null,
    inputVatAccountId: null,
  });

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const res = await itemGlApi.getAll();
      setMappings(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching item GL mappings', err);
      toast.error('Failed to load Item GL mappings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  useEffect(() => {
    if (drawerOpen && allItems.length === 0) {
      const fetchItems = async () => {
        setLoadingItems(true);
        try {
          const token = localStorage.getItem('token');
          const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
          const baseURL = API_URL.endsWith('/api') ? API_URL.replace('/api', '') : API_URL;
          const headers = { Authorization: `Bearer ${token}` };
          
          const [prodRes, rmRes, sfRes, fgRes] = await Promise.all([
             axios.get(`${baseURL}/api/crm/sales-products?size=1000`, { headers }),
             axios.get(`${baseURL}/api/production/raw-materials?size=1000`, { headers }).catch(() => ({ data: [] })),
             axios.get(`${baseURL}/api/production/semi-finished?size=1000`, { headers }).catch(() => ({ data: [] })),
             axios.get(`${baseURL}/api/production/finished-goods?size=1000`, { headers }).catch(() => ({ data: [] })),
          ]);

          const getList = (res) => Array.isArray(res.data) ? res.data : (res.data?.content || []);
          
          const products = getList(prodRes).map(p => ({ ...p, type: 'PRODUCT', uniqueId: `PRODUCT-${p.id}`, label: `${p.name} (${p.itemCode}) - Product` }));
          const rawMaterials = getList(rmRes).map(r => ({ ...r, type: 'RAW_MATERIAL', uniqueId: `RM-${r.id}`, label: `${r.name} (${r.itemCode}) - Raw Material` }));
          const semiFinished = getList(sfRes).map(s => ({ ...s, type: 'SEMI_FINISHED', uniqueId: `SF-${s.id}`, label: `${s.name} (${s.itemCode}) - Semi-Finished` }));
          const finishedGoods = getList(fgRes).map(f => ({ ...f, type: 'FINISHED_GOOD', uniqueId: `FG-${f.id}`, label: `${f.name} (${f.itemCode}) - Finished Good` }));

          setAllItems([...products, ...rawMaterials, ...semiFinished, ...finishedGoods]);
        } catch (err) {
          console.error('Error fetching items', err);
        } finally {
          setLoadingItems(false);
        }
      };
      fetchItems();
    }
  }, [drawerOpen]);

  useEffect(() => {
    if (isEdit && formData.itemId && allItems.length > 0) {
      const found = allItems.find(i => String(i.id) === String(formData.itemId));
      if (found) {
        setItemSearchInput(found.label);
      } else {
        setItemSearchInput(`Item ID: ${formData.itemId}`);
      }
    }
  }, [isEdit, formData.itemId, allItems]);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setItemSearchInput('');
    setFormData({
      id: null,
      itemId: '',
      glAccountId: null,
      goodsOnConsignmentAccountId: null,
      salesRevenueAccountId: null,
      tradeDiscountsAccountId: null,
      costOfGoodsSoldAccountId: null,
      deferredExpensesAccountId: null,
      outputVatAccountId: null,
      inputVatAccountId: null,
    });
    setDrawerOpen(true);
  };

  const handleOpenEdit = (mapping) => {
    setIsEdit(true);
    setItemSearchInput(mapping.itemId ? `Item ID: ${mapping.itemId}` : '');
    setFormData({
      id: mapping.id,
      itemId: mapping.itemId || '',
      glAccountId: mapping.glAccountId || null,
      goodsOnConsignmentAccountId: mapping.goodsOnConsignmentAccountId || null,
      salesRevenueAccountId: mapping.salesRevenueAccountId || null,
      tradeDiscountsAccountId: mapping.tradeDiscountsAccountId || null,
      costOfGoodsSoldAccountId: mapping.costOfGoodsSoldAccountId || null,
      deferredExpensesAccountId: mapping.deferredExpensesAccountId || null,
      outputVatAccountId: mapping.outputVatAccountId || null,
      inputVatAccountId: mapping.inputVatAccountId || null,
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mapping?')) return;
    try {
      await itemGlApi.delete(id);
      toast.success('Mapping deleted successfully!');
      fetchMappings();
    } catch (err) {
      toast.error('Failed to delete mapping');
    }
  };

  const handleAccountChange = (field, accountId) => {
    setFormData(prev => ({ ...prev, [field]: accountId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemId) {
      toast.error('Item ID is required. Please select an item from the list.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        itemId: parseInt(formData.itemId),
        glAccountId: formData.glAccountId,
        goodsOnConsignmentAccountId: formData.goodsOnConsignmentAccountId,
        salesRevenueAccountId: formData.salesRevenueAccountId,
        tradeDiscountsAccountId: formData.tradeDiscountsAccountId,
        costOfGoodsSoldAccountId: formData.costOfGoodsSoldAccountId,
        deferredExpensesAccountId: formData.deferredExpensesAccountId,
        outputVatAccountId: formData.outputVatAccountId,
        inputVatAccountId: formData.inputVatAccountId,
      };
      
      await itemGlApi.save(payload);
      toast.success(isEdit ? 'Item GL mapping updated!' : 'Item GL mapping created!');
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

  const getAccountDescription = (accountId) => {
    const acc = accounts.find(a => a.accountId === accountId);
    return acc ? acc.description : '—';
  };

  const filteredMappings = mappings.filter(m => 
    String(m.itemId).includes(searchTerm) ||
    (m.glAccountCode && m.glAccountCode.includes(searchTerm)) ||
    (m.salesRevenueAccountCode && m.salesRevenueAccountCode.includes(searchTerm)) ||
    (m.costOfGoodsSoldAccountCode && m.costOfGoodsSoldAccountCode.includes(searchTerm))
  );

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
            <span className="text-foreground-muted font-medium">Item GL Accounts</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Item GL Accounts Mapping</h1>
        </div>

        <div>
          <button
            id="btn-new-item-gl"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-all px-4 py-2 rounded-theme text-sm font-semibold shadow"
          >
            <Plus className="h-4 w-4" />
            New Item Mapping
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 bg-card border border-border p-3 rounded-theme flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            id="item-gl-search"
            placeholder="Search by Item ID or Account Code..."
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
                  <th className="p-3">Item ID</th>
                  <th className="p-3">Inventory / Purchase A/C</th>
                  <th className="p-3">Sales Revenue A/C</th>
                  <th className="p-3">COGS A/C</th>
                  <th className="p-3">Input VAT A/C</th>
                  <th className="p-3">Output VAT A/C</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-foreground-muted">
                      No mapping configurations found.
                    </td>
                  </tr>
                ) : (
                  filteredMappings.map(mapping => (
                    <tr key={mapping.id} className="border-b border-border/40 hover:bg-background-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-primary">{mapping.itemId}</td>
                      <td className="p-3">
                        {mapping.glAccountId ? (
                          <div>
                            <span className="font-mono text-xs text-foreground-muted mr-2">[{mapping.glAccountCode || getAccountCode(mapping.glAccountId)}]</span>
                            <span>{getAccountDescription(mapping.glAccountId)}</span>
                          </div>
                        ) : <span className="text-foreground-muted">—</span>}
                      </td>
                      <td className="p-3">
                        {mapping.salesRevenueAccountId ? (
                          <div>
                            <span className="font-mono text-xs text-foreground-muted mr-2">[{mapping.salesRevenueAccountCode || getAccountCode(mapping.salesRevenueAccountId)}]</span>
                            <span>{getAccountDescription(mapping.salesRevenueAccountId)}</span>
                          </div>
                        ) : <span className="text-foreground-muted">—</span>}
                      </td>
                      <td className="p-3">
                        {mapping.costOfGoodsSoldAccountId ? (
                          <div>
                            <span className="font-mono text-xs text-foreground-muted mr-2">[{mapping.costOfGoodsSoldAccountCode || getAccountCode(mapping.costOfGoodsSoldAccountId)}]</span>
                            <span>{getAccountDescription(mapping.costOfGoodsSoldAccountId)}</span>
                          </div>
                        ) : <span className="text-foreground-muted">—</span>}
                      </td>
                      <td className="p-3">
                        {mapping.inputVatAccountId ? (
                          <div>
                            <span className="font-mono text-xs text-foreground-muted mr-2">[{mapping.inputVatAccountCode || getAccountCode(mapping.inputVatAccountId)}]</span>
                            <span>{getAccountDescription(mapping.inputVatAccountId)}</span>
                          </div>
                        ) : <span className="text-foreground-muted">—</span>}
                      </td>
                      <td className="p-3">
                        {mapping.outputVatAccountId ? (
                          <div>
                            <span className="font-mono text-xs text-foreground-muted mr-2">[{mapping.outputVatAccountCode || getAccountCode(mapping.outputVatAccountId)}]</span>
                            <span>{getAccountDescription(mapping.outputVatAccountId)}</span>
                          </div>
                        ) : <span className="text-foreground-muted">—</span>}
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
              className="relative w-full max-w-lg h-full bg-card border-l border-border shadow-2xl flex flex-col z-10"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Tags className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">
                    {isEdit ? `Edit Mapping for Item #${formData.itemId}` : 'Create Item GL Mapping'}
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
                {/* Item ID */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Item ID *</label>
                  <div className="relative group w-full">
                    <input
                      type="text"
                      required={!formData.itemId}
                      disabled={isEdit || submitting || loadingItems}
                      value={itemSearchInput}
                      onChange={(e) => {
                        setItemSearchInput(e.target.value);
                        setFormData(prev => ({ ...prev, itemId: '' })); // clear id when they type
                      }}
                      placeholder={loadingItems ? 'Loading items...' : 'Search Item (Name or Code)...'}
                      className="w-full px-3 py-2 bg-background border border-border rounded-theme text-foreground focus:outline-none focus:border-primary disabled:opacity-60"
                      autoComplete="off"
                    />
                    {!isEdit && (
                      <div className="absolute z-50 w-full bg-card border border-border rounded-md mt-1 shadow-lg hidden group-focus-within:block max-h-60 overflow-y-auto">
                        {allItems
                          .filter(i => (i.label || '').toLowerCase().includes((itemSearchInput || '').toLowerCase()))
                          .map(itm => (
                            <div
                              key={itm.uniqueId}
                              className="px-3 py-2 text-sm hover:bg-background-muted cursor-pointer border-b border-border/50 flex justify-between items-center text-foreground"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setItemSearchInput(itm.label);
                                setFormData(prev => ({ ...prev, itemId: itm.id }));
                              }}
                            >
                              <span>{itm.name} <span className="text-foreground-muted text-xs">({itm.itemCode})</span></span>
                              <span className="text-[10px] text-foreground-muted bg-background-muted px-2 py-0.5 rounded-full">{itm.type.replace('_', ' ')}</span>
                            </div>
                          ))}
                        {allItems.filter(i => (i.label || '').toLowerCase().includes((itemSearchInput || '').toLowerCase())).length === 0 && (
                          <div className="px-3 py-2 text-sm text-foreground-muted text-center">No items found</div>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.itemId && <div className="text-xs text-primary mt-1 font-medium">Selected Item ID: {formData.itemId}</div>}
                </div>

                {/* Inventory / Purchases Account */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Inventory / Purchases Account</label>
                  <GLAccountSelector
                    value={formData.glAccountId}
                    onChange={(val) => handleAccountChange('glAccountId', val)}
                    placeholder="Select Inventory GL Account..."
                  />
                </div>

                {/* Sales Revenue Account */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Sales Revenue Account</label>
                  <GLAccountSelector
                    value={formData.salesRevenueAccountId}
                    onChange={(val) => handleAccountChange('salesRevenueAccountId', val)}
                    placeholder="Select Sales Revenue GL Account..."
                  />
                </div>

                {/* Cost of Goods Sold Account */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Cost of Goods Sold Account</label>
                  <GLAccountSelector
                    value={formData.costOfGoodsSoldAccountId}
                    onChange={(val) => handleAccountChange('costOfGoodsSoldAccountId', val)}
                    placeholder="Select COGS GL Account..."
                  />
                </div>

                {/* Input VAT Account */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Input VAT Account (Purchases)</label>
                  <GLAccountSelector
                    value={formData.inputVatAccountId}
                    onChange={(val) => handleAccountChange('inputVatAccountId', val)}
                    placeholder="Select Input VAT GL Account..."
                  />
                </div>

                {/* Output VAT Account */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Output VAT Account (Sales)</label>
                  <GLAccountSelector
                    value={formData.outputVatAccountId}
                    onChange={(val) => handleAccountChange('outputVatAccountId', val)}
                    placeholder="Select Output VAT GL Account..."
                  />
                </div>

                {/* Trade Discounts Account */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Trade Discounts Account</label>
                  <GLAccountSelector
                    value={formData.tradeDiscountsAccountId}
                    onChange={(val) => handleAccountChange('tradeDiscountsAccountId', val)}
                    placeholder="Select Trade Discounts GL Account..."
                  />
                </div>

                {/* Deferred Expenses Account */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Deferred Expenses Account</label>
                  <GLAccountSelector
                    value={formData.deferredExpensesAccountId}
                    onChange={(val) => handleAccountChange('deferredExpensesAccountId', val)}
                    placeholder="Select Deferred Expenses GL Account..."
                  />
                </div>

                {/* Goods on Consignment Account */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Goods on Consignment Account</label>
                  <GLAccountSelector
                    value={formData.goodsOnConsignmentAccountId}
                    onChange={(val) => handleAccountChange('goodsOnConsignmentAccountId', val)}
                    placeholder="Select Goods on Consignment GL Account..."
                  />
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
