import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, CheckCircle2, AlertTriangle, AlertCircle, FileSpreadsheet, Loader } from 'lucide-react';
import axios from 'axios';

const CrmLeadBulkUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    if (!isOpen) return null;

    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const authHeaders = { "Authorization": `Bearer ${localStorage.getItem('token')}` };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
                setFile(droppedFile);
                setError('');
            } else {
                setError('Only Excel files (.xlsx, .xls) are supported.');
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
                setFile(selectedFile);
                setError('');
            } else {
                setError('Only Excel files (.xlsx, .xls) are supported.');
            }
        }
    };

    const handleButtonClick = () => {
        inputRef.current.click();
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(`${API_URL}/crm/leads/bulk-upload`, formData, {
                headers: {
                    ...authHeaders,
                    "Content-Type": "multipart/form-data"
                }
            });
            setResult(response.data);
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload leads. Please verify file format.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground">Bulk Upload Leads</h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full text-foreground-muted hover:bg-background-muted transition-colors"
                        disabled={uploading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {!result ? (
                        <>
                            {/* Drag and Drop Zone */}
                            <div 
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={handleButtonClick}
                                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                                    dragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-border hover:border-primary/50 bg-background-muted/20 hover:bg-background-muted/40'
                                }`}
                            >
                                <input 
                                    ref={inputRef}
                                    type="file" 
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="hidden" 
                                />
                                <div className="p-4 bg-primary/10 rounded-full text-primary">
                                    <Upload className="h-8 w-8 animate-bounce" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-foreground">
                                        Drag & drop your Excel file here, or <span className="text-primary hover:underline">browse</span>
                                    </p>
                                    <p className="text-xs text-foreground-muted mt-1">
                                        Supports .xlsx and .xls formats
                                    </p>
                                </div>
                            </div>

                            {/* Selected File Display */}
                            {file && (
                                <div className="flex items-center justify-between p-4 bg-background-muted border border-border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-success/15 rounded text-success">
                                            <FileSpreadsheet className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{file.name}</p>
                                            <p className="text-xs text-foreground-muted">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="p-1 rounded-full text-foreground-muted hover:bg-black/5 hover:text-foreground transition-all"
                                        disabled={uploading}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Upload Result Summary */
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-background-muted border border-border p-4 rounded-xl">
                                    <p className="text-2xl font-bold text-foreground">{result.totalRows}</p>
                                    <p className="text-xs text-foreground-muted font-medium mt-1">Total Processed</p>
                                </div>
                                <div className="bg-success/5 border border-success/20 p-4 rounded-xl">
                                    <p className="text-2xl font-bold text-success">{result.successCount}</p>
                                    <p className="text-xs text-success/80 font-medium mt-1">Uploaded Successfully</p>
                                </div>
                                <div className={`p-4 rounded-xl border ${result.failedCount > 0 ? 'bg-error/5 border-error/20' : 'bg-background-muted border-border'}`}>
                                    <p className={`text-2xl font-bold ${result.failedCount > 0 ? 'text-error' : 'text-foreground'}`}>{result.failedCount}</p>
                                    <p className="text-xs text-foreground-muted font-medium mt-1">Failed Rows</p>
                                </div>
                            </div>

                            {/* Failures Table if any */}
                            {result.errors && result.errors.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                        Row Error Details
                                    </h4>
                                    <div className="border border-border rounded-lg overflow-hidden max-h-[30vh] overflow-y-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-background-muted border-b border-border text-foreground-muted">
                                                    <th className="px-4 py-2.5 font-bold">Row</th>
                                                    <th className="px-4 py-2.5 font-bold">Lead No</th>
                                                    <th className="px-4 py-2.5 font-bold">Reason</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border bg-card">
                                                {result.errors.map((err, idx) => (
                                                    <tr key={idx} className="hover:bg-background-muted/20">
                                                        <td className="px-4 py-2.5 font-medium">{err.row}</td>
                                                        <td className="px-4 py-2.5 font-mono text-[10px] text-foreground-muted">{err.leadNo}</td>
                                                        <td className="px-4 py-2.5 text-error font-medium">{err.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {result.failedCount === 0 && (
                                <div className="flex flex-col items-center justify-center p-6 bg-success/5 border border-success/15 rounded-xl gap-2 text-center">
                                    <CheckCircle2 className="h-10 w-10 text-success" />
                                    <p className="text-sm font-bold text-foreground">Perfect Import!</p>
                                    <p className="text-xs text-foreground-muted">All leads were imported with 100% success rate.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-background-muted/50 flex justify-end gap-3">
                    {!result ? (
                        <>
                            <button 
                                onClick={onClose} 
                                className="px-4 py-2 bg-background border border-border hover:bg-background-muted text-sm font-medium rounded-lg transition-colors"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpload} 
                                className="px-4 py-2 bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                                disabled={!file || uploading}
                            >
                                {uploading ? (
                                    <>
                                        <Loader className="h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : 'Upload File'}
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={onClose} 
                            className="px-5 py-2 bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] text-sm font-bold rounded-lg shadow-md transition-all"
                        >
                            Done
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CrmLeadBulkUploadModal;
