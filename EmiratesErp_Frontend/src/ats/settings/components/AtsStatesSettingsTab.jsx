import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Search, Map } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAtsGeo } from '../../hooks/useAtsGeo';

const AtsStatesSettingsTab = () => {
    const {
        countries,
        states,
        setSelectedCountryName,
        selectedCountryName,
        loadingStates
    } = useAtsGeo();

    const [searchQuery, setSearchQuery] = useState('');

    const filteredStates = states.filter(s => 
        (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.stateCode || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background-muted/40 p-4 border border-border rounded-theme">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Map className="h-5 w-5 text-primary" />
                        <span>States Browser</span>
                    </h3>
                    <p className="text-xs text-foreground-muted">
                        Select a country to browse its available states. State list is read-only.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <div className="w-full sm:w-56">
                        <select
                            value={countries.find(c => c.name === selectedCountryName)?.id || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                const matched = countries.find(c => String(c.id) === String(val));
                                setSelectedCountryName(matched ? matched.name : '');
                                setSearchQuery('');
                            }}
                            className="px-3 py-2 w-full text-xs border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Select Country</option>
                            {countries.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    {selectedCountryName && (
                        <div className="relative w-full sm:w-56">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground-muted">
                                <Search className="h-4 w-4" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search states..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 w-full text-xs border border-border rounded-theme focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* List Section */}
            <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                        {selectedCountryName 
                            ? `States in ${selectedCountryName} (${filteredStates.length})` 
                            : 'Please select a country to view states'}
                    </span>
                </div>
                
                {loadingStates ? (
                    <div className="flex flex-col justify-center items-center py-16 gap-3">
                        <Loader2 className="animate-spin text-primary h-8 w-8" />
                        <span className="text-sm font-medium text-foreground-muted">Loading states for {selectedCountryName}...</span>
                    </div>
                ) : (
                    <div className="overflow-y-auto max-h-[60vh] divide-y divide-border px-6">
                        {!selectedCountryName ? (
                            <p className="text-xs text-foreground-muted py-12 text-center">Select a country above to load state data.</p>
                        ) : filteredStates.length === 0 ? (
                            <p className="text-xs text-foreground-muted py-12 text-center">No matching states found.</p>
                        ) : (
                            filteredStates.map(s => (
                                <div key={s.id || s.name} className="flex justify-between items-center py-3.5 hover:bg-background-muted/20 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm">{s.name}</h4>
                                    </div>
                                    <span className="text-xs text-foreground-muted font-mono bg-background-muted px-2.5 py-0.5 rounded border border-border/60">
                                        {s.stateCode || 'N/A'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AtsStatesSettingsTab;
