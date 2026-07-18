import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Image as ImageIcon, Loader } from 'lucide-react';

const SecureImage = ({ src, alt, className }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchImage = async () => {
            if (!src) {
                setLoading(false);
                return;
            }

            // If it's a data URL or blob already (preview), just use it
            if (src.startsWith('data:') || src.startsWith('blob:')) {
                setImageSrc(src);
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                // Fetch as blob with auth header
                const response = await axios.get(src, {
                    headers: { "Authorization": `Bearer ${token}` },
                    responseType: 'blob'
                });

                if (isMounted) {
                    const objectUrl = URL.createObjectURL(response.data);
                    setImageSrc(objectUrl);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load image", src, err);
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
            // Cleanup object URL if created
            if (imageSrc && imageSrc.startsWith('blob:')) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [src]);

    if (loading) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <Loader className="h-4 w-4 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !imageSrc) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
                <ImageIcon className="h-6 w-6" />
            </div>
        );
    }

    return <img src={imageSrc} alt={alt} className={className} />;
};

export default SecureImage;
