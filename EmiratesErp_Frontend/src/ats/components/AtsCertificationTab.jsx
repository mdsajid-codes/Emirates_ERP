import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Edit2, Trash2, Save, Award } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsCertificationTab = ({ applicantId }) => {
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        certificationName: '',
        completedDate: '',
        comments: ''
    });

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchCertifications = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ats/applicants/${applicantId}/certifications`, { headers });
            setCertifications(res.data || []);
        } catch (e) {
            console.error("Failed to fetch certifications", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (applicantId) {
            fetchCertifications();
        }
    }, [applicantId]);

    const resetForm = () => {
        setForm({
            certificationName: '',
            completedDate: '',
            comments: ''
        });
        setIsEditing(false);
        setEditId(null);
    };

    const handleEditClick = (cert) => {
        setIsEditing(true);
        setEditId(cert.id);
        setForm({
            certificationName: cert.certificationName || '',
            completedDate: cert.completedDate || '',
            comments: cert.comments || ''
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this certification?")) return;
        try {
            await axios.delete(`${API_URL}/ats/applicants/${applicantId}/certifications/${id}`, { headers });
            toast.success("Certification deleted.");
            fetchCertifications();
        } catch (err) {
            toast.error("Failed to delete certification.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                completedDate: form.completedDate || null
            };

            if (editId) {
                await axios.put(`${API_URL}/ats/applicants/${applicantId}/certifications/${editId}`, payload, { headers });
                toast.success("Certification updated.");
            } else {
                await axios.post(`${API_URL}/ats/applicants/${applicantId}/certifications`, payload, { headers });
                toast.success("Certification added.");
            }
            resetForm();
            fetchCertifications();
        } catch (err) {
            console.error("Save error", err);
            toast.error(err.response?.data?.message || "Failed to save certification.");
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
                    <Award className="h-5 w-5 text-primary" />
                    <span>Certifications & Licenses</span>
                </h3>
                {!isEditing && (
                    <button 
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-theme shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Certification</span>
                    </button>
                )}
            </div>

            {isEditing && (
                <form onSubmit={handleSubmit} className="p-4 bg-background-muted border border-border rounded-theme space-y-4">
                    <h4 className="text-sm font-bold text-foreground">{editId ? 'Edit Certification' : 'Add Certification'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Certification Name *</label>
                            <input 
                                required
                                value={form.certificationName}
                                onChange={(e) => setForm({...form, certificationName: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Completed Date</label>
                            <input 
                                type="date"
                                value={form.completedDate}
                                onChange={(e) => setForm({...form, completedDate: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-foreground-muted">Comments / Details</label>
                            <textarea 
                                value={form.comments}
                                onChange={(e) => setForm({...form, comments: e.target.value})}
                                rows="2"
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
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
                            <Award className="h-3.5 w-3.5" />
                            <span>Save Certification</span>
                        </button>
                    </div>
                </form>
            )}

            {certifications.length === 0 ? (
                <p className="text-sm text-foreground-muted italic">No certifications recorded.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {certifications.map((cert) => (
                        <div key={cert.id} className="p-4 bg-card border border-border rounded-theme flex justify-between items-start hover:border-primary/40 transition-colors">
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground">{cert.certificationName}</h4>
                                {cert.completedDate && (
                                    <p className="text-xs text-foreground-muted">
                                        Completed: {cert.completedDate}
                                    </p>
                                )}
                                {cert.comments && (
                                    <p className="text-xs text-foreground-muted mt-1 italic">{cert.comments}</p>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => handleEditClick(cert)}
                                    className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-primary rounded-theme transition-colors"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(cert.id)}
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

export default AtsCertificationTab;
