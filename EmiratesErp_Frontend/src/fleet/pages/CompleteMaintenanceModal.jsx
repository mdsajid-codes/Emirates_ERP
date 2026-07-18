import React, { useState } from 'react';
import axios from 'axios';
import { X, CheckCircle, Upload, CircleDollarSign, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CompleteMaintenanceModal({ isOpen, onClose, onComplete, recordId }) {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [actualCost, setActualCost] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actualCost) {
      toast.error('Please enter the actual cost');
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

      // 1. Complete the request
      await axios.patch(`${API_URL}/fleet/maintenance/${recordId}/complete?actualCost=${actualCost}&notes=${notes}`, {}, { headers });

      // 2. Upload invoice if selected
      if (file) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        await axios.post(`${API_URL}/fleet/maintenance/${recordId}/invoice`, uploadData, {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast.success('Maintenance completed successfully');
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error completing maintenance:', error);
      toast.error('Failed to complete maintenance');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-theme shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between bg-green-50/50">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-theme text-green-600">
              <CheckCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Complete Maintenance</h2>
              <p className="text-xs text-foreground-muted">Finalize service and record actual costs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-theme transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
              <CircleDollarSign size={12} /> Actual Cost (AED)
            </label>
            <input
              type="number"
              step="0.01"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              required
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-green-500/20 outline-none font-bold text-green-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
              <Upload size={12} /> Invoice / Receipt
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="invoice-upload"
                accept="image/*,application/pdf"
              />
              <label
                htmlFor="invoice-upload"
                className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-muted border border-border border-dashed rounded-theme text-sm cursor-pointer hover:bg-muted/60 transition-colors truncate"
              >
                <Upload size={16} />
                {file ? file.name : 'Select Invoice File'}
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground-muted uppercase ml-1 flex items-center gap-1">
              <FileText size={12} /> Final Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              placeholder="Any closing remarks..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
            ></textarea>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-theme transition-colors border border-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-theme font-bold hover:bg-green-700 transition-all shadow-md shadow-green-600/20 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              Complete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
