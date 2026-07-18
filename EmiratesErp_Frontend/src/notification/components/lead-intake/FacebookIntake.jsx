import React, { useState } from 'react';
import { 
    Facebook, 
    ExternalLink, 
    Copy, 
    CheckCircle, 
    Terminal, 
    ShieldCheck, 
    Settings, 
    Zap,
    PlayCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const FacebookIntake = ({ apiKey, publicBaseUrl }) => {
    const [copied, setCopied] = useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
        toast.info("Copied to clipboard");
    };

    const callbackUrl = `${publicBaseUrl}/facebook?api_key=${apiKey}`;

    const StepHeader = ({ number, title, desc }) => (
        <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
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
                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-600 shadow-sm">
                    <Facebook size={32} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-foreground">Facebook & Instagram Ads</h3>
                    <p className="text-sm text-foreground-muted">Native integration to capture leads from Meta Lead Ads without third-party tools.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {/* Step 1: Meta Portal */}
                <section>
                    <StepHeader 
                        number="1" 
                        title="Create Meta Developer App" 
                        desc="Start by creating a new App in the Meta Developer Portal to get your integration credentials."
                    />
                    <div className="ml-12">
                        <a 
                            href="https://developers.facebook.com/apps/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white font-bold rounded-theme hover:bg-indigo-700 transition-all shadow-md group"
                        >
                            <ExternalLink size={20} />
                            Go to Meta Developer Portal
                            <span className="opacity-50 group-hover:translate-x-1 transition-transform">{`→`}</span>
                        </a>
                        <p className="text-[10px] text-foreground-muted mt-3 italic">
                            Select "Other" {`->`} "Business" as the App Type for Lead Ads compatibility.
                        </p>
                    </div>
                </section>

                {/* Step 2: Webhook Config */}
                <section>
                    <StepHeader 
                        number="2" 
                        title="Configure Webhook Settings" 
                        desc="In your App Dashboard, add the 'Webhooks' product and configure the Callback URL."
                    />
                    <div className="ml-12 space-y-4">
                        <div className="bg-card border border-border rounded-theme p-6 shadow-sm">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest block">Callback URL</label>
                                    <div className="flex items-center gap-2 bg-background p-3 rounded border border-border text-xs font-mono group relative shadow-inner">
                                        <span className="flex-1 break-all pr-12 text-indigo-600 font-bold">{callbackUrl}</span>
                                        <button 
                                            onClick={() => copyToClipboard(callbackUrl, 'fb')} 
                                            className="absolute right-3 p-1.5 hover:bg-indigo-50 rounded text-foreground-muted hover:text-indigo-600 transition-all"
                                        >
                                            {copied === 'fb' ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest block">Verify Token</label>
                                    <div className="p-3 bg-background border border-border rounded text-xs font-mono text-foreground-muted flex items-center gap-2 italic">
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                        You can use any value (e.g. "my_crm_token")
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 3: Permissions */}
                <section>
                    <StepHeader 
                        number="3" 
                        title="Subscribe to Leadgen" 
                        desc="Specify which data events should be sent to your CRM."
                    />
                    <div className="ml-12 p-6 bg-card border border-border rounded-theme shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 bg-amber-500/10 rounded text-amber-600">
                                <Settings size={20} />
                            </div>
                            <h5 className="text-sm font-bold">Event Subscription</h5>
                        </div>
                        <p className="text-xs text-foreground-muted leading-relaxed mb-4">
                            In the Webhooks section, select <strong>"Page"</strong> from the dropdown and click <strong>Subscribe</strong> to the <strong>"leadgen"</strong> field.
                        </p>
                        <div className="p-3 bg-background border border-border rounded flex items-center gap-2 text-[10px] font-mono text-primary">
                            <Zap size={12} /> Object: Page {`->`} Field: leadgen
                        </div>
                    </div>
                </section>

                {/* Step 4: Testing */}
                <section>
                    <StepHeader 
                        number="4" 
                        title="Test with Lead Ads Tool" 
                        desc="Use Meta's official testing tool to send a dummy lead and verify the integration."
                    />
                    <div className="ml-12">
                        <a 
                            href="https://developers.facebook.com/tools/lead-ads-testing" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-6 py-4 bg-background border border-border hover:bg-background-muted font-bold rounded-theme transition-all shadow-sm group"
                        >
                            <PlayCircle size={20} className="text-indigo-600" />
                            Open Lead Ads Testing Tool
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FacebookIntake;
