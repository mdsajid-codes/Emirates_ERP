import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, MessageSquare, AlertCircle } from 'lucide-react';

const RejectionReasonModal = ({ isOpen, onClose, onSubmit, title = "Reject Request", subtitle = "Please provide a reason for rejection (optional)" }) => {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(reason);
            setReason('');
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[999999] p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border text-foreground rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-background-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground">{title}</h3>
                            <p className="text-xs text-foreground-muted">{subtitle}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-muted transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-2 mb-6">
                        <label className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5 text-primary" /> Rejection Comment / Reason
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter rejection reason or internal notes for employee..."
                            rows={4}
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-foreground-muted/60 resize-none"
                            autoFocus
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-background-muted text-foreground transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                            {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? ReactDOM.createPortal(modalContent, document.body) : modalContent;
};

export default RejectionReasonModal;
