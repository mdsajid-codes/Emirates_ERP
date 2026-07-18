import React from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FilePreviewModal = ({ isOpen, onClose, fileUrl, fileName, fileType }) => {
    if (!isOpen) return null;

    const isImage = fileType?.startsWith('image/');
    const isPdf = fileType === 'application/pdf';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-foreground truncate max-w-md">{fileName}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <a 
                                href={fileUrl} 
                                download={fileName}
                                className="p-2 hover:bg-background-muted rounded-full transition-colors text-foreground-muted hover:text-primary"
                                title="Download"
                            >
                                <Download size={20} />
                            </a>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-background-muted rounded-full transition-colors text-foreground-muted hover:text-destructive"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-background-muted/30 overflow-auto p-4 flex items-center justify-center">
                        {isImage ? (
                            <img src={fileUrl} alt={fileName} className="max-w-full max-h-full object-contain shadow-lg rounded-lg" />
                        ) : isPdf ? (
                            <iframe src={fileUrl} className="w-full h-full rounded-lg shadow-inner" title={fileName} />
                        ) : (
                            <div className="text-center">
                                <p className="text-foreground-muted mb-4">Preview not available for this file type.</p>
                                <a 
                                    href={fileUrl} 
                                    download={fileName}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-theme shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2 font-medium"
                                >
                                    <Download size={18} /> Download to View
                                </a>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FilePreviewModal;
