import React, { useState, useEffect } from 'react';
import { RefreshCw, Loader, AlertCircle, Server, Activity, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const BiometricAgents = () => {
    const [agents, setAgents] = useState([]);
    const [tenantApiKey, setTenantApiKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

        if (diffMinutes < 5) return 'bg-success/10 text-success border-success/20';
        if (diffMinutes < 15) return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
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
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Local Sync Agents</h2>
                    <p className="text-sm text-foreground-muted">Monitor the health of your on-site biometric bridge agents.</p>
                </div>
                <button 
                    onClick={fetchTenantData} 
                    className="p-2 text-foreground-muted hover:text-primary transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-theme mb-6 font-medium flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Agent Provisioning Header */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">Agent Provisioning</h3>
                        <p className="text-sm text-foreground-muted">Use this API Key to link your on-site Sync Agents.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-xl">
                    <code className="px-3 py-1 font-mono text-sm text-primary font-bold">
                        {tenantApiKey || '••••••••••••••••'}
                    </code>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(tenantApiKey); alert('API Key copied!'); }}
                        className="p-2 hover:bg-background-muted rounded-lg text-foreground-muted transition-colors"
                        title="Copy Key"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={handleRegenerateKey}
                        className="px-3 py-1.5 text-xs font-bold text-error hover:bg-error/10 rounded-lg transition-colors border border-transparent hover:border-error/20"
                    >
                        Regenerate
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && agents.length === 0 ? (
                    <div className="col-span-full flex justify-center py-20">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : agents.length > 0 ? (
                    agents.map(agent => (
                        <div key={agent.id} className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <Server className="h-6 w-6" />
                                </div>
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${getStatusColor(agent.status, agent.lastSeen)}`}>
                                    {getStatusText(agent.status, agent.lastSeen)}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-foreground mb-1">{agent.agentName}</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <p className="text-[10px] text-foreground-muted font-mono flex items-center gap-1 bg-background-muted px-2 py-0.5 rounded border border-border">
                                    <Activity className="h-3 w-3" />
                                    {agent.ipAddress || '0.0.0.0'}
                                </p>
                                <p className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${agent.status === 'ONLINE' ? 'bg-success/5 text-success border-success/20' : 'bg-error/5 text-error border-error/20'}`}>
                                    <ShieldCheck className="h-3 w-3" />
                                    {agent.status}
                                </p>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-border">
                                <div className="flex justify-between text-xs">
                                    <span className="text-foreground-muted">Version</span>
                                    <span className="font-medium">{agent.version || '1.0.0'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-foreground-muted">Last Seen</span>
                                    <span className="font-medium">
                                        {agent.lastSeen ? new Date(agent.lastSeen).toLocaleTimeString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                <ShieldCheck className="h-24 w-24" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-card/50 rounded-2xl border border-dashed border-border">
                        <Server className="mx-auto h-12 w-12 text-foreground-muted opacity-20 mb-4" />
                        <h3 className="text-lg font-bold text-foreground">No agents registered</h3>
                        <p className="max-w-xs mx-auto text-sm text-foreground-muted mt-1">
                            Install the GTR Sync Agent on your local office network to bridge legacy devices to the cloud.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BiometricAgents;
