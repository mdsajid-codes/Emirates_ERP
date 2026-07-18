import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Trash2, FileText, Upload, Save, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsDocumentTab = ({ applicantId }) => {
    const [documents, setDocuments] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [rawFile, setRawFile] = useState(null);

    const [form, setForm] = useState({
        title: '',
        fileName: '',
        filePath: '',
        documentTypeId: '',
        comments: ''
    });

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const loadLookups = async () => {
        try {
            const res = await axios.get(`${API_URL}/ats/document-types/list`, { headers });
            setDocumentTypes(res.data?.content || res.data || []);
        } catch (e) {
            console.error("Failed to load document types", e);
        }
    };

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ats/applicants/${applicantId}/documents`, { headers });
            setDocuments(res.data || []);
        } catch (e) {
            console.error("Failed to fetch documents", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (applicantId) {
            loadLookups();
            fetchDocuments();
        }
    }, [applicantId]);

    const resetForm = () => {
        setForm({
            title: '',
            fileName: '',
            filePath: '',
            documentTypeId: '',
            comments: ''
        });
        setRawFile(null);
        setIsAdding(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setRawFile(file);
        setForm(prev => ({
            ...prev,
            fileName: file.name,
            filePath: `/uploads/ats/applicant_${applicantId}/${file.name}`,
            title: prev.title || file.name.split('.')[0]
        }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        try {
            await axios.delete(`${API_URL}/ats/applicants/${applicantId}/documents/${id}`, { headers });
            toast.success("Document deleted.");
            fetchDocuments();
        } catch (err) {
            toast.error("Failed to delete document.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let finalFilePath = form.filePath;
            if (rawFile) {
                const formData = new FormData();
                formData.append("file", rawFile);
                const uploadRes = await axios.post(`${API_URL}/ats/applicants/${applicantId}/documents/upload`, formData, {
                    headers: {
                        ...headers,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                finalFilePath = uploadRes.data.filePath;
            }

            const payload = {
                ...form,
                filePath: finalFilePath,
                documentTypeId: parseInt(form.documentTypeId)
            };

            await axios.post(`${API_URL}/ats/applicants/${applicantId}/documents`, payload, { headers });
            toast.success("Document uploaded successfully.");
            resetForm();
            fetchDocuments();
        } catch (err) {
            console.error("Upload error", err);
            toast.error(err.response?.data?.message || "Failed to upload document.");
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
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Applicant Documents</span>
                </h3>
                {!isAdding && (
                    <button 
                        onClick={() => { resetForm(); setIsAdding(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-theme shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Upload Document</span>
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="p-4 bg-background-muted border border-border rounded-theme space-y-4">
                    <h4 className="text-sm font-bold text-foreground">Upload New Document</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Document Title *</label>
                            <input 
                                required
                                value={form.title}
                                onChange={(e) => setForm({...form, title: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                placeholder="e.g. Resume, Cover Letter"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted">Document Type *</label>
                            <select 
                                required
                                value={form.documentTypeId}
                                onChange={(e) => setForm({...form, documentTypeId: e.target.value})}
                                className="w-full mt-1 px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                            >
                                <option value="">Select Document Type</option>
                                {documentTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-foreground-muted block mb-1">Select File *</label>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border hover:border-primary/60 hover:bg-background rounded-theme text-xs font-semibold text-foreground-muted cursor-pointer transition-all">
                                    <Upload className="h-4 w-4 text-primary" />
                                    <span>Browse File</span>
                                    <input 
                                        type="file"
                                        required
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                {form.fileName && (
                                    <span className="text-xs font-bold text-foreground bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                        {form.fileName}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-foreground-muted">Comments</label>
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
                            disabled={submitting || !form.fileName}
                            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-theme text-xs flex items-center gap-1.5 shadow disabled:opacity-50"
                        >
                            {submitting && <Loader2 className="animate-spin h-3 w-3" />}
                            <Save className="h-3.5 w-3.5" />
                            <span>Upload</span>
                        </button>
                    </div>
                </form>
            )}

            {documents.length === 0 ? (
                <p className="text-sm text-foreground-muted italic">No documents uploaded.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {documents.map((doc) => (
                        <div key={doc.id} className="p-4 bg-card border border-border rounded-theme flex justify-between items-center hover:border-primary/40 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 text-primary rounded-theme border border-primary/20">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-foreground">{doc.title}</h4>
                                    <p className="text-xs text-foreground-muted">
                                        Type: {doc.documentTypeName} • {doc.fileName}
                                    </p>
                                    {doc.comments && (
                                        <p className="text-xs text-foreground-muted mt-1 italic">{doc.comments}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                <a 
                                    href={`${API_URL.replace('/api', '')}${doc.filePath}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-primary rounded-theme transition-colors flex items-center justify-center"
                                    title="Preview Document"
                                >
                                    <Eye className="h-4 w-4" />
                                </a>
                                <button 
                                    onClick={() => handleDelete(doc.id)}
                                    className="p-1.5 hover:bg-background-muted border border-border text-foreground-muted hover:text-destructive rounded-theme transition-colors"
                                    title="Delete Document"
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

export default AtsDocumentTab;
