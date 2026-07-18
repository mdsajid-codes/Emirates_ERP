import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Pin, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsClientNotesTab = ({ clientId }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [actions, setActions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [noteForm, setNoteForm] = useState({
        noteTitle: '', noteBody: '', notesPriority: 'MEDIUM',
        actionId: '', remindMe: false, isPinned: false, notifyPeopleIds: []
    });

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/ats/client-notes/client/${clientId}`, { headers });
            setNotes(res.data || []);
        } catch (err) {
            console.error("Error fetching notes:", err);
            toast.error("Failed to load notes.");
        } finally {
            setLoading(false);
        }
    };

    const fetchConfigData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const [actionsRes, employeesRes] = await Promise.all([
                axios.get(`${API_URL}/ats/actions/active`, { headers }),
                axios.get(`${API_URL}/employees/all`, { headers })
            ]);
            setActions(actionsRes.data || []);
            setEmployees(employeesRes.data || []);
        } catch (err) {
            console.error("Failed to fetch configuration options for notes tab", err);
        }
    };

    useEffect(() => {
        if (clientId) {
            fetchNotes();
            fetchConfigData();
        }
    }, [clientId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedAction = actions.find(a => String(a.id) === String(noteForm.actionId));
    const actionName = selectedAction ? selectedAction.name : 'Select';

    const priorityLabel = noteForm.notesPriority ? noteForm.notesPriority.charAt(0).toUpperCase() + noteForm.notesPriority.slice(1).toLowerCase() : 'Medium';
    const dynamicPreviewText = `Priority (${priorityLabel}) - Action (${actionName}) :New Note is created for`;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNoteForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const payload = {
            ...noteForm,
            clientId: parseInt(clientId),
            noteTitle: dynamicPreviewText
        };

        try {
            if (editingNote) {
                await axios.put(`${API_URL}/ats/client-notes/${editingNote.id}`, payload, { headers });
                toast.success("Note saved.");
            } else {
                await axios.post(`${API_URL}/ats/client-notes`, payload, { headers });
                toast.success("Note added.");
            }
            setShowNoteModal(false);
            setEditingNote(null);
            fetchNotes();
        } catch (err) {
            toast.error("Failed to save note.");
        }
    };

    const handlePinNote = async (nId) => {
        toast.info("Pinning notes is only supported for vendors, not clients.");
    };

    const handleDeleteNote = async (nId) => {
        if (!window.confirm("Delete this note?")) return;
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.delete(`${API_URL}/ats/client-notes/${nId}`, { headers });
            toast.success("Note deleted.");
            fetchNotes();
        } catch (err) {
            toast.error("Failed to delete note.");
        }
    };

    const selectedIds = noteForm.notifyPeopleIds || [];
    const getSelectedLabel = () => {
        if (selectedIds.length === 0) return 'Select People';
        if (selectedIds.length === 1) {
            const emp = employees.find(e => e.id === selectedIds[0]);
            return emp ? `${emp.firstName} ${emp.lastName}` : '1 person selected';
        }
        return `${selectedIds.length} people selected`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">Client Notes & Pins</h3>
                {!showNoteModal && (
                    <button
                        onClick={() => {
                            setNoteForm({
                                noteTitle: '', noteBody: '', notesPriority: 'MEDIUM',
                                actionId: '', remindMe: false, isPinned: false, notifyPeopleIds: []
                            });
                            setEditingNote(null);
                            setDropdownOpen(false);
                            setShowNoteModal(true);
                        }}
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-theme hover:bg-primary/90 shadow-sm"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Note
                    </button>
                )}
            </div>

            {showNoteModal && (
                <div className="bg-background-muted/50 border border-border rounded-theme p-5 space-y-4">
                    <h4 className="text-sm font-bold text-foreground">{editingNote ? "Edit Note" : "Create Note"}</h4>
                    <form onSubmit={handleNoteSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Action</label>
                                <select
                                    name="actionId"
                                    value={noteForm.actionId || ''}
                                    onChange={handleInputChange}
                                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="">Select Action</option>
                                    {actions.map(action => (
                                        <option key={action.id} value={action.id}>{action.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Notes Priority</label>
                                <select
                                    name="notesPriority"
                                    value={noteForm.notesPriority || 'MEDIUM'}
                                    onChange={handleInputChange}
                                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-background-muted/80 border border-border/80 px-4 py-2 rounded-theme text-xs font-semibold text-foreground-muted/90 flex items-center shadow-sm select-none">
                            <span className="text-primary font-bold mr-1">ℹ️</span>
                            <span>{dynamicPreviewText}</span>
                        </div>

                        <div className="space-y-1.5 ck-editor-custom-wrapper">
                            <label className="block text-xs font-bold text-foreground-muted uppercase tracking-wider">Note Content</label>
                            <div className="border border-border rounded-xl overflow-hidden shadow-sm hover:border-primary/40 transition-all">
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={noteForm.noteBody || ''}
                                    onChange={(event, editor) => {
                                        const data = editor.getData();
                                        setNoteForm(prev => ({
                                            ...prev,
                                            noteBody: data
                                        }));
                                    }}
                                    config={{
                                        placeholder: 'Write note contents here...',
                                        toolbar: [
                                            'heading', '|',
                                            'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
                                            'undo', 'redo'
                                        ]
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Notify these people</label>
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 flex items-center justify-between transition-all"
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
                                                            setNoteForm(prev => ({
                                                                ...prev,
                                                                notifyPeopleIds: updated
                                                            }));
                                                        }}
                                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20 transition-all cursor-pointer"
                                                    />
                                                    <span className="truncate">{emp.firstName} {emp.lastName} ({emp.email || emp.designation || 'Staff'})</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="pb-2">
                                <label className="inline-flex items-center gap-3 cursor-pointer group select-none">
                                    <input
                                        type="checkbox"
                                        name="remindMe"
                                        checked={noteForm.remindMe || false}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-primary border-border rounded focus:ring-primary/30 transition-all cursor-pointer"
                                    />
                                    <div>
                                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Remind Me</span>
                                        <p className="text-[10px] text-foreground-muted mt-0.5 leading-normal">Send a calendar event notification reminder for this note.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-border">
                            <button type="button" onClick={() => setShowNoteModal(false)} className="px-4 py-2 bg-background-muted rounded-theme text-sm font-semibold border border-border text-foreground-muted hover:bg-background-muted transition-colors">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-theme text-sm font-bold shadow shadow-primary/10 hover:bg-primary/90 transition-colors">Save</button>
                        </div>
                    </form>
                </div>
            )}

            {loading && (
                <div className="text-center py-6 text-foreground-muted text-sm font-semibold">
                    Loading notes...
                </div>
            )}

            {!loading && notes.length === 0 && !showNoteModal && (
                <div className="text-center py-10 text-foreground-muted text-sm">
                    No notes registered. Click <span className="font-bold text-foreground">+ Add Note</span> to register one.
                </div>
            )}

            {!loading && notes.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    {notes.map(n => (
                        <div key={n.id} className="p-4 rounded-theme border border-border hover:border-border/85 bg-background/20 shadow-xs relative flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                        {n.isPinned && <Pin className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500" />}
                                        {n.noteTitle}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-theme ${n.notesPriority === 'HIGH' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-background border border-border text-foreground-muted'}`}>
                                        {n.notesPriority} Note
                                    </span>
                                </div>
                                <div className="text-xs text-foreground mt-2 ck-content leading-relaxed" dangerouslySetInnerHTML={{ __html: n.noteBody }} />
                            </div>

                            <div className="flex items-center justify-end gap-1.5 mt-4 pt-2 border-t border-border">
                                <button
                                    onClick={() => handlePinNote(n.id)}
                                    className={`p-1.5 rounded-theme border border-border transition-all ${n.isPinned ? 'text-indigo-600 bg-indigo-50' : 'text-foreground-muted hover:text-indigo-600 hover:bg-background'}`}
                                >
                                    <Pin className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingNote(n);
                                        setNoteForm({
                                            noteTitle: n.noteTitle || '', noteBody: n.noteBody || '',
                                            notesPriority: n.notesPriority || 'MEDIUM', actionId: n.actionId || '',
                                            remindMe: n.remindMe || false, isPinned: n.isPinned || false,
                                            notifyPeopleIds: n.notifyPeopleIds || []
                                        });
                                        setDropdownOpen(false);
                                        setShowNoteModal(true);
                                    }}
                                    className="p-1.5 hover:bg-background border border-border text-foreground-muted hover:text-primary rounded-theme transition-all"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteNote(n.id)}
                                    className="p-1.5 hover:bg-background border border-border text-foreground-muted hover:text-destructive rounded-theme transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AtsClientNotesTab;
