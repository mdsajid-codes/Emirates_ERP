import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserCog, Loader, User } from 'lucide-react';

const BulkAssignOwnerModal = ({ isOpen, onClose, selectedCount, employees, onConfirm, loading }) => {
    const [selectedOwner, setSelectedOwner] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const filteredEmployees = employees.filter(emp => 
        (emp.firstName + ' ' + emp.lastName).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConfirm = () => {
        if (!selectedOwner) return;
        onConfirm(selectedOwner);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={!loading ? onClose : undefined} 
            />
            
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 20 }} 
                className="relative bg-card w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-background-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <UserCog className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Assign Owner</h3>
                            <p className="text-xs text-foreground-muted">
                                Assigning {selectedCount} selected {selectedCount === 1 ? 'lead' : 'leads'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        disabled={loading}
                        className="p-2 text-foreground-muted hover:text-foreground hover:bg-background-muted rounded-full transition-colors disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 overflow-y-auto max-h-[60vh] space-y-4">
                    <p className="text-sm text-foreground-muted">Select a new owner to assign the selected leads to.</p>
                    
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search employee..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-3 pr-4 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        />
                    </div>
                    
                    <div className="space-y-2 mt-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map(emp => (
                                <button
                                    key={emp.id}
                                    onClick={() => setSelectedOwner(emp.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                        selectedOwner === emp.id 
                                            ? 'border-primary bg-primary/5 shadow-sm' 
                                            : 'border-border bg-background hover:bg-background-muted/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                            selectedOwner === emp.id ? 'bg-primary text-primary-foreground' : 'bg-background-muted text-primary'
                                        }`}>
                                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-sm font-medium ${selectedOwner === emp.id ? 'text-primary' : 'text-foreground'}`}>
                                                {emp.firstName} {emp.lastName}
                                            </p>
                                            <p className="text-xs text-foreground-muted">{emp.email || 'Employee'}</p>
                                        </div>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                        selectedOwner === emp.id ? 'border-primary' : 'border-foreground-muted'
                                    }`}>
                                        {selectedOwner === emp.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-6 text-foreground-muted text-sm flex flex-col items-center gap-2">
                                <User className="h-8 w-8 opacity-20" />
                                No employees found
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-background-muted/30 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-theme hover:bg-background-muted transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedOwner || loading}
                        className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-theme shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader className="h-4 w-4 animate-spin" />}
                        {loading ? 'Assigning...' : 'Assign Owner'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default BulkAssignOwnerModal;
