import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    ArrowLeft, 
    Edit, 
    Printer, 
    Loader, 
    AlertCircle, 
    FileCheck, 
    Truck, 
    Globe, 
    DollarSign, 
    User,
    CheckCircle2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const DetailItem = ({ label, value, icon: Icon, color = "text-primary" }) => (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-background-muted/20">
        {Icon && <div className={`p-2 rounded-lg bg-card border border-border ${color}`}><Icon size={18} /></div>}
        <div>
            <p className="text-xs font-black text-foreground-muted uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-bold text-foreground">{value || '-'}</p>
        </div>
    </div>
);

const PurCustomDeclarationView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [declaration, setDeclaration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDeclaration = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/purchases/custom-declarations/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDeclaration(res.data);
            } catch (err) {
                console.error('Failed to fetch declaration', err);
                setError('Failed to load custom declaration details.');
            } finally {
                setLoading(false);
            }
        };
        fetchDeclaration();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading declaration details...</p>
            </div>
        );
    }

    if (error || !declaration) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
                <h3 className="text-lg font-bold">Error loading declaration</h3>
                <p className="text-gray-500 mb-6">{error || 'Record not found'}</p>
                <button onClick={() => navigate('/purchase-dashboard/custom-declarations')} className="px-6 py-2 bg-primary text-white rounded-lg font-bold">Go Back</button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
            {/* Header Actions */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/purchase-dashboard/custom-declarations')} className="p-2 hover:bg-background-muted rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-foreground">
                                {declaration.declarationNumber || `DECL-${declaration.id}`}
                            </h1>
                            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-widest ${
                                declaration.status?.toLowerCase() === 'posted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                                {declaration.status || 'Draft'}
                            </span>
                        </div>
                        <p className="text-sm text-foreground-muted">Custom Declaration View</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handlePrint} className="px-4 py-2 bg-white border border-border text-foreground rounded-lg font-bold flex items-center gap-2 hover:bg-background-muted transition-all shadow-sm">
                        <Printer size={18} /> Print
                    </button>
                    <button onClick={() => navigate(`/purchase-dashboard/custom-declarations/edit/${id}`)} className="px-4 py-2 bg-primary text-white rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md">
                        <Edit size={18} /> Edit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Main Info Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-border bg-background-muted/30 flex items-center gap-3">
                            <Truck className="text-primary" size={20} />
                            <h3 className="font-black text-sm uppercase tracking-widest">Declaration Particulars</h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="Declaration Number" value={declaration.declarationNumber} icon={FileCheck} />
                            <DetailItem 
                                label={declaration.isThirdPartyClearance ? "Custom Agent" : "Custom Office"} 
                                value={declaration.companyName} 
                                icon={Globe} 
                                color="text-indigo-500" 
                            />
                            <DetailItem label="Tax Payment Mode" value={declaration.taxIsDue?.replace(/_/g, ' ')} icon={DollarSign} color="text-emerald-500" />
                            <DetailItem label="Business Activity" value={declaration.businessActivity} icon={Truck} color="text-amber-500" />
                            <DetailItem label="Entity Name" value={declaration.entityName} icon={User} color="text-blue-500" />
                            <DetailItem label="Status" value={declaration.status} icon={CheckCircle2} color="text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-border bg-background-muted/30 flex items-center gap-3">
                            <Printer className="text-primary" size={20} />
                            <h3 className="font-black text-sm uppercase tracking-widest">Line Items ({declaration.lines?.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border text-sm">
                                <thead className="bg-background-muted/50 text-xs font-black uppercase text-foreground-muted">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Item</th>
                                        <th className="px-6 py-4 text-left">HS Code / Origin</th>
                                        <th className="px-6 py-4 text-right">CIF Foreign</th>
                                        <th className="px-6 py-4 text-right">CIF National</th>
                                        <th className="px-6 py-4 text-right">Duty Amt</th>
                                        <th className="px-6 py-4 text-right">VAT Amt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {declaration.lines?.map((line, idx) => (
                                        <tr key={idx} className="hover:bg-background-muted/20 transition-colors">
                                            <td className="px-6 py-4 font-bold text-foreground">
                                                {line.itemName}
                                                <div className="text-[10px] text-foreground-muted font-medium mt-1">Inv: {line.purchaseInvoiceNumber || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold">{line.hsCode || '-'}</div>
                                                <div className="text-[10px] text-foreground-muted uppercase font-black">{line.origin || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono">{line.cifForeignValue?.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-bold">{line.cifNationalValue?.toLocaleString()} AED</td>
                                            <td className="px-6 py-4 text-right font-black text-primary">{line.dutyAmount?.toLocaleString()} AED</td>
                                            <td className="px-6 py-4 text-right font-black text-emerald-600">{line.vatAmount?.toLocaleString()} AED</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-6">
                    <div className="bg-primary text-primary-foreground rounded-2xl shadow-xl p-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-widest opacity-80 mb-6">Total Due (Customs)</h3>
                            <div className="text-4xl font-black mb-2">
                                {(declaration.totalDue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                <span className="text-lg ml-2 opacity-80 font-bold">AED</span>
                            </div>
                            <p className="text-xs opacity-60 font-medium leading-relaxed">
                                Includes Duty Amount, Service Charges, and Penalties.
                            </p>
                        </div>
                        <DollarSign className="absolute -bottom-8 -right-8 h-40 w-40 opacity-10 rotate-12" />
                    </div>

                    <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-border bg-background-muted/30 flex items-center gap-3">
                            <Calculator className="text-primary" size={18} />
                            <h3 className="font-black text-sm uppercase tracking-widest">Financial Summary</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-foreground-muted font-bold">CIF Foreign Total</span>
                                <span className="font-bold">{declaration.cifForeignValueTotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-foreground-muted font-bold">CIF National Total</span>
                                <span className="font-bold">{declaration.cifNationalValueTotal?.toLocaleString()} AED</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-foreground-muted font-bold">VAT (RCM) Total</span>
                                <span className="font-black text-emerald-600">{declaration.vatReverseChargeTotal?.toLocaleString()} AED</span>
                            </div>
                            <div className="pt-4 border-t border-border flex justify-between items-center">
                                <span className="text-xs font-black uppercase text-foreground-muted">Service Charge</span>
                                <span className="font-bold text-primary">{declaration.serviceCharge?.toLocaleString()} AED</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase text-foreground-muted">Custom Penalty</span>
                                <span className="font-bold text-rose-500">{declaration.customPenaltyAmount?.toLocaleString()} AED</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground-muted mb-4 flex items-center gap-2">
                            <User size={14} /> Responsible Person
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                                {declaration.responsiblePersonName?.[0] || 'U'}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-foreground">{declaration.responsiblePersonName || 'Not Assigned'}</div>
                                <div className="text-[10px] text-foreground-muted font-medium">Internal User</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurCustomDeclarationView;
