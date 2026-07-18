import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Maximize2 } from 'lucide-react';

const ThemedAvatar = ({ imageUrl, name, size = "w-10 h-10" }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    let url = null;
    if (imageUrl) {
      const fetchImage = async () => {
        try {
          const response = await axios.get(imageUrl, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            responseType: 'blob'
          });
          url = URL.createObjectURL(response.data);
          setBlobUrl(url);
          setError(false);
        } catch (err) {
          console.error("Error fetching avatar blob:", err);
          setError(true);
        }
      };
      fetchImage();
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [imageUrl]);

  const initials = name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "NA";

  return (
    <>
      <div 
        onClick={() => blobUrl && !error && setIsPreviewOpen(true)}
        className={`${size} rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary overflow-hidden relative group ${blobUrl && !error ? 'cursor-pointer' : ''}`}
      >
        {blobUrl && !error ? (
          <>
            <img 
              src={blobUrl} 
              alt={name} 
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
              onError={() => setError(true)}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 size={14} className="text-white" />
            </div>
          </>
        ) : (
          initials
        )}
      </div>

      {/* Image Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsPreviewOpen(false)}
          />
          <div className="relative max-w-2xl w-full bg-card rounded-theme shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-1">
              <img 
                src={blobUrl} 
                alt={name} 
                className="w-full h-auto max-h-[80vh] object-contain rounded-theme"
              />
            </div>
            <div className="px-6 py-4 bg-background-muted/50 border-t border-border flex items-center justify-between">
               <div>
                  <h3 className="font-bold text-foreground">{name}</h3>
                  <p className="text-xs text-foreground-muted uppercase tracking-widest font-bold">Driver Profile Photo</p>
               </div>
               <button 
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-theme text-sm font-bold hover:opacity-90 transition-opacity"
               >
                Close View
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemedAvatar;
