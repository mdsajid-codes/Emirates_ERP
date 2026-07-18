import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Upload } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorFormDocumentsTab = ({ documents, onChange }) => {
    const [documentTypes, setDocumentTypes] = useState([]);
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    useEffect(() => {
        const fetchDocumentTypes = async () => {
            try {
                const res = await axios.get(`${API_URL}/ats/document-types/list`, { headers });
                setDocumentTypes(res.data?.content || res.data || []);
            } catch (err) {
                console.error("Failed to load document types", err);
            }
        };
        fetchDocumentTypes();
    }, []);

    const handleAddDocument = () => {
        const newDoc = {
            id: null,
            isNew: true,
            title: '',
            fileName: '',
            filePath: '',
            documentTypeId: '',
            comments: '',
            rawFile: null
        };
        onChange([...documents, newDoc]);
    };

    const handleRemoveDocument = (index) => {
        const updated = [...documents];
        updated.splice(index, 1);
        onChange(updated);
    };

    const handleFieldChange = (index, field, value) => {
        const updated = [...documents];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const handleFileChange = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const updated = [...documents];
        updated[index] = {
            ...updated[index],
            rawFile: file,
            fileName: file.name,
            title: updated[index].title || file.name.split('.')[0]
        };
        onChange(updated);
    };

    return (
        <div className="space-y-6">
            {/* Header section matching screenshot */}
            <div className="flex justify-between items-center border-b border-border pb-4">
                <h3 className="text-base font-bold text-foreground">Documents</h3>
                <button
                    type="button"
                    onClick={handleAddDocument}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-theme shadow hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                </button>
            </div>

            {documents.length === 0 ? (
                <div className="text-center py-8 text-foreground-muted italic text-xs">
                    No documents added yet. Click "Add" to upload a document.
                </div>
            ) : (
                <div className="space-y-6">
                    {documents.map((doc, idx) => (
                        <div key={idx} className="border border-border rounded-theme overflow-hidden bg-background">
                            {/* Inner header banner */}
                            <div className="bg-background-muted px-4 py-2 border-b border-border flex justify-between items-center">
                                <span className="text-xs font-bold text-primary">Upload Documents</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveDocument(idx)}
                                    className="text-destructive hover:text-destructive/80 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Form fields layout */}
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Document Type Dropdown */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Document Type <span className="text-destructive">*</span>
                                        </label>
                                        <select
                                            required
                                            value={doc.documentTypeId || ''}
                                            onChange={(e) => handleFieldChange(idx, 'documentTypeId', e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                        >
                                            <option value="">Select</option>
                                            {documentTypes.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-destructive mt-1">
                                            Documents are required to create a vendor.
                                        </p>
                                    </div>

                                    {/* Document Title */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Document Title <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={doc.title || ''}
                                            onChange={(e) => handleFieldChange(idx, 'title', e.target.value)}
                                            placeholder="Document Title"
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                        />
                                    </div>

                                    {/* Select File */}
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                            Upload Document <span className="text-destructive">*</span>
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-theme text-xs font-semibold cursor-pointer transition-colors shadow">
                                                <Upload className="h-3.5 w-3.5" />
                                                <span>Select File</span>
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileChange(idx, e)}
                                                    className="hidden"
                                                />
                                            </label>
                                            {(doc.fileName || doc.filePath) && (
                                                <span className="text-xs text-foreground font-medium truncate max-w-[150px]" title={doc.fileName || doc.filePath}>
                                                    {doc.fileName || doc.filePath.split('/').pop()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description Area */}
                                <div>
                                    <label className="block text-xs font-semibold text-foreground-muted mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={doc.comments || ''}
                                        onChange={(e) => handleFieldChange(idx, 'comments', e.target.value)}
                                        placeholder="Description"
                                        className="w-full px-3 py-2 text-xs bg-background border border-border rounded-theme outline-none text-foreground resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AtsVendorFormDocumentsTab;
