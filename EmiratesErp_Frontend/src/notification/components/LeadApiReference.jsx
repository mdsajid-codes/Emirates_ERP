import React, { useState } from 'react';
import { Terminal, CheckCircle, Copy } from 'lucide-react';
import { toast } from 'react-toastify';

const LeadApiReference = () => {
    const [copied, setCopied] = useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
        toast.info("Copied to clipboard");
    };

    const leadFields = [
        { field: 'firstName', type: 'string', req: 'Yes', desc: 'Leads first name' },
        { field: 'lastName', type: 'string', req: 'Yes', desc: 'Leads last name' },
        { field: 'email', type: 'string', req: 'Yes', desc: 'Valid email address' },
        { field: 'phone', type: 'string', req: 'No', desc: 'Contact number' },
        { field: 'company', type: 'string', req: 'No', desc: 'Company name (auto-creates if new)' },
        { field: 'source', type: 'string', req: 'No', desc: 'E.g. "Website", "Landing Page"' },
        { field: 'campaign', type: 'string', req: 'No', desc: 'Marketing campaign name' },
        { field: 'requirements', type: 'string', req: 'No', desc: 'What the lead is looking for' },
        { field: 'notes', type: 'string', req: 'No', desc: 'Internal notes or extra info' },
        { field: 'metadata', type: 'object', req: 'No', desc: 'JSON object for any custom fields' },
    ];

    return (
        <div className="bg-card rounded-theme border border-border overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-border bg-background-muted">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Terminal size={20} className="text-primary" /> API Payload Reference
                </h3>
                <p className="text-xs text-foreground-muted mt-1">Use these fields when sending JSON data to the intake endpoint.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-background text-[10px] font-black uppercase tracking-widest text-foreground-muted">
                        <tr>
                            <th className="px-6 py-4">Field</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Required</th>
                            <th className="px-6 py-4">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {leadFields.map((row, i) => (
                            <tr key={i} className="hover:bg-background/50 transition-colors group">
                                <td className="px-6 py-4 font-mono font-bold text-primary flex items-center gap-2">
                                    {row.field}
                                    <button 
                                        onClick={() => copyToClipboard(row.field, i)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded transition-all"
                                    >
                                        {copied === i ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} className="text-foreground-muted" />}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 bg-background border border-border rounded text-[10px] font-bold">
                                        {row.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {row.req === 'Yes' ? 
                                        <span className="text-rose-500 font-bold text-xs">REQUIRED</span> : 
                                        <span className="text-foreground-muted text-xs">Optional</span>
                                    }
                                </td>
                                <td className="px-6 py-4 text-foreground-muted">{row.desc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-6 bg-background-muted border-t border-border">
                <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Example JSON Payload</h4>
                <div className="bg-slate-900 rounded-theme p-4 font-mono text-xs text-slate-300 overflow-x-auto">
                    <pre>{JSON.stringify({
                        firstName: "Sajid",
                        lastName: "Ali",
                        email: "sajid@example.com",
                        phone: "+91 9876543210",
                        company: "Star Enterprises",
                        source: "Direct API",
                        requirements: "Custom development"
                    }, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};

export default LeadApiReference;
