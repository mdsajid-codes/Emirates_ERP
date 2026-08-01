import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Upload, Download, Eye, Edit, Trash2, Plus, Loader, AlertCircle, X, CheckCircle, ShieldCheck, XCircle, ChevronDown, Check } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Custom Container Dropdown Component
const CustomSelect = ({ value, options, onChange, placeholder = "Select a type..." }) => {
    const [open, setOpen] = useState(false);
    const selectedOption = options.find(o => String(o.id || o.value) === String(value));

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full bg-background border border-border hover:border-primary/50 rounded-lg px-2.5 py-1.5 text-xs text-foreground flex items-center justify-between transition-all shadow-xs"
            >
                <span className="truncate font-medium">{selectedOption ? (selectedOption.name || selectedOption.label) : placeholder}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-foreground-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl py-1 z-50 max-h-40 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-100">
                        {options.length > 0 ? (
                            options.map((opt) => {
                                const optVal = opt.id || opt.value;
                                const optLabel = opt.name || opt.label;
                                const isSelected = String(optVal) === String(value);
                                return (
                                    <button
                                        key={optVal}
                                        type="button"
                                        onClick={() => {
                                            onChange(optVal);
                                            setOpen(false);
                                        }}
                                        className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between transition-colors ${
                                            isSelected 
                                                ? 'bg-primary/10 text-primary font-bold' 
                                                : 'text-foreground hover:bg-background-muted'
                                        }`}
                                    >
                                        <span className="truncate">{optLabel}</span>
                                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-2 text-xs text-foreground-muted text-center">No options available</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// Modal Component for Adding New Document Type
const AddDocumentTypeModal = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setErr('Document Type name is required.');
            return;
        }
        setLoading(true);
        setErr('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/base/document-types`, { name: name.trim() }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            onSuccess(response.data);
            setName('');
            onClose();
        } catch (error) {
            console.error("Error creating document type:", error);
            setErr(error.response?.data?.message || 'Failed to create document type.');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-[110] p-3">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2.5 border-b border-border/80 flex justify-between items-center bg-background/50">
                    <h3 className="text-xs font-bold text-foreground">Add New Document Type</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg text-foreground-muted hover:bg-background-muted hover:text-foreground transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-3.5 space-y-2.5">
                        <div>
                            <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">
                                Document Type Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Passport, Visa, Emirates ID"
                                required
                                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                            />
                        </div>
                        {err && (
                            <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-medium">
                                {err}
                            </div>
                        )}
                    </div>
                    <div className="px-3.5 py-2.5 border-t border-border bg-background-muted/40 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-border hover:bg-background-muted text-xs font-semibold text-foreground transition-colors" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs" disabled={loading}>
                            {loading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                            <span>Add Document Type</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// Inline Full-Width Form for Uploading Document
const UploadDocumentPanel = ({ isOpen, onClose, onSave, loading, documentTypes, onAddDocTypeClick }) => {
    const [file, setFile] = useState(null);
    const [docTypeId, setDocTypeId] = useState('');
    const [documentId, setDocumentId] = useState('');
    const [registrationDate, setRegistrationDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [remarks, setRemarks] = useState('');
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setDocTypeId('');
            setDocumentId('');
            setRegistrationDate('');
            setEndDate('');
            setRemarks('');
            setModalError('');
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) {
            setModalError('Please select a file to upload.');
            return;
        }
        if (!docTypeId) {
            setModalError('Please select a document type.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('docTypeId', docTypeId);
        formData.append('remarks', remarks);
        if (documentId) formData.append('documentId', documentId);
        if (registrationDate) formData.append('registrationDate', registrationDate);
        if (endDate) formData.append('endDate', endDate);
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="bg-card rounded-2xl border border-border p-3.5 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground">Upload New Document</h3>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-background-muted text-foreground-muted hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                                Document Type <span className="text-red-500">*</span>
                            </label>
                            {onAddDocTypeClick && (
                                <button
                                    type="button"
                                    onClick={onAddDocTypeClick}
                                    className="text-[10px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                    + Add
                                </button>
                            )}
                        </div>
                        <CustomSelect
                            value={docTypeId}
                            options={documentTypes}
                            onChange={(val) => setDocTypeId(val)}
                            placeholder="Select document type..."
                        />
                    </div>
                    <div>
                        <label htmlFor="file" className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">
                            Choose File <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="file"
                            type="file"
                            onChange={handleFileChange}
                            required
                            className="w-full text-xs text-foreground bg-background border border-border rounded-lg px-2.5 py-1 file:mr-2 file:py-0.5 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        />
                    </div>
                    <div>
                        <label htmlFor="documentId" className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">
                            Document ID (Optional)
                        </label>
                        <input
                            id="documentId"
                            value={documentId}
                            onChange={(e) => setDocumentId(e.target.value)}
                            placeholder="e.g. DOC-9921"
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="registrationDate" className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">
                            Registration Date (Optional)
                        </label>
                        <input
                            id="registrationDate"
                            type="date"
                            value={registrationDate}
                            onChange={(e) => setRegistrationDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label htmlFor="endDate" className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">
                            End / Expiry Date (Optional)
                        </label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <label htmlFor="remarks" className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">
                            Remarks (Optional)
                        </label>
                        <input
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Add notes or description..."
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {modalError && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-medium flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{modalError}</span>
                    </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg border border-border hover:bg-background-muted text-xs font-semibold text-foreground transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        disabled={loading}
                    >
                        {loading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                        <span>Upload Document</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

// Inline Full-Width Form for Editing Document
const EditDocumentPanel = ({ isOpen, onClose, onSave, document, loading, documentTypes, onAddDocTypeClick }) => {
    const [formData, setFormData] = useState({ docTypeId: '', documentId: '', registrationDate: '', endDate: '', remarks: '', verified: false });

    useEffect(() => {
        if (document) {
            setFormData({
                docTypeId: document.documentType?.id || '',
                documentId: document.documentId || '',
                registrationDate: document.registrationDate ? document.registrationDate.split('T')[0] : '',
                endDate: document.endDate ? document.endDate.split('T')[0] : '',
                remarks: document.remarks || '',
                verified: document.verified || false,
            });
        }
    }, [document]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="bg-card rounded-2xl border border-border p-3.5 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground">Edit Document Details</h3>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-background-muted text-foreground-muted hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Document Type</label>
                            {onAddDocTypeClick && (
                                <button
                                    type="button"
                                    onClick={onAddDocTypeClick}
                                    className="text-[10px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                    + Add
                                </button>
                            )}
                        </div>
                        <CustomSelect
                            value={formData.docTypeId}
                            options={documentTypes}
                            onChange={(val) => setFormData(prev => ({ ...prev, docTypeId: val }))}
                            placeholder="Select type..."
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-documentId" className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Document ID</label>
                        <input
                            id="edit-documentId"
                            name="documentId"
                            value={formData.documentId}
                            onChange={handleChange}
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-registrationDate" className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Registration Date</label>
                        <input
                            id="edit-registrationDate"
                            name="registrationDate"
                            type="date"
                            value={formData.registrationDate}
                            onChange={handleChange}
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-endDate" className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">End Date</label>
                        <input
                            id="edit-endDate"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            id="edit-verified"
                            type="checkbox"
                            name="verified"
                            checked={formData.verified}
                            onChange={handleChange}
                            className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="edit-verified" className="text-xs font-medium text-foreground cursor-pointer select-none">
                            Mark as Verified
                        </label>
                    </div>
                    <div className="md:col-span-3">
                        <label htmlFor="edit-remarks" className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Remarks</label>
                        <input
                            id="edit-remarks"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            placeholder="Add notes..."
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg border border-border hover:bg-background-muted text-xs font-semibold text-foreground transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        disabled={loading}
                    >
                        {loading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                        <span>Save Changes</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

const Documents = ({ employee }) => {
    const [documents, setDocuments] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [isAddDocTypeModalOpen, setIsAddDocTypeModalOpen] = useState(false);

    const fetchDocumentTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/base/document-types`, { headers: { "Authorization": `Bearer ${token}` } });
            if (Array.isArray(response.data)) {
                setDocumentTypes(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch document types", err);
            setError('Could not load document types. Please refresh.');
        }
    };

    const fetchDocuments = async () => {
        if (!employee?.employeeCode) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/employee-documents/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } });
            setDocuments(response.data);
        } catch (err) {
            setError('Failed to fetch documents.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
        fetchDocumentTypes();
    }, [employee]);

    const handleUpload = async (formData) => {
        setModalLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/employee-documents/${employee.employeeCode}/upload`, formData, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
            setIsUploadModalOpen(false);
            fetchDocuments();
        } catch (err) {
            alert('Upload failed. Please try again.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdate = async (documentData) => {
        setModalLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/employee-documents/${editingDocument.id}`, documentData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            setIsEditModalOpen(false);
            fetchDocuments();
        } catch (err) {
            alert('Update failed. Please try again.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (documentId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/employee-documents/${documentId}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchDocuments();
            } catch (err) {
                alert('Failed to delete document.');
            }
        }
    };

    const handleView = async (documentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/employee-documents/view/${documentId}`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: response.headers['content-type'] });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        } catch (err) {
            alert('Could not open the document for viewing.');
            console.error(err);
        }
    };

    const handleDownload = async (documentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/employee-documents/download/${documentId}`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let fileName = `document-${documentId}`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length === 2) fileName = filenameMatch[1];
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Could not download the document.');
            console.error(err);
        }
    };

    if (!employee) return <div className="text-center text-slate-500">Please select an employee to view documents.</div>;

    return (
        <div className="space-y-2.5">
            <div className="flex justify-end">
                <button 
                    onClick={() => {
                        setIsEditModalOpen(false);
                        setIsUploadModalOpen(!isUploadModalOpen);
                    }} 
                    className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                    {isUploadModalOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    <span>{isUploadModalOpen ? 'Cancel Upload' : 'Upload Document'}</span>
                </button>
            </div>

            <UploadDocumentPanel 
                isOpen={isUploadModalOpen} 
                onClose={() => setIsUploadModalOpen(false)} 
                onSave={handleUpload} 
                loading={modalLoading} 
                documentTypes={documentTypes} 
                onAddDocTypeClick={() => setIsAddDocTypeModalOpen(true)}
            />

            {editingDocument && (
                <EditDocumentPanel 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onSave={handleUpdate} 
                    document={editingDocument} 
                    loading={modalLoading} 
                    documentTypes={documentTypes} 
                    onAddDocTypeClick={() => setIsAddDocTypeModalOpen(true)}
                />
            )}

            <AddDocumentTypeModal
                isOpen={isAddDocTypeModalOpen}
                onClose={() => setIsAddDocTypeModalOpen(false)}
                onSuccess={fetchDocumentTypes}
            />

            {loading && <div className="flex justify-center p-8"><Loader className="animate-spin h-6 w-6 text-primary" /></div>}
            {error && <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}

            {!loading && !error && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-background-muted/70 border-b border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                                <tr>
                                    <th className="px-3 py-2">Document Type</th>
                                    <th className="px-3 py-2">Document ID</th>
                                    <th className="px-3 py-2">File Name</th>
                                    <th className="px-3 py-2">Registration Date</th>
                                    <th className="px-3 py-2">End Date</th>
                                    <th className="px-3 py-2">Verified</th>
                                    <th className="px-3 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 text-xs text-foreground">
                                {documents.length > 0 ? (
                                    documents.map(doc => (
                                        <tr key={doc.id} className="hover:bg-background-muted/50 transition-colors">
                                            <td className="px-3 py-2 font-bold text-foreground">{doc.documentType?.name || 'N/A'}</td>
                                            <td className="px-3 py-2 text-foreground-muted">{doc.documentId || '-'}</td>
                                            <td className="px-3 py-2 text-foreground truncate max-w-xs">{doc.fileName}</td>
                                            <td className="px-3 py-2 text-foreground-muted">{doc.registrationDate ? new Date(doc.registrationDate).toLocaleDateString() : '-'}</td>
                                            <td className="px-3 py-2 text-foreground-muted">{doc.endDate ? new Date(doc.endDate).toLocaleDateString() : '-'}</td>
                                            <td className="px-3 py-2">
                                                {doc.verified ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-foreground-muted/60" />}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="flex items-center justify-end gap-1 text-foreground-muted">
                                                    <button onClick={() => handleView(doc.id)} className="p-1 hover:text-primary rounded-lg hover:bg-background-muted transition-colors" title="View"><Eye className="h-3.5 w-3.5" /></button>
                                                    <button onClick={() => handleDownload(doc.id)} className="p-1 hover:text-primary rounded-lg hover:bg-background-muted transition-colors" title="Download"><Download className="h-3.5 w-3.5" /></button>
                                                    <button onClick={() => { setIsUploadModalOpen(false); setEditingDocument(doc); setIsEditModalOpen(true); }} className="p-1 hover:text-primary rounded-lg hover:bg-background-muted transition-colors" title="Edit"><Edit className="h-3.5 w-3.5" /></button>
                                                    <button onClick={() => handleDelete(doc.id)} className="p-1 hover:text-red-600 rounded-lg hover:bg-background-muted transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8 text-foreground-muted">
                                            <AlertCircle className="mx-auto h-8 w-8 text-foreground-muted/40 mb-1" />
                                            <h3 className="text-xs font-bold text-foreground">No documents found</h3>
                                            <p className="text-[11px] text-foreground-muted mt-0.5">Upload a document to get started.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;
