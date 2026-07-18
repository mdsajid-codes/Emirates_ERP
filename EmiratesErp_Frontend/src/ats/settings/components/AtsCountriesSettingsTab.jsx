import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Search, Globe } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsCountriesSettingsTab = () => {
    const [countries, setCountries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchCountries = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ats/geo/countries`, { headers });
            setCountries(res.data || []);
        } catch (e) {
            console.error("Failed to load countries", e);
            toast.error("Failed to load countries list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCountries();
    }, []);

    const filteredCountries = countries.filter(c => 
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.isoCode || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && countries.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center py-20 gap-3">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
                <span className="text-sm font-medium text-foreground-muted">Loading country index...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background-muted/40 p-4 border border-border rounded-theme">
                <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <span>Countries Browser</span>
                    </h3>
                    <p className="text-xs text-foreground-muted mt-1">
                        View live country lists from the CountriesNow master database. Country list is read-only.
                    </p>
                </div>
                <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground-muted">
                        <Search className="h-4 w-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search by country name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 w-full text-xs border border-border rounded-theme focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground"
                    />
                </div>
            </div>

            {/* List/Display Section */}
            <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                        Available Countries ({filteredCountries.length})
                    </span>
                </div>
                <div className="overflow-y-auto max-h-[60vh] divide-y divide-border px-6">
                    {filteredCountries.length === 0 ? (
                        <p className="text-xs text-foreground-muted py-8 text-center">No matching countries found.</p>
                    ) : (
                        filteredCountries.map(c => (
                            <div key={c.id || c.name} className="flex justify-between items-center py-3.5 hover:bg-background-muted/20 transition-colors">
                                <div>
                                    <h4 className="font-bold text-foreground text-sm">{c.name}</h4>
                                </div>
                                <span className="text-xs text-foreground-muted font-mono bg-background-muted px-2.5 py-0.5 rounded border border-border/60">
                                    {c.isoCode || 'N/A'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AtsCountriesSettingsTab;
