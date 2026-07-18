import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Shield, Settings, CheckCircle2, AlertTriangle, Eye, EyeOff, Loader2, HelpCircle, Info, ExternalLink, Key, Code, Sparkles, Server, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AiSettingsPage = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showKey, setShowKey] = useState({});
    const [activeHelpTab, setActiveHelpTab] = useState('openai'); // 'openai' | 'gemini' | 'system'
    
    const [form, setForm] = useState({
        providerName: '',
        providerType: 'OPENAI',
        apiKey: '',
        model: 'gpt-4o-mini',
        baseUrl: '',
        maxTokens: 4096,
        temperature: 0.0,
        isEnabled: true,
        description: ''
    });

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ats/ai-providers`, { headers });
            setProviders(res.data || []);
        } catch (e) {
            toast.error("Failed to fetch AI configurations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleTypeChange = (type) => {
        const defaultModel = type === 'OPENAI' ? 'gpt-4o-mini' : 'gemini-1.5-flash';
        setForm(prev => ({
            ...prev,
            providerType: type,
            model: defaultModel
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/ats/ai-providers`, form, { headers });
            toast.success("AI Configuration saved successfully.");
            setForm({
                providerName: '',
                providerType: 'OPENAI',
                apiKey: '',
                model: 'gpt-4o-mini',
                baseUrl: '',
                maxTokens: 4096,
                temperature: 0.0,
                isEnabled: true,
                description: ''
            });
            fetchProviders();
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to save AI configuration.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this AI Configuration?")) return;
        try {
            await axios.delete(`${API_URL}/ats/ai-providers/${id}`, { headers });
            toast.success("AI Configuration removed.");
            fetchProviders();
        } catch (e) {
            toast.error("Failed to delete config.");
        }
    };

    const handleSetActive = async (id) => {
        try {
            await axios.patch(`${API_URL}/ats/ai-providers/${id}/set-active`, {}, { headers });
            toast.success("Active AI provider switched successfully.");
            fetchProviders();
        } catch (e) {
            toast.error("Failed to toggle active configuration.");
        }
    };

    const toggleShowKey = (id) => {
        setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                        <Settings className="h-5 w-5 text-primary" /> AI Providers Configuration
                    </h3>
                    <p className="text-xs text-foreground-muted">Configure & switch AI models for dynamic resume parsing services.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration List */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-border shadow-sm">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <span className="text-sm text-foreground-muted">Fetching configurations...</span>
                        </div>
                    ) : providers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-border text-center px-4 shadow-sm">
                            <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
                            <h4 className="font-medium text-sm text-foreground">No AI Providers Added</h4>
                            <p className="text-xs text-foreground-muted mt-1 max-w-sm">Setup your first OpenAI or Gemini configuration to enable smart, instant resume parsing.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {providers.map(prov => (
                                <div key={prov.id} className={`p-4 bg-card rounded-xl border transition-all ${prov.isActive ? 'border-primary shadow-sm bg-primary/5' : 'border-border'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{prov.providerName}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${prov.providerType === 'OPENAI' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                    {prov.providerType}
                                                </span>
                                                {prov.isActive && (
                                                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                                                        <CheckCircle2 className="h-3 w-3" /> Active Parser
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-foreground-muted mt-1">Model: <strong className="text-foreground">{prov.model}</strong></p>
                                            {prov.description && <p className="text-xs text-foreground-muted italic mt-1">{prov.description}</p>}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!prov.isActive && (
                                                <button 
                                                    onClick={() => handleSetActive(prov.id)}
                                                    className="text-xs px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium transition-all"
                                                >
                                                    Use as Active
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(prov.id)}
                                                className="text-foreground-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-card-hover transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2 text-foreground-muted">
                                            <Shield className="h-3.5 w-3.5" /> API Key:
                                            <span className="font-mono bg-card-hover px-2 py-0.5 rounded border border-border">
                                                {showKey[prov.id] ? prov.apiKeyMasked : '••••••••••••••••'}
                                            </span>
                                            <button onClick={() => toggleShowKey(prov.id)} className="hover:text-primary transition-colors ml-1">
                                                {showKey[prov.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                        <div className="text-foreground-muted">
                                            Temp: <strong className="text-foreground">{prov.temperature}</strong> • Max Tokens: <strong className="text-foreground">{prov.maxTokens}</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Form */}
                <div className="bg-card p-5 rounded-xl border border-border h-fit shadow-sm">
                    <h4 className="font-semibold text-sm mb-4">Add AI Configuration</h4>
                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-medium text-foreground-muted mb-1">Provider Label / Name</label>
                            <input 
                                type="text"
                                required
                                value={form.providerName}
                                onChange={e => setForm(p => ({ ...p, providerName: e.target.value }))}
                                placeholder="e.g. Google Gemini Parser"
                                className="w-full px-3 py-2 bg-card rounded-lg border border-border text-foreground focus:outline-none focus:border-primary transition-colors text-xs"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-foreground-muted mb-1">Provider Type</label>
                            <select 
                                value={form.providerType}
                                onChange={e => handleTypeChange(e.target.value)}
                                className="w-full px-3 py-2 bg-card rounded-lg border border-border text-foreground focus:outline-none focus:border-primary transition-colors text-xs"
                            >
                                <option value="OPENAI">OpenAI</option>
                                <option value="GEMINI">Google Gemini</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium text-foreground-muted mb-1 flex justify-between">
                                <span>API Secret Key</span>
                                <span className="text-[10px] text-primary font-semibold">(AES-256 Encrypted)</span>
                            </label>
                            <input 
                                type="password"
                                required
                                value={form.apiKey}
                                onChange={e => setForm(p => ({ ...p, apiKey: e.target.value }))}
                                placeholder="Enter API secret token"
                                className="w-full px-3 py-2 bg-card rounded-lg border border-border text-foreground focus:outline-none focus:border-primary transition-colors text-xs font-mono"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-foreground-muted mb-1">Model Name</label>
                            <input 
                                type="text"
                                required
                                value={form.model}
                                onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
                                placeholder="e.g. gpt-4o-mini"
                                className="w-full px-3 py-2 bg-card rounded-lg border border-border text-foreground focus:outline-none focus:border-primary transition-colors text-xs"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-foreground-muted mb-1">Custom Endpoint Base URL (Optional)</label>
                            <input 
                                type="text"
                                value={form.baseUrl}
                                onChange={e => setForm(p => ({ ...p, baseUrl: e.target.value }))}
                                placeholder="Leave blank for official defaults"
                                className="w-full px-3 py-2 bg-card rounded-lg border border-border text-foreground focus:outline-none focus:border-primary transition-colors text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block font-medium text-foreground-muted mb-1">Temperature</label>
                                <input 
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="2"
                                    value={form.temperature}
                                    onChange={e => setForm(p => ({ ...p, temperature: parseFloat(e.target.value) || 0.0 }))}
                                    className="w-full px-3 py-2 bg-card rounded-lg border border-border text-foreground focus:outline-none focus:border-primary transition-colors text-xs"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-foreground-muted mb-1">Max Output Tokens</label>
                                <input 
                                    type="number"
                                    value={form.maxTokens}
                                    onChange={e => setForm(p => ({ ...p, maxTokens: parseInt(e.target.value) || 4096 }))}
                                    className="w-full px-3 py-2 bg-card rounded-lg border border-border text-foreground focus:outline-none focus:border-primary transition-colors text-xs"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-foreground-muted mb-1">Internal Notes</label>
                            <textarea 
                                rows={2}
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Optional description..."
                                className="w-full px-3 py-2 bg-card rounded-lg border border-border text-foreground focus:outline-none focus:border-primary transition-colors text-xs resize-none"
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/95 font-semibold rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Save Config
                        </button>
                    </form>
                </div>
            </div>

            {/* Premium, Interactive Help & Guide Section */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-md mt-6">
                {/* Header Banner */}
                <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border flex items-center justify-between">
                    <div className="space-y-1">
                        <h4 className="font-bold text-base flex items-center gap-2 text-foreground">
                            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" /> AI Setup & Integration Center
                        </h4>
                        <p className="text-xs text-foreground-muted">Learn how to securely obtain API keys and connect state-of-the-art LLMs to our high-performance resume parsing pipeline.</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium text-foreground-muted">
                        <Shield className="h-3.5 w-3.5 text-emerald-500" /> AES-256 Encrypted
                    </div>
                </div>

                {/* Tab Switchers */}
                <div className="flex border-b border-border bg-background-muted/30 px-6 py-2 gap-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveHelpTab('openai')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeHelpTab === 'openai' 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'text-foreground-muted hover:text-foreground hover:bg-card-hover border border-transparent'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        1. Get OpenAI Key
                    </button>
                    <button
                        onClick={() => setActiveHelpTab('gemini')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeHelpTab === 'gemini' 
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                            : 'text-foreground-muted hover:text-foreground hover:bg-card-hover border border-transparent'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        2. Get Gemini Key
                    </button>
                    <button
                        onClick={() => setActiveHelpTab('system')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeHelpTab === 'system' 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'text-foreground-muted hover:text-foreground hover:bg-card-hover border border-transparent'
                        }`}
                    >
                        <Server className="h-3.5 w-3.5" />
                        3. Setup & Connect System
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="p-6">
                    {activeHelpTab === 'openai' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                                <Key className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <h5 className="font-bold text-sm text-foreground">OpenAI API Key Acquisition Guide</h5>
                                    <p className="text-xs text-foreground-muted mt-0.5">OpenAI offers industry-standard large language models (such as GPT-4o) with incredibly accurate data parsing and multi-lingual structure mapping capabilities.</p>
                                </div>
                            </div>

                            <div className="relative border-l border-border pl-6 ml-3 space-y-6 text-xs">
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 bg-background border border-emerald-500 text-emerald-500 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">1</div>
                                    <h6 className="font-bold text-foreground">Sign Up or Log In to OpenAI Platform</h6>
                                    <p className="text-foreground-muted mt-1">Navigate to the <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5">OpenAI Developer Platform <ExternalLink className="h-3 w-3" /></a>. Create a developer account, or log in if you already have one.</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 bg-background border border-emerald-500 text-emerald-500 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">2</div>
                                    <h6 className="font-bold text-foreground">Configure Account Billing (Mandatory for API)</h6>
                                    <p className="text-foreground-muted mt-1">Unlike ChatGPT Plus, the developer API requires a separate pay-as-you-go billing profile. Go to <strong>Settings &gt; Billing</strong>, add a credit/payment card, and fund your balance (a minimum of $5 is recommended to start parsing resumes immediately).</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 bg-background border border-emerald-500 text-emerald-500 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">3</div>
                                    <h6 className="font-bold text-foreground">Generate Your Secret Key</h6>
                                    <p className="text-foreground-muted mt-1">Go to the left-hand sidebar, hover/click on <strong>API Keys</strong>. Click the <strong>Create new secret key</strong> button. Give it a descriptive name such as <code className="bg-card px-1.5 py-0.5 rounded font-mono border border-border">GTR-ATS-ResumeParser</code>, and click Create.</p>
                                </div>

                                <div className="relative bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                                    <div className="absolute -left-[31px] top-0.5 bg-background border border-amber-500 text-amber-500 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">!</div>
                                    <h6 className="font-bold text-amber-600">CRITICAL: Copy Your Key Immediately</h6>
                                    <p className="text-foreground-muted mt-1">OpenAI will show your complete secret key (starting with <code className="font-mono text-foreground font-bold">sk-proj-...</code>) only <strong>once</strong>. Copy it to a secure notepad or clipboard right away. If you close the window without copying, you must create a new one.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeHelpTab === 'gemini' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                                <Key className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <h5 className="font-bold text-sm text-foreground">Google Gemini API Key Acquisition Guide</h5>
                                    <p className="text-xs text-foreground-muted mt-0.5">Google AI Studio provides access to highly optimized models like Gemini 1.5 Flash and Gemini 1.5 Pro, featuring lightning-fast response times and superb structured JSON formats.</p>
                                </div>
                            </div>

                            <div className="relative border-l border-border pl-6 ml-3 space-y-6 text-xs">
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 bg-background border border-blue-500 text-blue-500 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">1</div>
                                    <h6 className="font-bold text-foreground">Sign In to Google AI Studio</h6>
                                    <p className="text-foreground-muted mt-1">Open the browser and go to <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5">Google AI Studio <ExternalLink className="h-3 w-3" /></a>. Log in with your standard Google Workspace or Gmail account.</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 bg-background border border-blue-500 text-blue-500 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">2</div>
                                    <h6 className="font-bold text-foreground">Generate the API Key</h6>
                                    <p className="text-foreground-muted mt-1">Click the primary <strong>Get API Key</strong> button on the left sidebar navigation menu. Click on the <strong>Create API Key</strong> button at the top of the workspace dashboard.</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 bg-background border border-blue-500 text-blue-500 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">3</div>
                                    <h6 className="font-bold text-foreground">Select Project & Save Key</h6>
                                    <p className="text-foreground-muted mt-1">Choose a Google Cloud Project (or create a new default one in the prompt). Google AI Studio will compile your credentials and render a secret key. Copy the key immediately and save it in a safe place.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeHelpTab === 'system' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <Code className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <h5 className="font-bold text-sm text-foreground">Connecting AI Configurations to ATS</h5>
                                    <p className="text-xs text-foreground-muted mt-0.5">Now that you have your key, follow these rapid steps to activate smart automated resume parsing on your tenant account.</p>
                                </div>
                            </div>

                            <div className="relative border-l border-border pl-6 ml-3 space-y-6 text-xs">
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 bg-background border border-primary text-primary w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">1</div>
                                    <h6 className="font-bold text-foreground">Fill Out the "Add AI Configuration" Form</h6>
                                    <p className="text-foreground-muted mt-1">On the right side of this settings panel, fill in the values:</p>
                                    <ul className="list-disc pl-4 mt-2 space-y-1.5 text-foreground-muted">
                                        <li><strong>Provider Label:</strong> Enter any friendly label (e.g. <code className="bg-card px-1 rounded font-mono">Company OpenAI Pro</code>) to keep track of the config.</li>
                                        <li><strong>Provider Type:</strong> Select <code className="bg-card px-1 rounded font-mono">OpenAI</code> or <code className="bg-card px-1 rounded font-mono">Google Gemini</code>.</li>
                                        <li><strong>API Secret Key:</strong> Paste your copied key. Our server encrypts it instantly.</li>
                                        <li><strong>Model Name:</strong> Enter <code className="bg-card px-1.5 py-0.5 rounded font-mono font-bold text-foreground text-[11px]">gpt-4o-mini</code> (OpenAI) or <code className="bg-card px-1.5 py-0.5 rounded font-mono font-bold text-foreground text-[11px]">gemini-1.5-flash</code> (Gemini) for optimal performance.</li>
                                    </ul>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 bg-background border border-primary text-primary w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">2</div>
                                    <h6 className="font-bold text-foreground">Save & Set Active</h6>
                                    <p className="text-foreground-muted mt-1">Click <strong>Save Config</strong>. The configuration card will show up in the left-hand column list. Click the <strong>Use as Active</strong> button on that card. Only one provider configuration is marked "Active Parser" at any time.</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 bg-background border border-primary text-primary w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">3</div>
                                    <h6 className="font-bold text-foreground">Test Connection on "Add Applicant" Screen</h6>
                                    <p className="text-foreground-muted mt-1">Go to the main ATS menu, click <strong>Applicants</strong> and click the <strong>Add Applicant</strong> button. You'll see a premium <strong>Parse Resume with AI</strong> button at the top. Click it, drag-and-drop a candidate's resume (PDF/DOCX), and watch the system parse contact details, education history, and skills in seconds!</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Security Notice */}
                <div className="bg-background-muted/30 p-4 border-t border-border flex items-start gap-3 text-[11px] text-foreground-muted">
                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5 animate-bounce" />
                    <p>
                        <strong>How Connection Works Behind the Scenes:</strong> When a user uploads a resume, our system uses Apache Tika to parse the raw layout text, sends a securely packaged JSON schema request using the active API key directly to the LLM endpoint (OpenAI or Gemini), maps the structured response, and inputs it directly into the frontend applicant form automatically. Keys are encrypted at rest with multi-tenant workspace separation.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AiSettingsPage;

