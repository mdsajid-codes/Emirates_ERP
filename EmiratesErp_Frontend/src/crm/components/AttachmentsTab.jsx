import React, { useState, useEffect, useCallback } from 'react';
import { Paperclip, Upload, File, FileText, Image, FileVideo, Trash2, Eye, Download, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import FilePreviewModal from './FilePreviewModal';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AttachmentsTab = ({ leadId }) => {
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [previewData, setPreviewData] = useState(null); // { blobUrl, fileName, fileType }

    const authHeaders = { "Authorization": `Bearer ${localStorage.getItem('token')}` };

    const fetchAttachments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/crm/leads/${leadId}/attachments`, { headers: authHeaders });
            setAttachments(res.data);
        } catch (err) {
            console.error("Failed to fetch attachments:", err);
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchAttachments();
    }, [fetchAttachments]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            await axios.post(`${API_URL}/crm/leads/${leadId}/attachments`, formData, {
                headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' }
            });
            fetchAttachments();
        } catch (err) {
            alert(`Upload failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this attachment?")) return;
        try {
            await axios.delete(`${API_URL}/crm/leads/attachments/${id}`, { headers: authHeaders });
            setAttachments(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            alert("Failed to delete attachment.");
        }
    };

    const handlePreview = async (file) => {
        try {
            const res = await axios.get(`${API_URL}/crm/leads/attachments/${file.id}/preview`, {
                headers: authHeaders,
                responseType: 'blob'
            });
            const blobUrl = URL.createObjectURL(res.data);
            setPreviewData({
                blobUrl,
                fileName: file.fileName,
                fileType: file.fileType
            });
        } catch (err) {
            console.error("Preview failed:", err);
            alert("Failed to load file preview.");
        }
    };

    const closePreview = () => {
        if (previewData?.blobUrl) {
            URL.revokeObjectURL(previewData.blobUrl);
        }
        setPreviewData(null);
    };

    const handleDownload = async (file) => {
        try {
            const res = await axios.get(`${API_URL}/crm/leads/attachments/${file.id}/preview`, {
                headers: authHeaders,
                responseType: 'blob'
            });
            const url = URL.createObjectURL(res.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert("Download failed.");
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) return <Image className="text-blue-500" />;
        if (type === 'application/pdf') return <FileText className="text-red-500" />;
        if (type?.startsWith('video/')) return <FileVideo className="text-purple-500" />;
        return <File className="text-foreground-muted" />;
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            {/* Upload Area */}
            <div className="bg-card border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors group">
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        {uploading ? <Loader2 className="animate-spin h-8 w-8" /> : <Upload size={32} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground">Click to upload or drag and drop</h4>
                        <p className="text-[10px] text-foreground-muted mt-1 uppercase tracking-widest font-bold">PDF, Images, or Documents up to 10MB</p>
                    </div>
                </label>
            </div>

            {/* Attachments List */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-background-muted/50 flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-foreground-muted flex items-center gap-2">
                        <Paperclip size={16} /> Attached Documents ({attachments.length})
                    </h3>
                </div>

                <div className="divide-y divide-border">
                    {loading ? (
                        <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                    ) : attachments.length > 0 ? (
                        attachments.map((file) => (
                            <div key={file.id} className="p-4 flex items-center justify-between hover:bg-background-muted/20 transition-colors">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="p-2 bg-background rounded-lg border border-border shadow-sm">
                                        {getFileIcon(file.fileType)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{file.fileName}</p>
                                        <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest">
                                            {formatSize(file.fileSize)} • {new Date(file.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePreview(file)}
                                        className="p-2 text-foreground-muted hover:text-primary hover:bg-background-muted rounded-lg transition-all"
                                        title="Preview"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(file)}
                                        className="p-2 text-foreground-muted hover:text-success hover:bg-background-muted rounded-lg transition-all"
                                        title="Download"
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.id)}
                                        className="p-2 text-foreground-muted hover:text-destructive hover:bg-background-muted rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-foreground-muted opacity-50">
                            <AlertCircle size={40} className="mx-auto mb-3" />
                            <p className="text-sm font-bold uppercase tracking-widest">No attachments found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            <FilePreviewModal
                isOpen={!!previewData}
                onClose={closePreview}
                fileUrl={previewData?.blobUrl || ''}
                fileName={previewData?.fileName}
                fileType={previewData?.fileType}
            />
        </div>
    );
};

export default AttachmentsTab;
