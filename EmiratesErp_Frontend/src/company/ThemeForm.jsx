import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Save, Search, ChevronDown, Check, Eye, EyeOff, LayoutDashboard, Settings, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import CompanyHubLayout from '../components/CompanyHubLayout';
import { saveThemeToStorage, applyTheme } from '../utils/themeUtils';

const POPULAR_FONTS = [
    { family: 'Inter', category: 'sans-serif' },
    { family: 'Roboto', category: 'sans-serif' },
    { family: 'Open Sans', category: 'sans-serif' },
    { family: 'Lato', category: 'sans-serif' },
    { family: 'Montserrat', category: 'sans-serif' },
    { family: 'Poppins', category: 'sans-serif' },
    { family: 'Oswald', category: 'sans-serif' },
    { family: 'Roboto Condensed', category: 'sans-serif' },
    { family: 'Raleway', category: 'sans-serif' },
    { family: 'Nunito', category: 'sans-serif' },
    { family: 'Merriweather', category: 'serif' },
    { family: 'Playfair Display', category: 'serif' },
    { family: 'Rubik', category: 'sans-serif' }
];

const ThemeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [fonts, setFonts] = useState([...POPULAR_FONTS]);
    const [fontLoading, setFontLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        primaryColor: '#1a237e',
        secondaryColor: '#ffffff',
        accentColor: '#1e3a8a',
        backgroundColor: '#f1f5f9',
        textColor: '#0f172a',
        sidebarBgColor: '#1e293b',
        sidebarTextColor: '#f8fafc',
        sidebarActiveColor: '#334155',
        sidebarHoverColor: '#475569',
        headerBgColor: '#ffffff',
        headerTextColor: '#0f172a',
        footerBgColor: '#ffffff',
        footerTextColor: '#64748b',
        surfaceColor: '#ffffff',
        borderColor: '#e2e8f0',
        hoverColor: '#f8fafc',
        linkColor: '#2563eb',
        errorColor: '#ef4444',
        successColor: '#22c55e',
        warningColor: '#f59e0b',
        infoColor: '#3b82f6',
        fontUrl: '',
        fontFamily: 'Inter',
        borderRadius: '0.5rem',
        faviconUrl: '',
        darkMode: false,
        isActive: false
    });

    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    useEffect(() => {
        const fetchTheme = async () => {
            if (!isEditMode) return;
            try {
                const response = await axios.get(`${API_URL}/themes/${id}`, getAuthHeaders());
                setFormData({
                    ...response.data
                });
            } catch (error) {
                console.error("Failed to fetch theme details", error);
                alert("Failed to load theme details.");
                navigate('/company-settings/theme');
            } finally {
                setLoading(false);
            }
        };

        fetchTheme();
    }, [id, isEditMode, navigate, API_URL]);

    useEffect(() => {
        const fetchFonts = async () => {
            setFontLoading(true);
            try {
                const response = await axios.get(`${API_URL}/fonts`, getAuthHeaders());
                if (response.data && Array.isArray(response.data)) {
                    setFonts((prev) => {
                        return response.data.length > 0 ? response.data : prev;
                    });
                }
            } catch (error) {
                console.log("Could not fetch fonts from API, using default list.");
            } finally {
                setFontLoading(false);
            }
        };

        fetchFonts();
    }, [API_URL]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEditMode) {
                await axios.put(`${API_URL}/themes/${id}`, formData, getAuthHeaders());
            } else {
                await axios.post(`${API_URL}/themes`, formData, getAuthHeaders());
            }
            
            // Auto Update Global State if active
            if (formData.isActive) {
                saveThemeToStorage(formData);
                applyTheme(formData);
            }
            
            navigate('/company-settings/theme');
        } catch (error) {
            console.error("Failed to save theme", error);
            alert("Failed to save theme. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <CompanyHubLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                </div>
            </CompanyHubLayout>
        );
    }

    return (
        <CompanyHubLayout>
            <div className="flex flex-col h-full bg-slate-50">
                <header className="bg-white shadow-sm p-4 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/company-settings/theme')} className="p-2 rounded-full hover:bg-slate-100">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Theme' : 'Create New Theme'}</h1>
                            <p className="text-sm text-slate-500">{isEditMode ? 'Update theme properties' : 'Define a new theme for your company'}</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            {/* General Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">General Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Theme Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all font-medium text-slate-800"
                                            placeholder="e.g., Summer Vibes"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    {/* Modern Toggle Switch */}
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 h-[42px] mt-6">
                                        <span className="font-medium text-slate-700 text-sm">Active Theme</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${formData.isActive ? 'bg-blue-600' : 'bg-slate-300'}`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? 'translate-x-4' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Core Colors */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Core Identity Colors</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <ColorInput label="Primary" value={formData.primaryColor || '#1a237e'} onChange={(val) => setFormData({ ...formData, primaryColor: val })} description="Main brand color, buttons, hero text." />
                                    <ColorInput label="Secondary" value={formData.secondaryColor || '#ffffff'} onChange={(val) => setFormData({ ...formData, secondaryColor: val })} description="Complementary shades for depth." />
                                    <ColorInput label="Accent" value={formData.accentColor || '#1e3a8a'} onChange={(val) => setFormData({ ...formData, accentColor: val })} description="Call-to-action badges & highlighters." />
                                    <ColorInput label="App Background" value={formData.backgroundColor || '#f1f5f9'} onChange={(val) => setFormData({ ...formData, backgroundColor: val })} description="Neutral backdrop behind layouts." />
                                    <ColorInput label="Default Text" value={formData.textColor || '#0f172a'} onChange={(val) => setFormData({ ...formData, textColor: val })} description="Readability across primary blocks." />
                                </div>
                            </div>

                            {/* Layout Colors */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Layout Components</h3>
                                
                                <h4 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wider">Sidebar</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <ColorInput label="Sidebar Background" value={formData.sidebarBgColor || '#1e293b'} onChange={(val) => setFormData({ ...formData, sidebarBgColor: val })} />
                                    <ColorInput label="Sidebar Text" value={formData.sidebarTextColor || '#f8fafc'} onChange={(val) => setFormData({ ...formData, sidebarTextColor: val })} />
                                    <ColorInput label="Active Item Bg" value={formData.sidebarActiveColor || '#334155'} onChange={(val) => setFormData({ ...formData, sidebarActiveColor: val })} />
                                    <ColorInput label="Hover Shade" value={formData.sidebarHoverColor || '#475569'} onChange={(val) => setFormData({ ...formData, sidebarHoverColor: val })} />
                                </div>
                                
                                <h4 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wider">Header & Footer</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <ColorInput label="Header Background" value={formData.headerBgColor || '#ffffff'} onChange={(val) => setFormData({ ...formData, headerBgColor: val })} />
                                    <ColorInput label="Header Text" value={formData.headerTextColor || '#0f172a'} onChange={(val) => setFormData({ ...formData, headerTextColor: val })} />
                                    <ColorInput label="Footer Background" value={formData.footerBgColor || '#ffffff'} onChange={(val) => setFormData({ ...formData, footerBgColor: val })} />
                                    <ColorInput label="Footer Text" value={formData.footerTextColor || '#64748b'} onChange={(val) => setFormData({ ...formData, footerTextColor: val })} />
                                </div>
                            </div>

                            {/* Surface & Component Colors */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Surfaces & Interactive Components</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <ColorInput label="Cards / Modals (Surface)" value={formData.surfaceColor || '#ffffff'} onChange={(val) => setFormData({ ...formData, surfaceColor: val })} />
                                    <ColorInput label="Borders & Dividers" value={formData.borderColor || '#e2e8f0'} onChange={(val) => setFormData({ ...formData, borderColor: val })} />
                                    <ColorInput label="List Hover Backdrops" value={formData.hoverColor || '#f8fafc'} onChange={(val) => setFormData({ ...formData, hoverColor: val })} />
                                    <ColorInput label="Hyperlinks" value={formData.linkColor || '#2563eb'} onChange={(val) => setFormData({ ...formData, linkColor: val })} />
                                </div>
                            </div>

                            {/* Status Colors */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Status Responses</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <ColorInput label="Success (Green)" value={formData.successColor || '#22c55e'} onChange={(val) => setFormData({ ...formData, successColor: val })} />
                                    <ColorInput label="Warning (Orange)" value={formData.warningColor || '#f59e0b'} onChange={(val) => setFormData({ ...formData, warningColor: val })} />
                                    <ColorInput label="Error (Red)" value={formData.errorColor || '#ef4444'} onChange={(val) => setFormData({ ...formData, errorColor: val })} />
                                    <ColorInput label="Info (Blue)" value={formData.infoColor || '#3b82f6'} onChange={(val) => setFormData({ ...formData, infoColor: val })} />
                                </div>
                            </div>
                            
                            {/* Typography & Visual Style */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Typography & Visual Guidelines</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Font Family</label>
                                        <FontSelector
                                            fonts={fonts}
                                            selectedFont={formData.fontFamily}
                                            onChange={(family) => setFormData({ ...formData, fontFamily: family })}
                                            loading={fontLoading}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Foundational reading typeface natively supported across devices.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Font Config URL (Google Fonts)</label>
                                        <input
                                            type="url"
                                            placeholder="https://fonts.googleapis.com/css2?..."
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all font-medium text-slate-800"
                                            value={formData.fontUrl || ''}
                                            onChange={(e) => setFormData({ ...formData, fontUrl: e.target.value })}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Directly injection link required only if selecting non-system standard fonts.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Border Radius</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all font-medium text-slate-800"
                                            placeholder="e.g. 0.5rem"
                                            value={formData.borderRadius || '0.5rem'}
                                            onChange={(e) => setFormData({ ...formData, borderRadius: e.target.value })}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Defines rounding constraints for card layouts, charts and form artifacts.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Favicon Application Object URL</label>
                                        <input
                                            type="url"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all font-medium text-slate-800"
                                            placeholder="https://example.com/favicon.ico"
                                            value={formData.faviconUrl || ''}
                                            onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Direct HTTPS target mapping (optional rendering enhancement).</p>
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 border-slate-200 border rounded-lg h-[42px] mt-6 cursor-pointer" onClick={() => setFormData({ ...formData, darkMode: !formData.darkMode })}>
                                            <span className="font-medium text-slate-700 text-sm">Always Render Dark Mode Layouts?</span>
                                            <button
                                                type="button"
                                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${formData.darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.darkMode ? 'translate-x-4' : 'translate-x-0'}`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setShowPreview(!showPreview)} 
                                    className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    {showPreview ? 'Hide Preview' : 'Show Live Preview'}
                                </button>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => navigate('/company-settings/theme')} className="px-4 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm transition-colors">
                                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                                        {isEditMode ? 'Update Theme' : 'Create Theme'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {showPreview && (
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <LayoutDashboard className="h-5 w-5 text-blue-600" />
                                Live Theme Preview
                            </h3>
                            <ThemePreview theme={formData} />
                        </div>
                    )}
                </main>
            </div>
        </CompanyHubLayout>
    );
};

