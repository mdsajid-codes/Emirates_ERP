import React, { useState } from 'react';
import { 
    Globe, 
    Terminal, 
    Copy, 
    CheckCircle, 
    Code, 
    Play, 
    ShieldCheck, 
    Zap,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';

const WebsiteIntake = ({ apiKey, publicBaseUrl }) => {
    const [copied, setCopied] = useState(null);
    const [activeSnippet, setActiveSnippet] = useState('js');

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
        toast.info("Copied to clipboard");
    };

    const snippets = {
        js: `fetch('${publicBaseUrl}/intake', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': '${apiKey}'
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    source: 'Website Form'
  })
})
.then(res => res.json())
.then(data => console.log('Success:', data));`,
        curl: `curl -X POST ${publicBaseUrl}/intake \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: ${apiKey}" \\
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }'`
    };

    const StepHeader = ({ number, title, desc }) => (
        <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm">
                {number}
            </div>
            <div>
                <h4 className="text-base font-bold text-foreground">{title}</h4>
                <p className="text-xs text-foreground-muted leading-relaxed">{desc}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 max-w-5xl">
            {/* Intro */}
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-sm">
                    <Globe size={32} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-foreground">Website Form Integration</h3>
                    <p className="text-sm text-foreground-muted">Complete these 4 steps to start receiving leads from your custom website forms.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {/* Step 1: Authentication */}
                <section>
                    <StepHeader 
                        number="1" 
                        title="Prepare Authentication" 
                        desc="Your unique API Key is required to authorize requests from your website."
                    />
                    <div className="ml-12 p-6 bg-card border border-border rounded-theme shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-emerald-500/10 rounded text-emerald-600">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-foreground-muted uppercase tracking-widest block mb-1">X-Api-Key Header</span>
                                <code className="text-sm font-mono font-bold text-primary">{apiKey.substring(0, 16)}...</code>
                            </div>
                        </div>
                        <button onClick={() => copyToClipboard(apiKey, 'key')} className="flex items-center gap-2 px-4 py-2 bg-background border border-border hover:bg-background-muted rounded-theme transition-all text-xs font-bold shadow-inner">
                            {copied === 'key' ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                            Copy Secret Key
                        </button>
                    </div>
                </section>

                {/* Step 2: Configure Endpoint */}
                <section>
                    <StepHeader 
                        number="2" 
                        title="Point to Intake Endpoint" 
                        desc="Configure your form to send a POST request to the following universal URL."
                    />
                    <div className="ml-12 space-y-4">
                        <div className="bg-slate-900 rounded-theme overflow-hidden border border-slate-800 shadow-xl group relative">
                            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HTTP POST</span>
                                <button onClick={() => copyToClipboard(`${publicBaseUrl}/intake`, 'url')} className="text-slate-400 hover:text-white">
                                    {copied === 'url' ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                            </div>
                            <pre className="p-4 text-sm font-mono text-emerald-400 break-all whitespace-pre-wrap">
                                {publicBaseUrl}/intake
                            </pre>
                        </div>
                    </div>
                </section>

                {/* Step 3: Map Your Fields */}
                <section>
                    <StepHeader 
                        number="3" 
                        title="Implementation Code" 
                        desc="Copy-paste these snippets into your project to handle the submission logic."
                    />
                    <div className="ml-12 bg-card border border-border rounded-theme overflow-hidden shadow-sm">
                        <div className="flex border-b border-border bg-background-muted">
                            <button 
                                onClick={() => setActiveSnippet('js')}
                                className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-r border-border transition-all ${activeSnippet === 'js' ? 'bg-card text-primary' : 'text-foreground-muted hover:text-foreground'}`}
                            >
                                JavaScript / Fetch
                            </button>
                            <button 
                                onClick={() => setActiveSnippet('curl')}
                                className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${activeSnippet === 'curl' ? 'bg-card text-primary' : 'text-foreground-muted hover:text-foreground'}`}
                            >
                                cURL (Terminal)
                            </button>
                        </div>
                        <div className="relative group">
                            <button 
                                onClick={() => copyToClipboard(snippets[activeSnippet], 'snippet')}
                                className="absolute top-4 right-4 p-2 bg-slate-800/50 text-slate-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-all z-10"
                            >
                                <Copy size={16} />
                            </button>
                            <pre className="p-6 bg-slate-950 text-slate-300 text-xs font-mono overflow-x-auto leading-relaxed h-[250px]">
                                {snippets[activeSnippet]}
                            </pre>
                        </div>
                    </div>
                </section>

                {/* Step 4: Verify Connection */}
                <section>
                    <StepHeader 
                        number="4" 
                        title="Verify and Test" 
                        desc="Trigger a test submission and check your CRM Leads module for the new entry."
                    />
                    <div className="ml-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-theme flex items-center gap-4">
                            <div className="p-2 bg-blue-500/20 rounded text-blue-600">
                                <Play size={18} />
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-foreground">Trigger Test</h5>
                                <p className="text-[10px] text-foreground-muted">Submit your form once to verify.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-theme flex items-center gap-4">
                            <div className="p-2 bg-orange-500/20 rounded text-orange-600">
                                <Zap size={18} />
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-foreground">Live Tracking</h5>
                                <p className="text-[10px] text-foreground-muted">Check Lead Intake Dashboard.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="ml-12 p-6 bg-primary text-white rounded-theme shadow-lg flex items-center justify-between group cursor-pointer hover:bg-primary-dark transition-all">
                <div className="flex items-center gap-4">
                    <Code size={24} />
                    <div>
                        <h4 className="font-bold">Need a developer's help?</h4>
                        <p className="text-xs opacity-80">Share this integration page with your technical team.</p>
                    </div>
                </div>
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );
};

export default WebsiteIntake;
