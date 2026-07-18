import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderTree, List, Plus, Eye, Edit2, Play, Power, Trash2, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { coaApi } from '../../api/coaApi';
import { toast } from 'react-toastify';

function TreeRow({ node, handleToggleStatus, searchTerm, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(depth < 2); // default expand first two levels
  const hasChildren = node.children && node.children.length > 0;

  useEffect(() => {
    if (searchTerm) {
      setIsOpen(true);
    }
  }, [searchTerm]);

  const displayedChildren = node.children ? node.children.filter(child => {
    if (!searchTerm) return true;
    const selfMatch = child.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      child.description.toLowerCase().includes(searchTerm.toLowerCase());
    const childMatch = child.children && child.children.some(c => 
      c.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return selfMatch || childMatch;
  }) : [];

  const shouldRender = !searchTerm || 
    node.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    node.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    displayedChildren.length > 0;

  if (!shouldRender) return null;

  const isGroup = node.section === 'ACCOUNTS_GROUP';

  // Get all active dimensions as a comma-separated string
  const dimensionsStr = (node.dimensions || []).map(d => d.dimensionType).join(', ');

  return (
    <>
      <tr className={`border-b border-border/40 hover:bg-background-muted/40 transition-colors ${isGroup ? 'bg-background-muted/10 font-medium' : ''}`}>
        <td className="p-3 font-mono text-sm whitespace-nowrap">
          <div className="flex items-center" style={{ paddingLeft: `${depth * 20}px` }}>
            {hasChildren ? (
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(prev => !prev);
                }} 
                className="p-1 hover:bg-background-muted rounded mr-1 transition-colors"
              >
                {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-foreground-muted" /> : <ChevronRight className="h-3.5 w-3.5 text-foreground-muted" />}
              </button>
            ) : (
              <span className="w-6 inline-block" />
            )}
            <span className={isGroup ? 'text-primary' : 'text-foreground-muted'}>{node.accountCode}</span>
          </div>
        </td>
        <td className={`p-3 ${isGroup ? 'text-primary font-bold' : 'text-foreground'}`}>
          {node.description}
        </td>
        <td className="p-3 text-xs whitespace-nowrap">
          <span className={`inline-flex px-2 py-0.5 rounded-full font-semibold ${isGroup ? 'bg-primary/10 text-primary' : 'bg-foreground-muted/10 text-foreground-muted'}`}>
            {isGroup ? 'Accounts Group' : node.section}
          </span>
        </td>
        <td className="p-3 text-xs uppercase text-foreground-muted whitespace-nowrap">
          {isGroup ? 'Dr/Cr' : (node.accountType === 'DEBIT' ? 'Dr' : 'Cr')}
        </td>
        <td className="p-3 text-center">
          {node.isActive && <Check className="h-4 w-4 text-success mx-auto" />}
        </td>
        <td className="p-3 text-xs uppercase font-mono text-foreground-muted/80">{node.currency || 'AED'}</td>
        <td className="p-3 text-center">
          {node.isQuantitative && <Check className="h-4 w-4 text-success mx-auto" />}
        </td>
        <td className="p-3 text-center">
          {node.isOffBalance && <Check className="h-4 w-4 text-warning mx-auto" />}
        </td>
        <td className="p-3 text-xs text-foreground-muted/95 whitespace-nowrap">{dimensionsStr || '—'}</td>
        <td className="p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Link to={`/account-dashboard/chart-of-accounts/${node.accountId}`} className="p-1 text-foreground-muted hover:text-primary hover:bg-background-muted rounded transition-all">
              <Eye className="h-4 w-4" />
            </Link>
            <Link to={`/account-dashboard/chart-of-accounts/edit/${node.accountId}`} className="p-1 text-foreground-muted hover:text-primary hover:bg-background-muted rounded transition-all">
              <Edit2 className="h-4 w-4" />
            </Link>
            <button onClick={() => handleToggleStatus(node.accountId, node.isActive)} className="p-1 text-foreground-muted hover:text-primary hover:bg-background-muted rounded transition-all" title={node.isActive ? 'Deactivate' : 'Activate'}>
              <Power className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {hasChildren && isOpen && displayedChildren.map(child => (
        <TreeRow
          key={child.accountId || child.accountCode}
          node={child}
          handleToggleStatus={handleToggleStatus}
          searchTerm={searchTerm}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

export default function CoaListPage() {
  const navigate = useNavigate();
  const { accounts, loading, refresh } = useAccounting();
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [treeData, setTreeData] = useState([]);
  const [treeLoading, setTreeLoading] = useState(false);

  useEffect(() => {
    if (viewMode === 'tree') {
      fetchTree();
    }
  }, [viewMode]);

  const fetchTree = async () => {
    setTreeLoading(true);
    try {
      const res = await coaApi.getTree();
      setTreeData(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching tree data', err);
      toast.error('Failed to load COA Tree');
    } finally {
      setTreeLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await coaApi.deactivate(id);
        toast.success('Account deactivated successfully!');
      } else {
        await coaApi.activate(id);
        toast.success('Account activated successfully!');
      }
      refresh();
      if (viewMode === 'tree') fetchTree();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await coaApi.delete(id);
      toast.success('Account deleted successfully!');
      refresh();
      if (viewMode === 'tree') fetchTree();
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  // Filter accounts for the flat list view
  const filteredList = accounts.filter(acc =>
    acc.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.parentGroup && acc.parentGroup.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <span className="text-foreground-muted font-medium">Chart of Accounts</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="border border-border rounded-theme p-0.5 flex bg-card">
            <button
              onClick={() => setViewMode('tree')}
              className={`p-1.5 rounded-theme transition-all ${viewMode === 'tree' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'}`}
              title="Tree View"
            >
              <FolderTree className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-theme transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Link
            id="btn-new-account"
            to="/account-dashboard/chart-of-accounts/new"
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-all px-4 py-2 rounded-theme text-sm font-semibold shadow"
          >
            <Plus className="h-4 w-4" />
            New Account
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 bg-card border border-border p-3 rounded-theme flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search by code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-theme text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-theme shadow-sm">
        {loading || (viewMode === 'tree' && treeLoading) ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === 'tree' ? (
          /* TREE TABLE VIEW (Matches user screenshot 2) */
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-background-muted text-foreground-muted border-b border-border text-xs uppercase font-semibold">
                  <th className="p-3 w-48">Code</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Section</th>
                  <th className="p-3 w-20">Type</th>
                  <th className="p-3 w-16 text-center">Active</th>
                  <th className="p-3 w-20">Cur</th>
                  <th className="p-3 w-16 text-center">Qty</th>
                  <th className="p-3 w-16 text-center">Off-Bal</th>
                  <th className="p-3">Dimensions</th>
                  <th className="p-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {treeData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-12 text-center text-foreground-muted">No accounts found matching search.</td>
                  </tr>
                ) : (
                  treeData.map((node) => (
                    <TreeRow
                      key={node.accountId || node.parentGroup}
                      node={node}
                      handleToggleStatus={handleToggleStatus}
                      searchTerm={searchTerm}
                      depth={0}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* FLAT LIST VIEW */
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-background-muted text-foreground-muted border-b border-border text-xs uppercase font-semibold">
                  <th className="p-3">Code</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Section</th>
                  <th className="p-3">Parent Group</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-foreground-muted">No accounts found</td>
                  </tr>
                ) : (
                  filteredList.map((acc, index) => (
                    <motion.tr
                      key={acc.accountId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.15 }}
                      className="hover:bg-background-muted/40 transition-colors"
                    >
                      <td className="p-3 font-mono text-sm font-semibold">{acc.accountCode}</td>
                      <td className="p-3 font-semibold">{acc.description}</td>
                      <td className="p-3 text-xs uppercase text-foreground-muted">{acc.accountType}</td>
                      <td className="p-3 text-xs uppercase text-foreground-muted">{acc.section}</td>
                      <td className="p-3 text-xs text-foreground-muted">{acc.parentGroup || '—'}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${acc.isActive ? 'bg-success/15 text-success' : 'bg-foreground-muted/15 text-foreground-muted'}`}>
                          {acc.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link to={`/account-dashboard/chart-of-accounts/${acc.accountId}`} className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background-muted rounded transition-all">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link to={`/account-dashboard/chart-of-accounts/edit/${acc.accountId}`} className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background-muted rounded transition-all">
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button onClick={() => handleToggleStatus(acc.accountId, acc.isActive)} className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background-muted rounded transition-all" title={acc.isActive ? 'Deactivate' : 'Activate'}>
                            <Power className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(acc.accountId)} className="p-1.5 text-foreground-muted hover:text-error hover:bg-background-muted rounded transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
