import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsDocTypesSettingsTab = () => {
    const [docTypes, setDocTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [typeName, setTypeName] = useState('');

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchDocTypes = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ats/document-types/list`, { headers });
            setDocTypes(res.data?.content || res.data || []);
        } catch (e) {
            console.error("Failed to load document types", e);
            toast.error("Failed to load document types list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocTypes();
    }, []);

    const handleAddDocType = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { name: typeName };
            await axios.post(`${API_URL}/ats/document-types`, payload, { headers });
            toast.success("Document type added.");
            setTypeName('');
            fetchDocTypes();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add document type.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDocType = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`${API_URL}/ats/document-types/${id}`, { headers });
            toast.success("Document type deleted.");
            fetchDocTypes();
        } catch (e) {
            toast.error("Failed to delete document type.");
        }
    };

    if (loading && docTypes.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="bg-card border border-border rounded-theme p-5 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-foreground">Add new Document Type</h3>
                <form onSubmit={handleAddDocType} className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-foreground-muted">Type Name *</label>
                        <input 
                            required
                            value={typeName}
                            onChange={(e) => setTypeName(e.target.value)}
                            className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            placeholder="e.g. Resume, Visa Copy"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-theme hover:bg-primary/90 transition-colors shadow disabled:opacity-50"
                    >
                        {submitting && <Loader2 className="animate-spin h-3 w-3" />}
                        <Plus className="h-4 w-4" />
                        <span>Add Doc Type</span>
                    </button>
                </form>
            </div>

            {/* List/Display Section */}
            <div className="lg:col-span-2 bg-card border border-border rounded-theme p-5 shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
                <h3 className="text-lg font-bold text-foreground mb-4">Master list of Document Types</h3>
                <div className="overflow-y-auto flex-1 divide-y divide-border">
                    {docTypes.length === 0 ? (
                        <p className="text-xs text-foreground-muted py-4">No document types recorded.</p>
                    ) : (
                        docTypes.map(dt => (
                            <div key={dt.id} className="flex justify-between items-center py-3">
                                <h4 className="font-bold text-foreground text-sm">{dt.name}</h4>
                                <button onClick={() => handleDeleteDocType(dt.id)} className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-destructive rounded-theme transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AtsDocTypesSettingsTab;