const FontSelector = ({ fonts, selectedFont, onChange, loading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredFonts = fonts.filter(font =>
        font.family.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative" ref={wrapperRef}>
            <div
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between cursor-pointer hover:border-blue-500 hover:bg-white transition-all shadow-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`block truncate font-medium ${!selectedFont ? 'text-slate-400' : 'text-slate-800'}`}>
                    {selectedFont || 'Select a font...'}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto">
                    <div className="p-2 sticky top-0 bg-white border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search fonts..."
                                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    {loading ? (
                        <div className="p-4 text-center text-slate-500 text-sm">Loading fonts...</div>
                    ) : (
                        <ul className="py-1">
                            {filteredFonts.length > 0 ? (
                                filteredFonts.map(font => (
                                    <li
                                        key={font.family}
                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 flex items-center justify-between ${selectedFont === font.family ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                                        onClick={() => {
                                            onChange(font.family);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        style={{ fontFamily: font.family }}
                                    >
                                        <span>{font.family}</span>
                                        {selectedFont === font.family && <Check className="h-4 w-4" />}
                                    </li>
                                ))
                            ) : (
                                <li className="px-3 py-4 text-center text-sm text-slate-500">No fonts found</li>
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

// Updated ColorInput with integrated swatch
const ColorInput = ({ label, value, onChange, description }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative flex items-center group">
            <div
                className="absolute left-2 w-8 h-8 rounded border border-slate-200 shadow-sm z-10 pointer-events-none"
                style={{ backgroundColor: value }}
            ></div>
            <input
                type="color"
                className="absolute left-2 w-8 h-8 opacity-0 cursor-pointer z-20"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <input
                type="text"
                className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all uppercase font-mono text-sm group-hover:bg-white"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={7}
            />
        </div>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
);

// Inline functional component for live rendering
const ThemePreview = ({ theme }) => {
    // Generate isolated style variables overriding defaults locally if present
    const getC = (key, fallback) => theme[key] || fallback;

    const styles = {
        fontFamily: theme.fontFamily ? `"${theme.fontFamily}", sans-serif` : 'sans-serif',
        borderRadius: theme.borderRadius || '0.5rem',
        sidebarBg: getC('sidebarBgColor', '#1e293b'),
        sidebarText: getC('sidebarTextColor', '#f8fafc'),
        sidebarActive: getC('sidebarActiveColor', '#334155'),
        sidebarHover: getC('sidebarHoverColor', '#475569'),
        headerBg: getC('headerBgColor', '#ffffff'),
        headerText: getC('headerTextColor', '#0f172a'),
        appBg: getC('backgroundColor', '#f1f5f9'),
        surface: getC('surfaceColor', '#ffffff'),
        text: getC('textColor', '#0f172a'),
        border: getC('borderColor', '#e2e8f0'),
        primary: getC('primaryColor', '#1a237e'),
        secondary: getC('secondaryColor', '#ffffff'),
        accent: getC('accentColor', '#1e3a8a'),
        link: getC('linkColor', '#2563eb'),
        success: getC('successColor', '#22c55e'),
        warning: getC('warningColor', '#f59e0b'),
        error: getC('errorColor', '#ef4444'),
        info: getC('infoColor', '#3b82f6')
    };

    return (
        <div 
            className={`w-full h-[600px] rounded-xl overflow-hidden border shadow-lg flex flex-col font-sans transition-colors duration-300 ${theme.darkMode ? 'bg-slate-900 border-slate-800' : 'border-slate-300'}`}
            style={{ fontFamily: styles.fontFamily }}
        >
            {/* Embedded Font Support for accurate preview */}
            {theme.fontUrl && (
                <link rel="stylesheet" href={theme.fontUrl} />
            )}

            <div className="flex flex-1 overflow-hidden" style={{ backgroundColor: styles.appBg, color: styles.text }}>
                {/* PREVIEW SIDEBAR */}
                <div className="w-64 max-w-[250px] flex-shrink-0 flex flex-col transition-colors duration-300" style={{ backgroundColor: styles.sidebarBg, color: styles.sidebarText }}>
                    <div className="h-16 flex items-center px-6 font-bold text-lg border-b border-black/10">
                        {theme.name || 'Brand Logo'}
                    </div>
                    <div className="flex-1 py-4 px-3 space-y-1">
                        <div className="px-3 py-2.5 rounded-md flex items-center gap-3 cursor-pointer transition-colors duration-300" style={{ backgroundColor: styles.sidebarActive, borderRadius: styles.borderRadius }}>
                            <LayoutDashboard className="h-5 w-5 opacity-80" />
                            <span className="font-medium">Dashboard</span>
                        </div>
                        <div className="px-3 py-2.5 rounded-md flex items-center gap-3 cursor-pointer opacity-80 transition-colors duration-300" style={{ ':hover': { backgroundColor: styles.sidebarHover }, borderRadius: styles.borderRadius }}>
                            <User className="h-5 w-5" />
                            <span className="font-medium">Directory</span>
                        </div>
                        <div className="px-3 py-2.5 rounded-md flex items-center gap-3 cursor-pointer opacity-80 transition-colors duration-300" style={{ ':hover': { backgroundColor: styles.sidebarHover }, borderRadius: styles.borderRadius }}>
                            <Settings className="h-5 w-5" />
                            <span className="font-medium">Settings</span>
                        </div>
                    </div>
                </div>

                {/* PREVIEW MAIN CONTENT */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* PREVIEW HEADER */}
                    <div className="h-16 flex items-center justify-between px-8 shadow-sm transition-colors duration-300 z-10" style={{ backgroundColor: styles.headerBg, color: styles.headerText }}>
                        <div className="font-medium">Welcome back, User!</div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full shadow-sm flex items-center justify-center font-bold text-xs" style={{ backgroundColor: styles.primary, color: styles.secondary }}>
                                US
                            </div>
                        </div>
                    </div>

                    {/* PREVIEW BODY */}
                    <div className="flex-1 p-8 overflow-auto space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-5 shadow-sm transition-colors duration-300 flex flex-col justify-between" style={{ backgroundColor: styles.surface, borderColor: styles.border, borderWidth: 1, borderRadius: styles.borderRadius }}>
                                    <div className="text-sm opacity-70 mb-2 font-medium">Metric Title {i}</div>
                                    <div className="text-2xl font-bold mb-4" style={{ color: styles.primary }}>2,45{i}</div>
                                    <div className="text-xs" style={{ color: styles.info }}>+14% from last week</div>
                                </div>
                            ))}
                        </div>

                        {/* Interactive Complex Surface */}
                        <div className="p-6 shadow-sm transition-colors duration-300" style={{ backgroundColor: styles.surface, borderColor: styles.border, borderWidth: 1, borderRadius: styles.borderRadius }}>
                            <div className="flex justify-between items-center pb-4 mb-4" style={{ borderBottomColor: styles.border, borderBottomWidth: 1 }}>
                                <h3 className="font-bold text-lg">Interactive Elements</h3>
                                <a href="#" style={{ color: styles.link }} className="text-sm font-medium hover:underline">View All &rarr;</a>
                            </div>

                            <div className="space-y-4 mb-6">
                                <p className="text-sm leading-relaxed opacity-90">
                                    This paragraph represents foundational reading typography to inspect `{theme.fontFamily || 'Inter'}`. The layout showcases buttons, links mapping, and various status decorators utilizing the configured border rounding variables.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 mb-8">
                                <button className="px-5 py-2 font-medium transition-colors shadow-sm" style={{ backgroundColor: styles.primary, color: styles.secondary, borderRadius: styles.borderRadius }}>
                                    Primary Action
                                </button>
                                <button className="px-5 py-2 font-medium transition-colors shadow-sm" style={{ backgroundColor: styles.accent, color: styles.secondary, borderRadius: styles.borderRadius }}>
                                    Accent Badge
                                </button>
                                <button className="px-5 py-2 font-medium transition-colors" style={{ backgroundColor: 'transparent', borderColor: styles.border, borderWidth: 1, color: styles.text, borderRadius: styles.borderRadius }}>
                                    Secondary Tool
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-opacity-10" style={{ backgroundColor: styles.success + '20', color: styles.success, borderRadius: styles.borderRadius }}>
                                    Success Status
                                </div>
                                <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-opacity-10" style={{ backgroundColor: styles.warning + '20', color: styles.warning, borderRadius: styles.borderRadius }}>
                                    Pending Review
                                </div>
                                <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-opacity-10" style={{ backgroundColor: styles.error + '20', color: styles.error, borderRadius: styles.borderRadius }}>
                                    Critical Failure
                                </div>
                                <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-opacity-10" style={{ backgroundColor: styles.info + '20', color: styles.info, borderRadius: styles.borderRadius }}>
                                    General Info
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeForm;
