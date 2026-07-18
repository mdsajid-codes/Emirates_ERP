import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu, Palmtree, User, LogOut } from 'lucide-react';
import SecureImage from './SecureImage';

const MasterHeader = ({ onMenuClick, onLogout, username }) => {
    const [companyInfo, setCompanyInfo] = useState(null);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchCompanyInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/master/company-info`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.data) {
                    const processUrl = (url) => {
                        if (!url) return null;
                        if (url.startsWith('http')) return url;
                        const filename = url.split(/[/\\]/).pop();
                        return `${API_URL}/master/company-info/images/${filename}`;
                    };

                    setCompanyInfo({
                        ...response.data,
                        logoUrl: processUrl(response.data.logoUrl)
                    });
                }
            } catch (err) {
                console.error("Failed to fetch header info", err);
            }
        };
        fetchCompanyInfo();
    }, [API_URL]);

    return (
        <header className="bg-card border-b border-border h-16 flex-shrink-0 flex items-center px-4 lg:px-6 shadow-sm z-20">
            <button
                type="button"
                className="lg:hidden mr-4 text-foreground-muted hover:text-foreground focus:outline-none"
                onClick={onMenuClick}
            >
                <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-3">
                <div className="h-10 w-auto max-w-[150px] flex items-center overflow-hidden">
                    {companyInfo?.logoUrl ? (
                        <SecureImage src={companyInfo.logoUrl} alt="Logo" className="h-full w-auto object-contain" />
                    ) : (
                        <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <Palmtree className="h-5 w-5" />
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-lg font-bold text-foreground leading-tight">
                        {companyInfo?.companyName || 'Master Panel'}
                    </h1>
                </div>
            </div>

            <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium hidden md:block text-foreground">{username || 'Admin'}</span>
                </div>
                <button onClick={onLogout} className="text-foreground-muted hover:text-red-500 transition-colors" title="Logout">
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
};

export default MasterHeader;
