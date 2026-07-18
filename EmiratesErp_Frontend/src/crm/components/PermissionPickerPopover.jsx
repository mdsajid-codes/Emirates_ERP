import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const PermissionPickerPopover = ({ module, permissions, onUpdate, onClose }) => {
    const popoverRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <motion.div 
            ref={popoverRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-0 top-full mt-2 z-[110] bg-card border border-border rounded-xl shadow-2xl p-4 w-60 animate-in fade-in zoom-in duration-200"
        >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <h4 className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">{module.name} Permissions</h4>
                <button onClick={onClose} className="text-foreground-muted hover:text-destructive transition-colors">
                    <X size={14} />
                </button>
            </div>

            <div className="space-y-1">
                {module.actions.map(action => {
                    const field = `can${action.charAt(0).toUpperCase()}${action.slice(1)}`;
                    const isChecked = !!permissions[field];

                    return (
                        <label 
                            key={action}
                            className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border ${isChecked ? 'bg-primary/5 border-primary/20' : 'bg-transparent border-transparent hover:bg-background-muted'}`}
                        >
                            <span className="text-sm font-bold text-foreground capitalize">{action}</span>
                            <div className="relative flex items-center">
                                <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => onUpdate(action, e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${isChecked ? 'bg-primary border-primary' : 'border-border bg-background'}`}>
                                    {isChecked && <Check size={12} className="text-white" />}
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>
            
            <div className="mt-4 pt-3 border-t border-border">
                <button 
                    onClick={onClose}
                    className="w-full py-2 bg-background-muted text-foreground font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-border transition-all"
                >
                    Done
                </button>
            </div>
        </motion.div>
    );
};

export default PermissionPickerPopover;
