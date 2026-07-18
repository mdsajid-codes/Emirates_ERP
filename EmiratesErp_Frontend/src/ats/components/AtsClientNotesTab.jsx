import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsClientNotesTab = ({
    note = {},
    onChange,
    actions = [],
    employees = []
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        onChange({ ...note, [name]: type === 'checkbox' ? checked : value });
    };

    const selectedIds = note.notifyPeopleIds || [];

    const getSelectedLabel = () => {
        if (selectedIds.length === 0) return 'Select People';
        if (selectedIds.length === 1) {
            const emp = employees.find(e => e.id === selectedIds[0]);
            return emp ? `${emp.firstName} ${emp.lastName}` : '1 person selected';
        }
        return `${selectedIds.length} people selected`;
    };

    const selectedAction = actions.find(a => String(a.id) === String(note.actionId));
    const actionName = selectedAction ? selectedAction.name : 'Select';
    const priorityLabel = note.notesPriority ? note.notesPriority.charAt(0).toUpperCase() + note.notesPriority.slice(1).toLowerCase() : 'Medium';
    const dynamicPreviewText = `Priority (${priorityLabel}) - Action (${actionName}) :New Note is created for`;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Action */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Action</label>
                    <select
                        name="actionId"
                        value={note.actionId || ''}
                        onChange={handleChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">Select Action</option>
                        {actions.map(action => (
                            <option key={action.id} value={action.id}>{action.name}</option>
                        ))}
                    </select>
                </div>

                {/* Notes Priority */}
                <div>
                    <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Notes Priority</label>
                    <select
                        name="notesPriority"
                        value={note.notesPriority || 'MEDIUM'}
                        onChange={handleChange}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>
            </div>

            {/* Description Preview Bar */}
            <div className="bg-background-muted/80 border border-border/80 px-4 py-2 rounded-theme text-xs font-semibold text-foreground-muted/90 flex items-center shadow-sm select-none">
                <span className="text-primary font-bold mr-1">ℹ️</span>
                <span>{dynamicPreviewText}</span>
            </div>

            {/* Notes Content */}
            <div>
                <label className="block text-xs font-bold text-foreground-muted mb-1 uppercase tracking-wider">Note Content</label>
                <textarea
                    name="notes"
                    value={note.notes || ''}
                    onChange={handleChange}
                    rows={5}
                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none resize-y focus:ring-2 focus:ring-primary/20"
                    placeholder="Write note contents here..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                {/* Notify People */}
                <div className="relative" ref={dropdownRef}>
                    <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Notify These People</label>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 flex items-center justify-between"
                    >
                        <span className="truncate">{getSelectedLabel()}</span>
                        {dropdownOpen ? <ChevronUp size={16} className="text-foreground-muted" /> : <ChevronDown size={16} className="text-foreground-muted" />}
                    </button>

                    {dropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-card border border-border rounded-theme shadow-lg p-2 space-y-1">
                            {employees.map(emp => {
                                const isChecked = selectedIds.includes(emp.id);
                                return (
                                    <label key={emp.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-background-muted rounded cursor-pointer select-none text-sm text-foreground">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                                const updated = isChecked
                                                    ? selectedIds.filter(id => id !== emp.id)
                                                    : [...selectedIds, emp.id];
                                                onChange({ ...note, notifyPeopleIds: updated });
                                            }}
                                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20"
                                        />
                                        <span className="truncate">{emp.firstName} {emp.lastName} ({emp.email || emp.designation || 'Staff'})</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Remind Me */}
                <div className="pb-2">
                    <label className="inline-flex items-center gap-3 cursor-pointer group select-none">
                        <input
                            type="checkbox"
                            name="remindMe"
                            checked={note.remindMe || false}
                            onChange={handleChange}
                            className="w-5 h-5 text-primary border-border rounded focus:ring-primary/30"
                        />
                        <div>
                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Remind Me</span>
                            <p className="text-[10px] text-foreground-muted mt-0.5 leading-normal">Send a calendar event notification reminder for this note.</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default AtsClientNotesTab;
