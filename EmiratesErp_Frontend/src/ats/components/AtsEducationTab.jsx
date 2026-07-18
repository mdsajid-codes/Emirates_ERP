import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Edit2, Trash2, Save, X, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAtsGeo } from '../hooks/useAtsGeo';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsEducationTab = ({ applicantId }) => {
    const [educations, setEducations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [degrees, setDegrees] = useState([]);
    const {
        countries,
        states,
        setSelectedCountryName
    } = useAtsGeo();
    
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        degreeId: '',
        schoolName: '',
        yearCompleted: '',
        majorStudy: '',
        minorStudy: '',
        gpa: '',
        countryId: '',
        stateId: '',
        city: '',
        higherEducation: false
    });

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const loadLookups = async () => {
        try {
            const [degRes] = await Promise.all([
                axios.get(`${API_URL}/ats/degrees/list`, { headers })
            ]);
            setDegrees(degRes.data?.content || degRes.data || []);
        } catch (e) {
            console.error("Failed to load lookups", e);
        }
    };

    const fetchEducations = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ats/applicants/${applicantId}/educations`, { headers });
            setEducations(res.data || []);
        } catch (e) {
            console.error("Failed to fetch educations", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (applicantId) {
            loadLookups();
            fetchEducations();
        }
    }, [applicantId]);

    const resetForm = () => {
        setForm({
            degreeId: '',
            schoolName: '',
            yearCompleted: '',
            majorStudy: '',
            minorStudy: '',
            gpa: '',
            countryId: '',
            stateId: '',
            city: '',
            higherEducation: false
        });
        setSelectedCountryName('');
        setIsEditing(false);
        setEditId(null);
    };

    const handleEditClick = (edu) => {
        setIsEditing(true);
        setEditId(edu.id);
        setForm({
            degreeId: edu.degreeId || '',
            schoolName: edu.schoolName || '',
            yearCompleted: edu.yearCompleted || '',
            majorStudy: edu.majorStudy || '',
            minorStudy: edu.minorStudy || '',
            gpa: edu.gpa || '',
            countryId: edu.countryId || '',
            stateId: edu.stateId || '',
            city: edu.city || '',
            higherEducation: edu.higherEducation || false
        });
        setSelectedCountryName(edu.countryName || '');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this education entry?")) return;
        try {
            await axios.delete(`${API_URL}/ats/applicants/${applicantId}/educations/${id}`, { headers });
            toast.success("Education entry deleted.");
            fetchEducations();
        } catch (err) {
            toast.error("Failed to delete education.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                degreeId: parseInt(form.degreeId),
                countryId: parseInt(form.countryId),
                stateId: form.stateId ? parseInt(form.stateId) : null,
                yearCompleted: form.yearCompleted ? parseInt(form.yearCompleted) : null,
                gpa: form.gpa ? parseFloat(form.gpa) : null
            };

            if (editId) {
                await axios.put(`${API_URL}/ats/applicants/${applicantId}/educations/${editId}`, payload, { headers });
                toast.success("Education updated.");
            } else {
                await axios.post(`${API_URL}/ats/applicants/${applicantId}/educations`, payload, { headers });
                toast.success("Education added.");
            }
            resetForm();
            fetchEducations();
        } catch (err) {
            console.error("Save error", err);
            toast.error(err.response?.data?.message || "Failed to save education entry.");
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
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <span>Education Background</span>
                </h3>
                {!isEditing && (
                    <button 
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-theme shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Education</span>
                    </button>
                )}
            </div>

            {isEditing && (
                <form onSubmit={handleSubmit} className="p-4 bg-background-muted border border-border rounded-theme space-y-4">
                    <h4 className="text-sm font-bold text-foreground">{editId ? 'Edit Education' : 'Add New Education'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Degree *</label>
                            <select 
                                required
                                value={form.degreeId}
                                onChange={(e) => setForm({...form, degreeId: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            >
                                <option value="">Select Degree</option>
                                {degrees.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">School / University *</label>
                            <input 
                                required
                                value={form.schoolName}
                                onChange={(e) => setForm({...form, schoolName: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Major</label>
                            <input 
                                value={form.majorStudy}
                                onChange={(e) => setForm({...form, majorStudy: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Minor</label>
                            <input 
                                value={form.minorStudy}
                                onChange={(e) => setForm({...form, minorStudy: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">GPA</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={form.gpa}
                                onChange={(e) => setForm({...form, gpa: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Year Completed</label>
                            <input 
                                type="number"
                                value={form.yearCompleted}
                                onChange={(e) => setForm({...form, yearCompleted: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Country *</label>
                            <select 
                                required
                                value={form.countryId}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const matched = countries.find(c => String(c.id) === String(val));
                                    setForm({...form, countryId: val, stateId: ''});
                                    setSelectedCountryName(matched ? matched.name : '');
                                }}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            >
                                <option value="">Select Country</option>
                                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">State</label>
                            <select 
                                value={form.stateId}
                                onChange={(e) => setForm({...form, stateId: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            >
                                <option value="">Select State</option>
                                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">City</label>
                            <input 
                                value={form.city}
                                onChange={(e) => setForm({...form, city: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={form.higherEducation}
                                onChange={(e) => setForm({...form, higherEducation: e.target.checked})}
                                className="w-4 h-4 text-primary focus:ring-primary/20 rounded border-border"
                            />
                            <span>Is Higher Education?</span>
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
                            <span>Save Entry</span>
                        </button>
                    </div>
                </form>
            )}

            {educations.length === 0 ? (
                <p className="text-sm text-foreground-muted italic">No education details recorded.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {educations.map((edu) => (
                        <div key={edu.id} className="p-4 bg-card border border-border rounded-theme flex justify-between items-start hover:border-primary/40 transition-colors">
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground">{edu.degreeName}</h4>
                                <p className="text-sm text-foreground-muted">{edu.schoolName} — {edu.majorStudy || 'N/A'}</p>
                                <p className="text-xs text-foreground-muted">
                                    {edu.city && `${edu.city}, `}{edu.stateName}, {edu.countryName}
                                    {edu.yearCompleted && ` • Completed in ${edu.yearCompleted}`}
                                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => handleEditClick(edu)}
                                    className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-primary rounded-theme transition-colors"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(edu.id)}
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

export default AtsEducationTab;
