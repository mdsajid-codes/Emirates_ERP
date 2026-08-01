import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Loader, Search, ArrowLeft, Check, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SyncPolicyView = ({ policy, onBack, onSync }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployees, setSelectedEmployees] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            setSearchTerm('');
            setSelectedEmployees(new Set());
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/employees/all`, { headers: { "Authorization": `Bearer ${token}` } });
                setEmployees(res.data);
            } catch (err) {
                console.error("Failed to fetch employees for sync:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, [policy]);

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return employees;
        const lowercasedFilter = searchTerm.toLowerCase();
        return employees.filter(emp =>
            `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(lowercasedFilter) ||
            emp.employeeCode.toLowerCase().includes(lowercasedFilter));
    }, [employees, searchTerm]);

    const handleSelect = (employeeCode) => {
        setSelectedEmployees(prev => {
            const newSet = new Set(prev);
            if (newSet.has(employeeCode)) {
                newSet.delete(employeeCode);
            } else {
                newSet.add(employeeCode);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allVisibleCodes = new Set(filteredEmployees.map(emp => emp.employeeCode));
            setSelectedEmployees(allVisibleCodes);
        } else {
            setSelectedEmployees(new Set());
        }
    };

    const areAllSelected = useMemo(() => {
        return filteredEmployees.length > 0 && filteredEmployees.every(emp => selectedEmployees.has(emp.employeeCode));
    }, [filteredEmployees, selectedEmployees]);

    const handleSync = async () => {
        setIsSyncing(true);
        await onSync(policy, Array.from(selectedEmployees));
        setIsSyncing(false);
        onBack();
    };

    return (
        <div className="w-full space-y-4 text-foreground bg-background min-h-full pb-8">
            {/* Header bar with Back button */}
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                    <button 
                        type="button"
                        onClick={onBack} 
                        className="p-1.5 hover:bg-background-muted rounded-lg border border-border flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back</span>
                    </button>
                    <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>Sync '{policy?.policyName || policy?.name || 'Policy'}' to Employees</span>
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        type="button" 
                        onClick={onBack} 
                        className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted border border-border rounded-lg transition-colors cursor-pointer"
                        disabled={isSyncing}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSync}
                        disabled={isSyncing || selectedEmployees.size === 0}
                        className="px-3.5 py-1 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                        {isSyncing ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                        {isSyncing ? 'Syncing...' : `Apply to ${selectedEmployees.size} Employees`}
                    </button>
                </div>
            </div>

            {/* Controls Card */}
            <div className="bg-card p-3.5 rounded-xl shadow-xs border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-md">
                    <input 
                        type="text" 
                        placeholder="Search employees by name or code..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all" 
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
                </div>
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background-muted/60 border border-border cursor-pointer text-xs font-semibold text-foreground hover:bg-background-muted transition-colors self-start sm:self-auto">
                    <input 
                        type="checkbox" 
                        checked={areAllSelected} 
                        onChange={handleSelectAll} 
                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary" 
                    />
                    <span>Select All Visible ({filteredEmployees.length})</span>
                </label>
            </div>

            {/* Employee Selection Grid */}
            <div className="bg-card rounded-2xl shadow-xs border border-border p-3.5 min-h-[300px]">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader className="animate-spin text-primary h-6 w-6" />
                    </div>
                ) : filteredEmployees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[550px] overflow-y-auto pr-1">
                        {filteredEmployees.map(emp => {
                            const isSelected = selectedEmployees.has(emp.employeeCode);
                            return (
                                <label 
                                    key={emp.employeeCode} 
                                    className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer border transition-all ${
                                        isSelected 
                                            ? 'bg-primary/10 border-primary/30 shadow-2xs' 
                                            : 'bg-background border-border/70 hover:bg-background-muted/50'
                                    }`}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected} 
                                        onChange={() => handleSelect(emp.employeeCode)} 
                                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary accent-primary shrink-0" 
                                    />
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-xs font-bold text-foreground truncate">{emp.firstName} {emp.lastName}</span>
                                        <span className="text-[10px] text-foreground-muted font-mono uppercase tracking-wider">{emp.employeeCode}</span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-foreground-muted">
                        <p className="text-xs font-semibold">No matching employees found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SyncPolicyView;
