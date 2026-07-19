import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, Palette, Users, Building } from 'lucide-react';
import { masterNavLinks } from '../constants';

const MasterSidebar = ({ activeView, setActiveView, onLinkClick, theme, cycleTheme }) => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Master Admin';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const NavItem = ({ item }) => (
        <button
            onClick={() => {
                setActiveView(item.view);
                onLinkClick && onLinkClick();
            }}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors w-full text-left ${activeView === item.view
                ? 'bg-[#2AA2A5] text-white shadow-md'
                : 'text-slate-400 hover:bg-[#112D48] hover:text-white'
                }`}
        >
            <item.icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${activeView === item.view ? 'text-white' : item.color}`} />
            <span>{item.name}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-[#1e293b] text-slate-300">
            {/* Branding removed, handled by global header */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {masterNavLinks.map((item) => (
                    <NavItem key={item.name} item={item} />
                ))}
                <div className="pt-4 mt-4 border-t border-[#334155]">
                    <NavItem item={{ name: 'Users', view: 'users', icon: Users, color: 'text-blue-500' }} />
                    <NavItem item={{ name: 'Company Info', view: 'company-info', icon: Building, color: 'text-purple-500' }} />
                </div>
            </nav>
            <div className="p-4 border-t border-[#334155] flex-shrink-0">
                {/* User section removed, moved to header */}
                <div className="flex items-center justify-between capitalize">
                    <span className="text-sm text-slate-400">{theme} Mode</span>
                    <button
                        onClick={cycleTheme}
                        className="p-2 rounded-full hover:bg-[#112D48] text-slate-400 hover:text-[#2AA2A5]"
                        title="Cycle Theme"
                    >
                        <Palette className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MasterSidebar;
