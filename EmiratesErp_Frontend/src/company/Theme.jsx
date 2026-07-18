
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle, Palette, Monitor, Type, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CompanyHubLayout from '../components/CompanyHubLayout';
import { saveThemeToStorage, applyTheme } from '../utils/themeUtils';

const Theme = () => {
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const fetchThemes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/themes`, getAuthHeaders());
            setThemes(response.data);
        } catch (error) {
            console.error("Failed to fetch themes", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThemes();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this theme?')) {
            try {
                await axios.delete(`${API_URL}/themes/${id}`, getAuthHeaders());
                fetchThemes();
            } catch (error) {
                console.error("Failed to delete theme", error);
                alert("Failed to delete theme (Active themes cannot be deleted)");
            }
        }
    };

    const handleEdit = (theme) => {
        navigate(`/company-settings/theme/edit/${theme.id}`);
    };

    const handleCreate = () => {
        navigate('/company-settings/theme/new');
    };

    const toggleActive = async (theme) => {
        if (theme.isActive) return; // Already active

        if (window.confirm(`Set "${theme.name}" as the active theme?`)) {
            try {
                // We can re-use the update endpoint, just setting isActive to true
                // The backend handles deactivating others
                const updatedData = { ...theme, isActive: true };
                await axios.put(`${API_URL}/themes/${theme.id}`, updatedData, getAuthHeaders());
                fetchThemes();
                
                // Immediately apply the new theme to the current session
                saveThemeToStorage(updatedData);
                applyTheme(updatedData);
            } catch (error) {
                console.error("Failed to set active theme", error);
            }
        }
    };

    return (
        <CompanyHubLayout>
            <div className="flex flex-col h-full bg-slate-50">
                <header className="bg-white shadow-sm p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/company-settings')} className="p-2 rounded-full hover:bg-slate-100">
                                <ArrowLeft className="h-5 w-5 text-slate-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">Theme Management</h1>
                                <p className="text-sm text-slate-500">Manage your company's branding and appearance.</p>
                            </div>
                        </div>
                        <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Plus className="h-4 w-4" /> New Theme
                        </button>
                    </div>
                </header>

                <main className="p-6 overflow-auto">
                    {loading ? (
                        <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {themes.map(theme => (
                                <div key={theme.id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden flex flex-col ${theme.isActive ? 'border-green-500 ring-4 ring-green-500/10' : 'border-transparent'}`}>
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-lg text-slate-800">{theme.name}</h3>
                                            {theme.isActive && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</span>}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full shadow-sm border border-slate-200" style={{ backgroundColor: theme.primaryColor }} title="Primary"></div>
                                                <div className="w-8 h-8 rounded-full shadow-sm border border-slate-200" style={{ backgroundColor: theme.secondaryColor }} title="Secondary"></div>
                                                <div className="w-8 h-8 rounded-full shadow-sm border border-slate-200" style={{ backgroundColor: theme.accentColor }} title="Accent"></div>
                                                <div className="w-8 h-8 rounded-full shadow-sm border border-slate-200" style={{ backgroundColor: theme.backgroundColor }} title="Background"></div>
                                            </div>
                                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                                <Type className="h-4 w-4" /> {theme.fontFamily || 'Default Font'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-between items-center">
                                        {!theme.isActive && (
                                            <button onClick={() => toggleActive(theme)} className="text-xs font-medium text-slate-600 hover:text-green-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200 transition-colors">
                                                <Monitor className="h-3 w-3" /> Activate
                                            </button>
                                        )}
                                        <div className="flex gap-1 ml-auto">
                                            <button onClick={() => handleEdit(theme)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            {!theme.isActive && (
                                                <button onClick={() => handleDelete(theme.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {themes.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-400">
                                    <Palette className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No themes found. Create one to get started.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </CompanyHubLayout>
    );
};

export default Theme;
