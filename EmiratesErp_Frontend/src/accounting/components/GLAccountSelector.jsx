import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

export default function GLAccountSelector({ value, onChange, placeholder = 'Select GL Account...' }) {
  const { accounts } = useAccounting();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const selected = accounts.find(a => a.accountId === value);

  const filtered = accounts.filter(a =>
    a.isActive &&
    (a.accountCode.toLowerCase().includes(search.toLowerCase()) ||
     a.description.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id="gl-account-selector-btn"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-card border border-border rounded-theme text-sm text-foreground hover:border-primary transition-colors"
      >
        <span className={selected ? 'text-foreground' : 'text-foreground-muted'}>
          {selected ? `[${selected.accountCode}] ${selected.description}` : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-foreground-muted" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-theme shadow-xl max-h-56 flex flex-col">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-muted" />
              <input
                autoFocus
                type="text"
                placeholder="Search by code or name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded-md text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <ul className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-sm text-center text-foreground-muted">No accounts found</li>
            ) : filtered.map(acc => (
              <li key={acc.accountId}
                onClick={() => { onChange(acc.accountId); setOpen(false); setSearch(''); }}
                className="px-3 py-2.5 text-sm cursor-pointer hover:bg-background-muted text-foreground flex gap-2"
              >
                <span className="font-mono text-xs text-foreground-muted w-16 flex-shrink-0 mt-0.5">{acc.accountCode}</span>
                <span>{acc.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
