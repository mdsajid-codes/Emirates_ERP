import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Edit2, Trash2, Save, Languages } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsLanguageTab = ({ applicantId }) => {
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        languageName: '',
        canRead: false,
        canSpeak: false,
        canWrite: false
    });

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchLanguages = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ats/applicants/${applicantId}/languages`, { headers });
            setLanguages(res.data || []);
        } catch (e) {
            console.error("Failed to fetch languages", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (applicantId) {
            fetchLanguages();
        }
    }, [applicantId]);

    const resetForm = () => {
        setForm({
            languageName: '',
            canRead: false,
            canSpeak: false,
            canWrite: false
        });
        setIsEditing(false);
        setEditId(null);
    };

    const handleEditClick = (lang) => {
        setIsEditing(true);
        setEditId(lang.id);
        setForm({
            languageName: lang.languageName || '',
            canRead: lang.canRead || false,
            canSpeak: lang.canSpeak || false,
            canWrite: lang.canWrite || false
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this language capability?")) return;
        try {
            await axios.delete(`${API_URL}/ats/applicants/${applicantId}/languages/${id}`, { headers });
            toast.success("Language capability deleted.");
            fetchLanguages();
        } catch (err) {
            toast.error("Failed to delete language entry.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editId) {
                await axios.put(`${API_URL}/ats/applicants/${applicantId}/languages/${editId}`, form, { headers });
                toast.success("Language capability updated.");
            } else {
                await axios.post(`${API_URL}/ats/applicants/${applicantId}/languages`, form, { headers });
                toast.success("Language capability added.");
            }
            resetForm();
            fetchLanguages();
        } catch (err) {
            console.error("Save error", err);
            toast.error(err.response?.data?.message || "Failed to save language entry.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin text-primary h-6 w-6" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Languages className="h-5 w-5 text-primary" />
                    <span>Language Proficiencies</span>
                </h3>
                {!isEditing && (
                    <button 
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-theme shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Language</span>
                    </button>
                )}
            </div>

            {isEditing && (
                <form onSubmit={handleSubmit} className="p-4 bg-background-muted border border-border rounded-theme space-y-4">
                    <h4 className="text-sm font-bold text-foreground">{editId ? 'Edit Language Proficiency' : 'Add Language Proficiency'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-foreground-muted">Language Name *</label>
                            <input 
                                required
                                value={form.languageName}
                                onChange={(e) => setForm({...form, languageName: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                placeholder="e.g. Spanish / Mandarin"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-6 mt-2">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={form.canRead}
                                onChange={(e) => setForm({...form, canRead: e.target.checked})}
                                className="w-4 h-4 text-primary focus:ring-primary/20 rounded border-border"
                            />
                            <span>Can Read</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={form.canSpeak}
                                onChange={(e) => setForm({...form, canSpeak: e.target.checked})}
                                className="w-4 h-4 text-primary focus:ring-primary/20 rounded border-border"
                            />
                            <span>Can Speak</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={form.canWrite}
                                onChange={(e) => setForm({...form, canWrite: e.target.checked})}
                                className="w-4 h-4 text-primary focus:ring-primary/20 rounded border-border"
                            />
                            <span>Can Write</span>
                        </label>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button 
                            type="button" 
                            onClick={resetForm}
                            className="px-4 py-2 border border-border rounded-theme text-xs font-semibold hover:bg-background-muted bg-background text-foreground transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-theme text-xs flex items-center gap-1.5 shadow"
                        >
                            {submitting && <Loader2 className="animate-spin h-3 w-3" />}
                            <Languages className="h-3.5 w-3.5" />
                            <span>Save Language</span>
                        </button>
                    </div>
                </form>
            )}

            {languages.length === 0 ? (
                <p className="text-sm text-foreground-muted italic">No language skills recorded.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {languages.map((lang) => (
                        <div key={lang.id} className="p-4 bg-card border border-border rounded-theme flex justify-between items-start hover:border-primary/40 transition-colors">
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground">{lang.languageName}</h4>
                                <div className="flex gap-3 text-xs text-foreground-muted mt-1 font-semibold">
                                    <span className={lang.canRead ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded" : "opacity-40"}>Read</span>
                                    <span className={lang.canSpeak ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded" : "opacity-40"}>Speak</span>
                                    <span className={lang.canWrite ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded" : "opacity-40"}>Write</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => handleEditClick(lang)}
                                    className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-primary rounded-theme transition-colors"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(lang.id)}
                                    className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-destructive rounded-theme transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AtsLanguageTab;
