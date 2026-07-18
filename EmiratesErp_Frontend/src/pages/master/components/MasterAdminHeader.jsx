import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LogOut } from 'lucide-react';

export const MasterAdminHeader = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Master Admin';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <header className="bg-card text-card-foreground shadow-sm p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-primary" />
                    <span className="font-bold text-xl text-foreground">Master Panel</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <p className="text-sm text-foreground-muted">Welcome, <span className="font-semibold">{username}</span></p>
                <button onClick={handleLogout} className="text-foreground-muted hover:text-red-600" title="Logout"><LogOut className="h-5 w-5" /></button>
            </div>
        </header>
    );
};

export default MasterAdminHeader;
