import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Loader, Edit, FileText, DollarSign, PlusCircle, Trash2, Save, ArrowLeft, Share2, Award, LogOut } from 'lucide-react';
import axios from 'axios';
import EmployeeBenefitProvisionTab from './EmployeeBenefitProvisionTab';
import EndOfServiceTab from './EndOfServiceTab';

// --- Helper Components & Functions ---
const InputField = ({ label, id, type = 'text', ...props }) => (
    <div>
        {label && <label htmlFor={id} className="block text-xs font-medium text-foreground-muted mb-1">{label}</label>}
        <input
            id={id}
            type={type}
            {...props}
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
        />
    </div>
);

const SelectField = ({ label, id, children, ...props }) => (
    <div>
        {label && <label htmlFor={id} className="block text-xs font-medium text-foreground-muted mb-1">{label}</label>}
        <select
            id={id}
            {...props}
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
        >
            {children}
        </select>
    </div>
);

const formatCurrency = (amount, currency = 'AED') => new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount || 0);

// --- Salary Structure Tab ---
const SalaryStructureTab = ({ employee }) => {
    const [structure, setStructure] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [allComponents, setAllComponents] = useState([]);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [formData, setFormData] = useState({ structureName: '', effectiveDate: '', components: [] });
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchStructureAndComponents = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const [componentsRes, structureRes] = await Promise.all([
                axios.get(`${API_URL}/salary-components`, { headers: { "Authorization": `Bearer ${token}` } }),
                axios.get(`${API_URL}/salary-structures/employee/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } }).catch(err => {
                    if (err.response && err.response.status === 404) return { data: null };
                    throw err;
                })
            ]);

            setAllComponents(componentsRes.data);
            if (structureRes.data) {
                setStructure(structureRes.data);
                setFormData({
                    structureName: structureRes.data.structureName,
                    effectiveDate: structureRes.data.effectiveDate?.split('T')[0] || '',
                    components: structureRes.data.components?.map(c => ({ componentCode: c.componentCode, value: c.value, formula: c.formula })) || []
                });
            } else {
                setStructure(null);
                setIsEditing(true); // Default to edit mode if no structure exists
                setFormData({ structureName: `${employee.firstName}'s Structure`, effectiveDate: new Date().toISOString().split('T')[0], components: [] });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [employee.employeeCode, API_URL]);

    useEffect(() => {
        fetchStructureAndComponents();
    }, [fetchStructureAndComponents]);

    const handleAddComponent = () => setFormData(prev => ({ ...prev, components: [...prev.components, { componentCode: '', value: 0, formula: '' }] }));
    const handleRemoveComponent = (index) => setFormData(prev => ({ ...prev, components: prev.components.filter((_, i) => i !== index) }));

    const handleComponentChange = (index, field, value) => {
        setFormData(prev => {
            const newComponents = [...prev.components];
            newComponents[index][field] = value;

            // Auto-calculate value if formula is provided
            const basicComponent = newComponents.find(c => {
                const componentInfo = allComponents.find(ac => ac.code === c.componentCode);
                return componentInfo?.name.toLowerCase().includes('basic') || componentInfo?.code === 'BASIC';
            });
            const basic = basicComponent ? parseFloat(basicComponent.value) : 0;

            newComponents.forEach((comp, i) => {
                if (comp.formula) {
                    try {
                        const formula = comp.formula.toLowerCase().replace(/basic/g, basic);

                        if (!/^[\d+\-*/.() ]+$/.test(formula)) {
                            console.warn(`Formula blocked (unsafe characters): ${comp.formula}`);
                            return;
                        }
                        const result = new Function(`"use strict"; return (${formula})`)();
                        if (isFinite(result)) {
                            newComponents[i].value = result.toFixed(2);
                        }
                    } catch (e) { console.warn(`Could not evaluate formula for ${comp.componentCode}:`, e); }
                }
            });
            return { ...prev, components: newComponents };
        });
    };

    const handleSave = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const payload = { ...formData, employeeCode: employee.employeeCode };
        try {
            if (structure) {
                await axios.put(`${API_URL}/salary-structures/${structure.id}`, payload, { headers: { "Authorization": `Bearer ${token}` } });
            } else {
                await axios.post(`${API_URL}/salary-structures`, payload, { headers: { "Authorization": `Bearer ${token}` } });
            }
            setIsEditing(false);
            fetchStructureAndComponents();
            alert('Salary structure saved successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save structure.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-6 w-6 text-primary" /></div>;

    if (!isEditing && structure) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                    <div>
                        <h3 className="text-sm font-bold text-foreground">{structure.structureName}</h3>
                        <p className="text-[11px] text-foreground-muted">Effective from: {new Date(structure.effectiveDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsSyncModalOpen(true)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-background-muted transition-colors flex items-center gap-1.5 text-foreground"><Share2 size={14} /> Sync Structure</button>
                        <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-background-muted transition-colors flex items-center gap-1.5 text-foreground"><Edit size={14} /> Edit</button>
                    </div>
                </div>
                <div className="space-y-2">
                    {structure.components?.map(c => (
                        <div key={c.id} className="flex justify-between items-center p-2.5 bg-background-muted/40 rounded-lg border border-border text-xs">
                            <span className="font-medium text-foreground">{c.componentName} ({c.componentCode})</span>
                            <span className="font-bold text-foreground">{formatCurrency(c.value)}</span>
                        </div>
                    ))}
                </div>
                <SyncStructureModal
                    isOpen={isSyncModalOpen}
                    onClose={() => setIsSyncModalOpen(false)}
                    structureId={structure.id}
                    currentEmployeeCode={employee.employeeCode}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground">{structure ? 'Edit Salary Structure' : 'Create Salary Structure'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField label="Structure Name" value={formData.structureName} onChange={e => setFormData(p => ({ ...p, structureName: e.target.value }))} />
                <InputField label="Effective Date" type="date" value={formData.effectiveDate} onChange={e => setFormData(p => ({ ...p, effectiveDate: e.target.value }))} />
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-foreground">Components</h4>
                    <button onClick={handleAddComponent} className="text-primary hover:underline text-xs font-semibold flex items-center gap-1">
                        <PlusCircle size={14} /> Add Component
                    </button>
                </div>
                {formData.components.map((comp, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-2.5 bg-background-muted/40 rounded-lg border border-border">
                        <SelectField label="Component" value={comp.componentCode} onChange={e => handleComponentChange(index, 'componentCode', e.target.value)}>
                            <option value="">Select Component</option>
                            {allComponents.map(c => <option key={c.code} value={c.code}>{c.name} ({c.type})</option>)}
                        </SelectField>
                        <InputField label="Value/Amount" type="number" value={comp.value} onChange={e => handleComponentChange(index, 'value', e.target.value)} />
                        <InputField label="Formula (if any)" value={comp.formula} onChange={e => handleComponentChange(index, 'formula', e.target.value)} />
                        <button onClick={() => handleRemoveComponent(index)} className="p-1.5 text-foreground-muted hover:text-rose-600 rounded-md transition-colors border border-border bg-background hover:bg-rose-500/10 flex justify-center items-center h-8" title="Remove">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
                {structure && (
                    <button onClick={() => setIsEditing(false)} className="px-3.5 py-1.5 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-lg transition-colors border border-border">
                        Cancel
                    </button>
                )}
                <button onClick={handleSave} className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-2xs">
                    <Save size={14} /> Save Structure
                </button>
            </div>
        </div>
    );
};

const SyncStructureModal = ({ isOpen, onClose, structureId, currentEmployeeCode }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployees, setSelectedEmployees] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [isSyncing, setIsSyncing] = useState(false);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (isOpen) {
            const fetchEmployees = async () => {
                setSearchTerm('');
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const headers = { "Authorization": `Bearer ${token}` };

                    const [employeesRes, departmentsRes] = await Promise.all([
                        axios.get(`${API_URL}/employees/all`, { headers }),
                        axios.get(`${API_URL}/departments`, { headers })
                    ]);

                    setDepartments(departmentsRes.data);

                    // Fetch job details for all employees to get department info
                    const employeesWithJobDetails = await Promise.all(
                        employeesRes.data.map(async (emp) => {
                            try {
                                const jobDetailsRes = await axios.get(`${API_URL}/job-details/${emp.employeeCode}`, { headers });
                                return { ...emp, jobDetails: jobDetailsRes.data };
                            } catch (err) {
                                return { ...emp, jobDetails: null };
                            }
                        })
                    );

                    // Exclude the current employee from the list
                    setEmployees(employeesWithJobDetails.filter(e => e.employeeCode !== currentEmployeeCode));
                } catch (err) {
                    console.error("Failed to fetch employees for sync:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchEmployees();
        }
    }, [isOpen, API_URL, currentEmployeeCode]);

    const filteredEmployees = useMemo(() => {
        let filtered = employees;

        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(emp => emp.jobDetails?.department === selectedDepartment);
        }

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(emp =>
                `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(lowercasedFilter) ||
                emp.employeeCode.toLowerCase().includes(lowercasedFilter));
        }
        return filtered;
    }, [employees, searchTerm, selectedDepartment]);

    const handleSelect = (employeeCode) => {
        setSelectedEmployees(prev => {
            const newSet = new Set(prev);
            if (newSet.has(employeeCode)) {
                newSet.delete(employeeCode);
            } else {
                newSet.add(employeeCode);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            const allVisibleCodes = new Set(filteredEmployees.map(emp => emp.employeeCode));
            setSelectedEmployees(allVisibleCodes);
        } else {
            setSelectedEmployees(new Set());
        }
    };

    const areAllSelected = useMemo(() => {
        return filteredEmployees.length > 0 && filteredEmployees.every(emp => selectedEmployees.has(emp.employeeCode));
    }, [filteredEmployees, selectedEmployees]);

    const handleSync = async () => {
        if (selectedEmployees.size === 0) {
            alert("Please select at least one employee to sync.");
            return;
        }
        setIsSyncing(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                structureId,
                employeeCodes: Array.from(selectedEmployees),
            };
            await axios.post(`${API_URL}/salary-structures/sync`, payload, { headers: { "Authorization": `Bearer ${token}` } });
            alert(`Successfully synced structure to ${selectedEmployees.size} employee(s).`);
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to sync structure.");
        } finally {
            setIsSyncing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
                <h3 className="text-lg font-semibold p-4 border-b">Sync Salary Structure</h3>
                <div className="p-4 border-b flex gap-2">
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="block w-1/3 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.name}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                    <input
                        className="block w-2/3 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="p-4 overflow-y-auto space-y-2">
                    {loading ? <Loader className="animate-spin mx-auto" /> : <>
                        <label className="flex items-center gap-3 p-2 rounded bg-slate-50 cursor-pointer font-medium">
                            <input type="checkbox" checked={areAllSelected} onChange={handleSelectAll} className="h-4 w-4 rounded" />
                            <span>Select All Visible</span>
                        </label>
                        {filteredEmployees.map(emp => (
                            <label key={emp.employeeCode} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                                <input type="checkbox" checked={selectedEmployees.has(emp.employeeCode)} onChange={() => handleSelect(emp.employeeCode)} className="h-4 w-4 rounded" />
                                <span>{emp.firstName} {emp.lastName} ({emp.employeeCode})</span>
                            </label>
                        ))}</>}
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="btn-secondary" disabled={isSyncing}>Cancel</button>
                    <button onClick={handleSync} className="btn-primary flex items-center gap-2" disabled={isSyncing}>
                        {isSyncing && <Loader className="animate-spin h-4 w-4" />} Sync to Selected ({selectedEmployees.size})
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Payslips Tab ---
const PayslipsTab = ({ employee }) => {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchPayslips = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/payslips/employee/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } });
            setPayslips(response.data.sort((a, b) => new Date(b.payDate) - new Date(a.payDate)));
        } catch (err) {
            console.error("Error fetching payslips:", err);
        } finally {
            setLoading(false);
        }
    }, [employee.employeeCode, API_URL]);

    useEffect(() => { fetchPayslips(); }, [fetchPayslips]);

    const handleDownload = async (payslipId) => {
        setDownloadingId(payslipId);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/payslips/${payslipId}/download`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let filename = `payslip-${payslipId}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length > 1) filename = filenameMatch[1];
            }
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download payslip.');
        } finally {
            setDownloadingId(null);
        }
    };

    if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Payslip History</h3>
            {payslips.length === 0 ? (
                <p className="text-slate-500">No payslips found for this employee.</p>
            ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Pay Period</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Net Salary</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200 text-slate-700">
                            {payslips.map(p => (
                                <tr key={p.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        {p.payDate ? new Date(p.payDate).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'N/A'}
                                        {p.gratuityPayout > 0 && (
                                            <span className="ml-2 text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Final Settlement</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatCurrency(p.netSalary)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">{p.status}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <button onClick={() => handleDownload(p.id)} className="btn-secondary py-1 px-2 text-xs" disabled={downloadingId === p.id}>
                                            {downloadingId === p.id ? <Loader className="animate-spin h-4 w-4" /> : 'Download'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
const EmployeePayroll = ({ searchTerm = "" }) => {
    const [allEmployees, setAllEmployees] = useState([]);
    const [employee, setEmployee] = useState(null);
    const [listLoading, setListLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Salary Structure');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchInitialData = async () => {
            setListLoading(true);
            setError("");
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/employees/all`, { headers: { "Authorization": `Bearer ${token}` } });
                setAllEmployees(response.data);
            } catch (err) {
                setError("Failed to fetch employee list.");
                console.error(err);
            } finally {
                setListLoading(false);
            }
        };
        fetchInitialData();
    }, [API_URL]);

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return allEmployees;
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        return allEmployees.filter(emp =>
            (emp.firstName && emp.firstName.toLowerCase().includes(lowercasedFilter)) ||
            (emp.lastName && emp.lastName.toLowerCase().includes(lowercasedFilter)) ||
            (`${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().includes(lowercasedFilter)) ||
            (emp.employeeCode && emp.employeeCode.toLowerCase().includes(lowercasedFilter))
        );
    }, [allEmployees, searchTerm]);

    const handleSelectEmployee = (emp) => {
        setEmployee(emp);
    };

    const handleBackToList = () => {
        setEmployee(null);
    };

    const subTabs = [
        { name: 'Salary Structure', icon: DollarSign, component: SalaryStructureTab },
        { name: 'Payslips', icon: FileText, component: PayslipsTab },
        { name: 'Benefit Provisions', icon: Award, component: EmployeeBenefitProvisionTab },
        { name: 'End of Service', icon: LogOut, component: EndOfServiceTab },
    ];

    const ActiveSubComponent = subTabs.find(tab => tab.name === activeTab)?.component;

    return (
        <div className="space-y-3">
            {employee && (
                <div className="flex items-center gap-4 mb-3">
                    <button
                        onClick={handleBackToList}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-background-muted transition-colors flex items-center gap-1.5 text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Employee List
                    </button>
                </div>
            )}

            {error && (
                <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-lg border border-rose-500/20">
                    {error}
                </div>
            )}

            {!employee ? (
                listLoading ? (
                    <div className="flex justify-center items-center p-8 bg-card rounded-lg border border-border">
                        <Loader className="animate-spin h-6 w-6 text-primary" />
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="min-w-full bg-card text-foreground divide-y divide-border">
                            <thead className="bg-background-muted/60">
                                <tr>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Name</th>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Employee Code</th>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Work Email</th>
                                    <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                                    <tr key={emp.employeeCode || emp.id} onClick={() => handleSelectEmployee(emp)} className="cursor-pointer hover:bg-background-muted/40 transition-colors">
                                        <td className="px-3 py-2 text-xs font-semibold text-foreground">{emp.firstName} {emp.lastName}</td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted font-medium">{emp.employeeCode}</td>
                                        <td className="px-3 py-2 text-xs text-foreground-muted">{emp.emailWork || '-'}</td>
                                        <td className="px-3 py-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${emp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                                {emp.status?.toLowerCase() || 'active'}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-foreground-muted text-xs">No employees found matching your search.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5 p-2 bg-card border border-border rounded-lg">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs border border-primary/20 shrink-0">
                            {employee.firstName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-xs text-foreground leading-tight">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-[10px] text-foreground-muted leading-tight">{employee.employeeCode}</p>
                        </div>
                    </div>

                    <div className="border-b border-border pb-0.5 mb-3">
                        <nav className="-mb-px flex space-x-3 overflow-x-auto" aria-label="Sub-tabs">
                            {subTabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`whitespace-nowrap flex items-center gap-1.5 py-1 px-0.5 border-b-2 font-medium text-[11px] transition-colors ${activeTab === tab.name
                                        ? 'border-primary text-primary font-bold'
                                        : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
                                        }`}
                                >
                                    <tab.icon className="h-3.5 w-3.5" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div>
                        {ActiveSubComponent && <ActiveSubComponent employee={employee} />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeePayroll;