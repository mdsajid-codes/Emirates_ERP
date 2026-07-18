import React, { useState, useEffect } from 'react';
import { X, Check, Users, Search, Loader2, UserPlus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmRoleAssignUserModal = ({ isOpen, onClose, role, onSuccess }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

    const authHeaders = { "Authorization": `Bearer ${localStorage.getItem('token')}` };

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
            setSelectedEmployeeId('');
            setSearchTerm('');
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/employees/all`, { headers: authHeaders });
            setEmployees(res.data);
        } catch (err) {
            console.error("Failed to fetch employees:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedEmployeeId) return;
        
        try {
            setAssigning(true);
            await axios.post(`${API_URL}/crm/roles/${role.id}/users/${selectedEmployeeId}`, {}, { headers: authHeaders });
            onSuccess();
            onClose();
        } catch (err) {
            alert(`Failed to assign user: ${err.response?.data?.message || err.message}`);
        } finally {
            setAssigning(false);
        }
    };

    if (!isOpen) return null;

    const filteredEmployees = employees.filter(emp => 
        emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border bg-card/50 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <UserPlus size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Assign User</h2>
                                <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest mt-0.5">Role: {role?.name}</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 bg-background-muted text-foreground-muted hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest ml-1">Select Employee</label>
                                <div className="max-h-[250px] overflow-y-auto border border-border rounded-xl divide-y divide-border bg-background">
                                    {loading ? (
                                        <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
                                    ) : filteredEmployees.length > 0 ? (
                                        filteredEmployees.map(emp => (
                                            <button
                                                key={emp.id}
                                                onClick={() => setSelectedEmployeeId(emp.id)}
                                                className={`w-full p-3 flex items-center gap-3 hover:bg-primary/5 transition-colors text-left ${selectedEmployeeId === emp.id ? 'bg-primary/10 ring-1 ring-inset ring-primary/20' : ''}`}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-background-muted flex items-center justify-center text-[10px] font-bold text-foreground-muted border border-border">
                                                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-foreground truncate">{emp.firstName} {emp.lastName}</p>
                                                    <p className="text-[10px] text-foreground-muted truncate font-medium">{emp.email}</p>
                                                </div>
                                                {selectedEmployeeId === emp.id && (
                                                    <div className="text-primary"><Check size={16} /></div>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-foreground-muted text-sm italic">No employees found</div>
                                    )}
                                </div>
                            </div>

                            <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl flex gap-3">
                                <Info size={16} className="text-primary shrink-0 mt-0.5" />
                                <p className="text-[10px] text-foreground-muted leading-relaxed font-medium">
                                    Assigning a new role will automatically replace any role previously assigned to this employee.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-background-muted text-foreground-muted rounded-xl font-bold text-sm hover:bg-background-muted/80 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={!selectedEmployeeId || assigning}
                                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {assigning ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                                Assign Role
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CrmRoleAssignUserModal;
