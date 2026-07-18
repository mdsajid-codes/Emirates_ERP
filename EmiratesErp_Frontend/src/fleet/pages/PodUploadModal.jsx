import React, { useState } from 'react';
import axios from 'axios';
import {
  X,
  Upload,
  Check,
  Image as ImageIcon,
  AlertCircle,
  Camera
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function PodUploadModal({ isOpen, onClose, onSave, job }) {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a photo');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      await axios.post(`${API_URL}/fleet/dispatch/jobs/${job.id}/pod`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      toast.success('Proof of Delivery uploaded successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error uploading POD:', error);
      const serverError = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(`Upload failed: ${serverError}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-theme shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-theme text-primary">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Proof of Delivery</h2>
              <p className="text-xs text-foreground-muted">Upload POD for Job: <span className="font-bold">{job?.jobNo}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-theme transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-theme p-8 flex flex-col items-center justify-center gap-3 transition-all ${preview ? 'border-primary bg-primary/5' : 'border-border group-hover:border-primary/50 bg-muted/30'}`}>
                {preview ? (
                  <div className="relative w-full aspect-video rounded-theme overflow-hidden border border-border shadow-inner">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-bold">Click to change photo</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-background rounded-full border border-border shadow-sm text-foreground-muted group-hover:text-primary transition-colors">
                      <Upload size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">Click or drag delivery photo</p>
                      <p className="text-xs text-foreground-muted">JPG, PNG up to 5MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-3 rounded-theme flex gap-3 text-amber-700">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Uploading the POD will automatically mark this job as <span className="font-bold uppercase">Delivered</span>. This action is final.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-theme transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-theme font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={18} />
              )}
              Confirm Delivery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
