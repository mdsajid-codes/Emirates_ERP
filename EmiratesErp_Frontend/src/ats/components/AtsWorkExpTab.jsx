import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Edit2, Trash2, Save, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsWorkExpTab = ({ applicantId }) => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        employerName: '',
        jobTitle: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        location: '',
        description: ''
    });

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchExperiences = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ats/applicants/${applicantId}/work-experiences`, { headers });
            setExperiences(res.data || []);
        } catch (e) {
            console.error("Failed to fetch experiences", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (applicantId) {
            fetchExperiences();
        }
    }, [applicantId]);

    const resetForm = () => {
        setForm({
            employerName: '',
            jobTitle: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            location: '',
            description: ''
        });
        setIsEditing(false);
        setEditId(null);
    };

    const handleEditClick = (exp) => {
        setIsEditing(true);
        setEditId(exp.id);
        setForm({
            employerName: exp.employerName || '',
            jobTitle: exp.jobTitle || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            isCurrent: exp.isCurrent || false,
            location: exp.location || '',
            description: exp.description || ''
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this work experience entry?")) return;
        try {
            await axios.delete(`${API_URL}/ats/applicants/${applicantId}/work-experiences/${id}`, { headers });
            toast.success("Work experience entry deleted.");
            fetchExperiences();
        } catch (err) {
            toast.error("Failed to delete experience.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                endDate: form.isCurrent ? null : form.endDate || null
            };

            if (editId) {
                await axios.put(`${API_URL}/ats/applicants/${applicantId}/work-experiences/${editId}`, payload, { headers });
                toast.success("Work experience updated.");
            } else {
                await axios.post(`${API_URL}/ats/applicants/${applicantId}/work-experiences`, payload, { headers });
                toast.success("Work experience added.");
            }
            resetForm();
            fetchExperiences();
        } catch (err) {
            console.error("Save error", err);
            toast.error(err.response?.data?.message || "Failed to save experience entry.");
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
                    <Briefcase className="h-5 w-5 text-primary" />
                    <span>Work Experience</span>
                </h3>
                {!isEditing && (
                    <button 
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-theme shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Experience</span>
                    </button>
                )}
            </div>

            {isEditing && (
                <form onSubmit={handleSubmit} className="p-4 bg-background-muted border border-border rounded-theme space-y-4">
                    <h4 className="text-sm font-bold text-foreground">{editId ? 'Edit Work History' : 'Add Work History'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Employer Name *</label>
                            <input 
                                required
                                value={form.employerName}
                                onChange={(e) => setForm({...form, employerName: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Job Title *</label>
                            <input 
                                required
                                value={form.jobTitle}
                                onChange={(e) => setForm({...form, jobTitle: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Start Date *</label>
                            <input 
                                required
                                type="date"
                                value={form.startDate}
                                onChange={(e) => setForm({...form, startDate: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">End Date</label>
                            <input 
                                type="date"
                                disabled={form.isCurrent}
                                value={form.endDate}
                                onChange={(e) => setForm({...form, endDate: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground disabled:opacity-50"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-foreground-muted">Location</label>
                            <input 
                                value={form.location}
                                onChange={(e) => setForm({...form, location: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                placeholder="e.g. New York, NY (Remote)"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-foreground-muted">Description / Duties</label>
                            <textarea 
                                value={form.description}
                                onChange={(e) => setForm({...form, description: e.target.value})}
                                rows="3"
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={form.isCurrent}
                                onChange={(e) => setForm({...form, isCurrent: e.target.checked})}
                                className="w-4 h-4 text-primary focus:ring-primary/20 rounded border-border"
                            />
                            <span>Is Current Job?</span>
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
                            <Save className="h-3.5 w-3.5" />
                            <span>Save Experience</span>
                        </button>
                    </div>
                </form>
            )}

            {experiences.length === 0 ? (
                <p className="text-sm text-foreground-muted italic">No work history recorded.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {experiences.map((exp) => (
                        <div key={exp.id} className="p-4 bg-card border border-border rounded-theme flex justify-between items-start hover:border-primary/40 transition-colors">
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground">{exp.jobTitle}</h4>
                                <p className="text-sm text-foreground-muted">{exp.employerName} — {exp.location || 'N/A'}</p>
                                <p className="text-xs text-foreground-muted">
                                    {exp.startDate} to {exp.isCurrent ? 'Present' : exp.endDate}
                                </p>
                                {exp.description && (
                                    <p className="text-xs text-foreground-muted mt-2 bg-background-muted p-2 rounded border border-border/40 whitespace-pre-wrap">{exp.description}</p>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => handleEditClick(exp)}
                                    className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-primary rounded-theme transition-colors"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(exp.id)}
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

export default AtsWorkExpTab;
