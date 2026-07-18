import React, { useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import GLAccountSelector from './GLAccountSelector';
import DimensionSelector from './DimensionSelector';

const ITEM_ENDPOINTS = [
  { url: "/crm/products?size=1000", group: "Product" },
  { url: "/crm/sales-products?size=1000", group: "Product" },
  { url: "/production/raw-materials?size=1000", group: "Raw Material" },
  { url: "/production/finished-goods?size=1000", group: "Finished Good" },
  { url: "/production/semi-finished?size=1000", group: "Semi Finished" }
];

const PARTY_ENDPOINTS = [
  { url: "/parties?type=CUSTOMER&size=1000", group: "Customer" },
  { url: "/parties?type=SUPPLIER&size=1000", group: "Supplier" }
];

export default function JournalLineTable({ lines = [], onChange, readOnly = false }) {
  const [expandedDimensions, setExpandedDimensions] = useState({});

  const toggleDimensions = (index) => {
    setExpandedDimensions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    
    if (field === 'debitAmount') {
      updated[index][field] = value;
      if (parseFloat(value) > 0) {
        updated[index]['creditAmount'] = '';
      }
    } else if (field === 'creditAmount') {
      updated[index][field] = value;
      if (parseFloat(value) > 0) {
        updated[index]['debitAmount'] = '';
      }
    } else {
      updated[index][field] = value;
    }
    
    onChange(updated);
  };

  const addLine = () => {
    onChange([
      ...lines,
      {
        lineNumber: lines.length + 1,
        accountId: '',
        debitAmount: '',
        creditAmount: '',
        description: '',
        dimCompanyId: '',
        dimItemId: '',
        dimEmployeeId: '',
        dimBankAccountId: '',
        dimFixedAssetId: ''
      }
    ]);
  };

  const removeLine = (index) => {
    if (lines.length <= 2) return;
    const filtered = lines.filter((_, idx) => idx !== index).map((l, idx) => ({
      ...l,
      lineNumber: idx + 1
    }));
    onChange(filtered);
  };

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debitAmount) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.creditAmount) || 0), 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff < 0.001;

  return (
    <div className="w-full overflow-x-auto border border-border rounded-theme bg-card text-foreground">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-background-muted text-foreground-muted border-b border-border text-xs uppercase font-semibold">
            <th className="p-3 w-12 text-center">#</th>
            <th className="p-3 min-w-[250px]">GL Account</th>
            <th className="p-3 w-40">Debit</th>
            <th className="p-3 w-40">Credit</th>
            <th className="p-3">Line Description</th>
            {!readOnly && <th className="p-3 w-16 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {lines.map((line, index) => (
            <React.Fragment key={index}>
              <tr className="hover:bg-background-muted/40 transition-colors">
              <td className="p-3 text-center text-foreground-muted font-mono">{line.lineNumber}</td>
              <td className="p-3">
                {readOnly ? (
                  <div className="py-2 px-3 bg-background-muted/50 rounded-theme border border-border/30 text-sm">
                    {line.accountCode ? `[${line.accountCode}] ${line.accountDescription}` : '—'}
                  </div>
                ) : (
                  <GLAccountSelector
                    value={line.accountId}
                    onChange={(val) => handleLineChange(index, 'accountId', val)}
                  />
                )}
              </td>
              <td className="p-3">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={readOnly}
                  value={line.debitAmount || ''}
                  onChange={(e) => handleLineChange(index, 'debitAmount', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-foreground focus:outline-none focus:border-primary text-right disabled:opacity-60"
                />
              </td>
              <td className="p-3">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={readOnly}
                  value={line.creditAmount || ''}
                  onChange={(e) => handleLineChange(index, 'creditAmount', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-foreground focus:outline-none focus:border-primary text-right disabled:opacity-60"
                />
              </td>
              <td className="p-3">
                <input
                  type="text"
                  disabled={readOnly}
                  value={line.description || ''}
                  onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                  placeholder="Line description..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-foreground focus:outline-none focus:border-primary disabled:opacity-60"
                />
              </td>
              {!readOnly && (
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleDimensions(index)}
                      className={`p-1.5 rounded transition-colors ${expandedDimensions[index] || line.dimCompanyId || line.dimItemId || line.dimEmployeeId || line.dimBankAccountId || line.dimFixedAssetId ? 'text-primary bg-primary/10' : 'text-foreground-muted hover:bg-background-muted'}`}
                      title="Tag Dimensions"
                    >
                      <Tag className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={lines.length <= 2}
                      onClick={() => removeLine(index)}
                      className="p-1.5 text-foreground-muted hover:text-error rounded hover:bg-background-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
            {expandedDimensions[index] && (
              <tr key={`dim-${index}`} className="bg-background-muted/20">
                <td colSpan={readOnly ? 5 : 6} className="p-3 border-b border-border">
                  <div className="flex flex-wrap gap-4 items-center bg-background p-3 rounded-theme border border-border/50 shadow-sm text-xs">
                    <span className="font-semibold text-foreground-muted uppercase tracking-wider w-full md:w-auto">Dimensions:</span>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-foreground-muted whitespace-nowrap">Company</label>
                      <DimensionSelector
                        type="party"
                        endpoint={PARTY_ENDPOINTS}
                        value={line.dimCompanyId || ''}
                        onChange={(val) => handleLineChange(index, 'dimCompanyId', val)}
                        disabled={readOnly}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-foreground-muted whitespace-nowrap">Item</label>
                      <DimensionSelector
                        type="item"
                        endpoint={ITEM_ENDPOINTS}
                        value={line.dimItemId || ''}
                        onChange={(val) => handleLineChange(index, 'dimItemId', val)}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-foreground-muted whitespace-nowrap">Employee</label>
                      <DimensionSelector
                        type="employee"
                        endpoint="/employees/all"
                        value={line.dimEmployeeId || ''}
                        onChange={(val) => handleLineChange(index, 'dimEmployeeId', val)}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-foreground-muted whitespace-nowrap">Bank Acct</label>
                      <DimensionSelector
                        type="bank"
                        endpoint="/company-bank-accounts"
                        value={line.dimBankAccountId || ''}
                        onChange={(val) => handleLineChange(index, 'dimBankAccountId', val)}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-foreground-muted whitespace-nowrap">Asset</label>
                      <DimensionSelector
                        type="asset"
                        endpoint="/fixed-assets?size=1000"
                        value={line.dimFixedAssetId || ''}
                        onChange={(val) => handleLineChange(index, 'dimFixedAssetId', val)}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-background-muted border-t border-border font-bold">
            <td colSpan="2" className="p-3 text-right text-foreground-muted uppercase tracking-wider text-xs">Totals</td>
            <td className="p-3 text-right font-mono">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-3 text-right font-mono">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td colSpan={readOnly ? 1 : 2} className="p-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${isBalanced ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                {isBalanced ? '● Balanced' : `● Unbalanced (Diff: ${diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>

      {!readOnly && (
        <div className="p-3 bg-background-muted/20 border-t border-border flex justify-start">
          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-theme hover:bg-primary/5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Line
          </button>
        </div>
      )}
    </div>
  );
}
