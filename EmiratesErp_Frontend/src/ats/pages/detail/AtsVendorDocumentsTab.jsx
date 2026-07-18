import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FileText, Download, Plus, X, Upload, Save, Loader2, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorDocumentsTab = ({ vendorId }) => {
    const [documents, setDocuments] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [rawFile, setRawFile] = useState(null);

    const emptyForm = {
        title: '',
        fileName: '',
        filePath: '',
        documentTypeId: '',
        comments: ''
    };
    const [form, setForm] = useState(emptyForm);

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/ats/vendors/${vendorId}/documents`, { headers });
            setDocuments(res.data || []);
        } catch (err) {
            console.error("Error loading vendor documents:", err);
            toast.error("Failed to load documents.");
        } finally {
            setLoading(false);
        }
    };

    const fetchDocumentTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/ats/document-types/list`, { headers });
            setDocumentTypes(res.data?.content || res.data || []);
        } catch (e) {
            console.error("Failed to load document types", e);
        }
    };

    useEffect(() => {
        if (vendorId) {
            fetchDocs();
            fetchDocumentTypes();
        }
    }, [vendorId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setRawFile(file);
        setForm(prev => ({
            ...prev,
            fileName: file.name,
            filePath: `/uploads/ats/vendor_${vendorId}/${file.name}`,
            title: prev.title || file.name.split('.')[0]
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            let finalFilePath = form.filePath;
            if (rawFile) {
                const formData = new FormData();
                formData.append("file", rawFile);
                const uploadRes = await axios.post(`${API_URL}/ats/vendors/${vendorId}/documents/upload`, formData, {
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

            await axios.post(`${API_URL}/ats/vendors/${vendorId}/documents`, payload, { headers });
            toast.success("Document uploaded successfully.");
            setIsAdding(false);
            setRawFile(null);
            setForm(emptyForm);
            fetchDocs();
        } catch (err) {
            console.error("Upload error", err);
            toast.error(err.response?.data?.message || "Failed to upload document.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.delete(`${API_URL}/ats/vendors/${vendorId}/documents/${id}`, { headers });
            toast.success("Document deleted.");
            fetchDocs();
        } catch (err) {
            toast.error("Failed to delete document.");
        }
    };

    const handleDownload = (doc) => {
        if (!doc.filePath) {
            toast.error("Document path is missing.");
            return;
        }
        const fileUrl = `${API_URL.replace('/api', '')}${doc.filePath}`;
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return <div className="text-center py-6 text-foreground-muted text-sm font-semibold">Loading documents...</div>;
    }

    return (
        <div className="space-y-4 font-sans text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">Vendor Documents</h3>
                {!isAdding && (
                    <button
                        onClick={() => { setIsAdding(true); setRawFile(null); setForm(emptyForm); }}
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-theme hover:bg-primary/90 shadow-sm transition-all"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Document
                    </button>
                )}
            </div>

            {/* INLINE FORM */}
            {isAdding && (
                <form onSubmit={handleFormSubmit} className="p-5 bg-background-muted/50 border border-border rounded-theme space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground">Upload New Document</h4>
                        <button
                            type="button"
                            onClick={() => { setIsAdding(false); setRawFile(null); setForm(emptyForm); }}
                            className="p-1.5 rounded-full hover:bg-background-muted text-foreground-muted hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-foreground-muted mb-1">Document Title *</label>
                            <input 
                                required
                                value={form.title}
                                onChange={(e) => setForm({...form, title: e.target.value})}
                                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground focus:border-primary"
                                placeholder="e.g. Agreement, Contract"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-foreground-muted mb-1">Document Type *</label>
                            <select 
                                required
                                value={form.documentTypeId}
                                onChange={(e) => setForm({...form, documentTypeId: e.target.value})}
                                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground cursor-pointer focus:border-primary"
                            >
                                <option value="">Select Document Type</option>
                                {documentTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-foreground-muted mb-1">Select File *</label>
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
                            <label className="block text-xs font-bold text-foreground-muted mb-1">Comments</label>
                            <textarea 
                                value={form.comments}
                                onChange={(e) => setForm({...form, comments: e.target.value})}
                                rows="2"
                                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground resize-none focus:border-primary"
                                placeholder="Comments about the document..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button 
                            type="button" 
                            onClick={() => { setIsAdding(false); setRawFile(null); setForm(emptyForm); }}
                            className="px-4 py-2 border border-border rounded-theme text-xs font-semibold hover:bg-background-muted bg-background text-foreground transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting || !form.fileName}
                            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-theme text-xs flex items-center gap-1.5 shadow disabled:opacity-50 hover:bg-primary/90"
                        >
                            {submitting && <Loader2 className="animate-spin h-3 w-3" />}
                            <Save className="h-3.5 w-3.5" />
                            <span>Upload</span>
                        </button>
                    </div>
                </form>
            )}

            {/* DOCUMENTS GRID */}
            {documents.length === 0 && !isAdding ? (
                <div className="text-center py-10 text-foreground-muted text-sm">
                    No documents registered for this vendor. Click <span className="font-bold text-foreground">+ Add Document</span> to upload one.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                        <div key={doc.id} className="p-4 rounded-theme border border-border bg-background/50 hover:border-border/80 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                                <div>
                                    <span className="font-bold text-foreground text-sm block truncate max-w-[200px]" title={doc.fileName}>
                                        {doc.title || doc.fileName}
                                    </span>
                                    <span className="text-xs text-foreground-muted block mt-0.5">
                                        Type: {doc.documentTypeName || 'Other'}
                                    </span>
                                    {doc.comments && (
                                        <span className="text-[10px] text-foreground-muted italic block mt-0.5 truncate max-w-[200px]">
                                            "{doc.comments}"
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => handleDownload(doc)}
                                    className="p-1.5 border border-border rounded-theme text-foreground-muted hover:text-primary hover:bg-background transition-all"
                                    title="Download Document"
                                >
                                    <Download className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="p-1.5 border border-border rounded-theme text-foreground-muted hover:text-destructive hover:bg-background transition-all"
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

export default AtsVendorDocumentsTab;
