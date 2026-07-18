import React from 'react';
import { Zap, ExternalLink, ArrowRight } from 'lucide-react';

const ZapierIntake = ({ publicBaseUrl }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-orange-500/10 rounded-theme text-orange-600">
                    <Zap size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-foreground">Zapier & Make.com</h3>
                    <p className="text-sm text-foreground-muted">Connect LinkedIn, Shopify, and 3,000+ other apps via Zapier.</p>
                </div>
            </div>

            <div className="bg-card rounded-theme border border-border p-8 shadow-sm text-center max-w-2xl mx-auto">
                <div className="mb-6">
                    <div className="inline-flex p-4 bg-orange-500/10 rounded-full text-orange-500 mb-4">
                        <Zap size={48} />
                    </div>
                    <h4 className="text-lg font-bold text-foreground">Workflow Automation</h4>
                    <p className="text-sm text-foreground-muted mt-2 px-8">
                        Use the "Webhooks by Zapier" or "HTTP" action in Make.com to POST data to our intake endpoint.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
                    {[
                        { step: 1, title: 'Trigger', desc: 'LinkedIn Ads, Sheets, etc.' },
                        { step: 2, title: 'Action', desc: 'Webhooks by Zapier (POST)' },
                        { step: 3, title: 'Map', desc: 'Map fields to our API' }
                    ].map((s) => (
                        <div key={s.step} className="p-4 bg-background-muted rounded-theme border border-border relative">
                            <span className="absolute -top-2 -left-2 w-6 h-6 bg-orange-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                                {s.step}
                            </span>
                            <h5 className="text-xs font-black uppercase text-foreground mb-1">{s.title}</h5>
                            <p className="text-[10px] text-foreground-muted">{s.desc}</p>
                        </div>
                    ))}
                </div>

                <a 
                    href="https://zapier.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-3 px-8 py-3 bg-orange-500 text-white font-bold rounded-theme hover:bg-orange-600 transition-all shadow-md group"
                >
                    Connect with Zapier <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>
    );
};

export default ZapierIntake;
