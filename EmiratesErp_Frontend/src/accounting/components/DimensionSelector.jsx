import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function DimensionSelector({ value, onChange, endpoint, type, placeholder = 'Select...', disabled = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        let urls = Array.isArray(endpoint) ? endpoint : [{ url: endpoint, group: null }];
        
        const responses = await Promise.all(urls.map(item => {
          const urlStr = typeof item === 'string' ? item : item.url;
          const groupName = typeof item === 'string' ? null : item.group;
          return axios.get(`${API_URL}${urlStr}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }).then(res => ({ res, group: groupName })).catch(err => {
            console.error(`Failed to fetch ${urlStr}`, err);
            return { res: { data: [] }, group: groupName }; 
          });
        }));

        let combinedData = [];
        responses.forEach(({ res, group }) => {
          let data = res.data?.data || res.data?.content || res.data || [];
          if (data.content) data = data.content; 
          if (Array.isArray(data)) {
            const groupedData = data.map(d => ({ ...d, _group: group }));
            combinedData = [...combinedData, ...groupedData];
          }
        });
        
        console.log("DimensionSelector fetched data for", type, "combinedData length:", combinedData.length, "Sample:", combinedData[0]);

        const mapped = combinedData.filter(item => item != null).map(item => {
          let id, label;
          if (type === 'party') {
            id = item.partyId || item.id;
            label = item.companyName || item.partyName || item.primaryContactPersonFull || item.name;
          } else if (type === 'item') {
            id = item.itemId || item.id;
            label = item.name || item.itemName || item.itemCode;
            if (item.itemCode && item.name && label === item.name) {
               label = `${item.name} (${item.itemCode})`; // better UX
            }
          } else if (type === 'employee') {
            id = item.employeeId || item.id;
            label = item.employeeName || `${item.firstName || ''} ${item.lastName || ''}`.trim();
          } else if (type === 'bank') {
            id = item.bankAccountId || item.id;
            label = item.bankName ? `${item.bankName} - ${item.accountNumber}` : item.accountNumber || item.name;
          } else if (type === 'asset') {
            id = item.fixedAssetId || item.id;
            label = item.assetName || item.name;
          } else {
            id = item.id;
            label = item.name;
          }
          
          if (!label) label = `Unknown (ID: ${id})`; // fallback so it's always visible
          
          return { id, label, raw: item, group: item._group };
        });
        
        setOptions(mapped);
      } catch (err) {
        console.error(`Failed to fetch options for ${type}`, err);
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch only when opened the first time
    if (open && options.length === 0) {
      fetchOptions();
    }
  }, [open, endpoint, type, options.length]);

  const selected = options.find(o => o.id === parseInt(value) || o.id === value);

  const filtered = options.filter(o =>
    o.label && o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative min-w-[150px]" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-2 py-1 bg-background border border-border rounded text-xs text-foreground hover:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className={selected ? 'text-foreground truncate' : 'text-foreground-muted truncate'}>
          {selected ? selected.label : (value ? `ID: ${value}` : placeholder)}
        </span>
        <ChevronDown className="h-3 w-3 text-foreground-muted ml-1 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 w-64 mt-1 bg-card border border-border rounded-theme shadow-xl max-h-56 flex flex-col -ml-10">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-foreground-muted" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs bg-background border border-border rounded-md text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <ul className="overflow-y-auto flex-1">
            {loading ? (
              <li className="px-3 py-4 text-xs text-center text-foreground-muted">Loading...</li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-4 text-xs text-center text-foreground-muted">No options found</li>
            ) : (
              (() => {
                const grouped = filtered.reduce((acc, opt) => {
                  const g = opt.group || 'Other';
                  if (!acc[g]) acc[g] = [];
                  acc[g].push(opt);
                  return acc;
                }, {});

                return Object.entries(grouped).map(([groupName, items]) => (
                  <React.Fragment key={groupName}>
                    {groupName !== 'Other' && (
                      <li className="px-3 py-1.5 text-[10px] font-bold text-foreground-muted uppercase tracking-wider bg-background-muted sticky top-0 z-10">
                        {groupName}
                      </li>
                    )}
                    {items.map(opt => (
                      <li key={opt.id}
                        onClick={() => { onChange(opt.id); setOpen(false); setSearch(''); }}
                        className="px-3 py-2 text-xs cursor-pointer hover:bg-background-muted text-foreground"
                      >
                        {opt.label}
                      </li>
                    ))}
                  </React.Fragment>
                ));
              })()
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
