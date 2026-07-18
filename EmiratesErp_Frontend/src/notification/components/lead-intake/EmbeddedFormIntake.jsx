import React, { useState } from 'react';
import { Code, Terminal, Copy, CheckCircle, Info } from 'lucide-react';
import { toast } from 'react-toastify';

const EmbeddedFormIntake = ({ apiKey, publicBaseUrl }) => {
    const [copied, setCopied] = useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
        toast.info("Copied to clipboard");
    };

    const snippet = `<script 
  src="${publicBaseUrl}/widget.js" 
  data-key="${apiKey}"
  async>
</script>`;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-emerald-500/10 rounded-theme text-emerald-600">
                    <Code size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-foreground">Embedded Form Widget</h3>
                    <p className="text-sm text-foreground-muted">The fastest way to add a lead capture form to any website.</p>
                </div>
            </div>

            <div className="bg-card rounded-theme border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-theme mb-6">
                    <Info size={20} className="text-emerald-600" />
                    <p className="text-xs text-emerald-700 leading-relaxed">
                        Simply copy the code below and paste it just before the closing <code>&lt;/body&gt;</code> tag of your website.
                    </p>
                </div>

                <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Terminal size={14} className="text-primary" /> HTML Snippet
                </h4>
                
                <div className="bg-slate-900 rounded-theme overflow-hidden border border-slate-800 shadow-xl group relative">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Script Tag</span>
                        <button onClick={() => copyToClipboard(snippet, 'script')} className="text-slate-400 hover:text-white transition-colors">
                            {copied === 'script' ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                    </div>
                    <pre className="p-6 text-sm font-mono text-emerald-400 overflow-x-auto">
                        <code>{snippet}</code>
                    </pre>
                </div>

                <div className="mt-8 p-6 bg-background-muted rounded-theme border border-border text-center">
                    <h5 className="text-sm font-bold text-foreground mb-2">Want to customize colors?</h5>
                    <p className="text-xs text-foreground-muted mb-4">You can pass additional data attributes to match your brand colors.</p>
                    <div className="inline-flex gap-4">
                        <span className="text-[10px] bg-background px-2 py-1 rounded border border-border font-mono">data-color="#primary"</span>
                        <span className="text-[10px] bg-background px-2 py-1 rounded border border-border font-mono">data-font="Inter"</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmbeddedFormIntake;
