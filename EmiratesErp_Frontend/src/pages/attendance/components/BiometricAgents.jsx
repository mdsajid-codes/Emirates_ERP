import React, { useState, useEffect } from 'react';
import { RefreshCw, Loader, AlertCircle, Server, Activity, ShieldCheck, Copy, Check } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const BiometricAgents = () => {
    const [agents, setAgents] = useState([]);
    const [tenantApiKey, setTenantApiKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const fetchTenantData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            const [agentsRes, keyRes] = await Promise.all([
                axios.get(`${API_URL}/biometric/agent/status`, { headers }),
                axios.get(`${API_URL}/notification/lead-integration/api-key`, { headers })
            ]);
            
            setAgents(agentsRes.data);
            setTenantApiKey(keyRes.data.apiKey);
        } catch (err) {
            setError('Failed to fetch biometric data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyKey = () => {
        if (!tenantApiKey) return;
        navigator.clipboard.writeText(tenantApiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerateKey = async () => {
        if (!window.confirm('Regenerating your API Key will disconnect all existing agents. Continue?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/notification/lead-integration/api-key/regenerate`, {}, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setTenantApiKey(res.data.apiKey);
        } catch (err) {
            alert('Failed to regenerate API Key');
        }
    };

    useEffect(() => {
        fetchTenantData();
        const interval = setInterval(() => {
            const token = localStorage.getItem('token');
            axios.get(`${API_URL}/biometric/agent/status`, { 
                headers: { "Authorization": `Bearer ${token}` } 
            }).then(res => setAgents(res.data)).catch(console.error);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status, lastSeen) => {
        if (!lastSeen) return 'bg-background-muted text-foreground-muted border-border';
        
        const lastSeenDate = new Date(lastSeen);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastSeenDate) / 1000 / 60);

        if (diffMinutes < 5) return 'bg-primary/10 text-primary border-primary/20';
        if (diffMinutes < 15) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        return 'bg-error/10 text-error border-error/20';
    };

    const getStatusText = (status, lastSeen) => {
        if (!lastSeen) return 'Never Seen';
        
        const lastSeenDate = new Date(lastSeen);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastSeenDate) / 1000 / 60);

        if (diffMinutes < 5) return 'Active';
        if (diffMinutes < 15) return 'Away';
        return 'Offline';
    };

    return (
        <div className="space-y-4 text-foreground bg-background min-h-full w-full pb-8">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <h2 className="text-xs font-bold text-foreground">Local Sync Agents</h2>
                <button 
                    onClick={fetchTenantData} 
                    className="p-1 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-lg transition-colors cursor-pointer"
                    title="Refresh Status"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="bg-error/10 border border-error/20 text-error px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Agent Provisioning Header Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-foreground">Agent Provisioning Key</h3>
                        <p className="text-[11px] text-foreground-muted">Use this API Key to authenticate your local bridge agents.</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-lg self-start md:self-auto">
                    <code className="px-2.5 py-1 font-mono text-xs text-primary font-bold tracking-wider">
                        {tenantApiKey || '••••••••••••••••'}
                    </code>
                    <button 
                        onClick={handleCopyKey}
                        className="p-1 hover:bg-background-muted rounded-md text-foreground-muted hover:text-primary transition-colors cursor-pointer"
                        title="Copy Key"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button 
                        onClick={handleRegenerateKey}
                        className="px-2 py-0.5 text-[10px] font-bold text-red-600 hover:bg-red-500/10 rounded-md transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
                    >
                        Regenerate
                    </button>
                </div>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {loading && agents.length === 0 ? (
                    <div className="col-span-full flex justify-center py-16">
                        <Loader className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : agents.length > 0 ? (
                    agents.map(agent => (
                        <div key={agent.id} className="bg-card rounded-xl border border-border shadow-2xs p-3.5 hover:shadow-xs transition-shadow relative overflow-hidden group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                                    <Server className="h-4 w-4" />
                                </div>
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${getStatusColor(agent.status, agent.lastSeen)}`}>
                                    {getStatusText(agent.status, agent.lastSeen)}
                                </span>
                            </div>

                            <h3 className="text-xs font-bold text-foreground mb-1">{agent.agentName}</h3>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <p className="text-[10px] text-foreground-muted font-mono flex items-center gap-1 bg-background-muted px-2 py-0.5 rounded border border-border">
                                    <Activity className="h-3 w-3" />
                                    {agent.ipAddress || '0.0.0.0'}
                                </p>
                                <p className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${agent.status === 'ONLINE' ? 'bg-primary/5 text-primary border-primary/20' : 'bg-red-500/5 text-red-600 border-red-500/20'}`}>
                                    <ShieldCheck className="h-3 w-3" />
                                    {agent.status}
                                </p>
                            </div>

                            <div className="space-y-1 pt-2.5 border-t border-border/60 text-xs">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-foreground-muted">Version</span>
                                    <span className="font-semibold text-foreground font-mono">{agent.version || '1.0.0'}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-foreground-muted">Last Active</span>
                                    <span className="font-semibold text-foreground">
                                        {agent.lastSeen ? new Date(agent.lastSeen).toLocaleTimeString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 bg-card rounded-2xl border border-border">
                        <Server className="mx-auto h-8 w-8 text-foreground-muted/40 mb-2" />
                        <h3 className="text-xs font-bold text-foreground">No agents registered</h3>
                        <p className="max-w-xs mx-auto text-[11px] text-foreground-muted mt-1">
                            Install the GTR Sync Agent on your local office network to bridge legacy devices to the cloud.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BiometricAgents;
