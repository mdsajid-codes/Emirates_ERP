import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, Check, X, Shield, Info, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CompanyHubLayout from '../components/CompanyHubLayout';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const HangerTypes = () => {
    const navigate = useNavigate();
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTypes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/hanger/types`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTypes(response.data);
        } catch (error) {
            console.error("Error fetching hanger types", error);
            toast.error("Failed to load hanger types");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleDeactivate = async (id) => {
        if (window.confirm("Are you sure you want to deactivate this hanger type?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/hanger/types/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Hanger type deactivated");
                fetchTypes();
            } catch (error) {
                console.error("Error deactivating hanger type", error);
                toast.error("Failed to deactivate hanger type");
            }
        }
    };

    return (
        <CompanyHubLayout>
            <div className="flex flex-col h-full bg-background text-foreground">
                <header className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/company-settings')} className="p-2 hover:bg-background-muted rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">Hanger Type Masters</h1>
                            <p className="text-xs text-foreground-muted">Define production specifications for hanger types</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/hanger-settings/new')}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all text-sm"
                    >
                        <Plus className="h-4 w-4" /> Add Hanger Type
                    </button>
                </header>

                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-background-muted text-foreground-muted text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Type Name</th>
                                    <th className="px-6 py-4 font-semibold">Specs (W/H/Gauge)</th>
                                    <th className="px-6 py-4 font-semibold text-right">Unit Weight</th>
                                    <th className="px-6 py-4 font-semibold">Bundle Size</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-4 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-foreground-muted">Loading...</td></tr>
                                ) : types.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-foreground-muted">No hanger types defined yet</td></tr>
                                ) : (
                                    types.map((type) => (
                                        <tr key={type.id} className="hover:bg-background-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-foreground">{type.typeName}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold">W: {type.standardWidthCm}cm</span>
                                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold">H: {type.standardHookCm}cm</span>
                                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold">G: {type.standardWireGaugeMm}mm</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">{type.unitWeightGrams}g</td>
                                            <td className="px-6 py-4">{type.defaultBundleSize} pcs</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${type.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {type.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                                    {type.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/hanger-settings/edit/${type.id}`)}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        title="Edit Specification"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeactivate(type.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Deactivate"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td></tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </CompanyHubLayout>
    );
};

export default HangerTypes;
