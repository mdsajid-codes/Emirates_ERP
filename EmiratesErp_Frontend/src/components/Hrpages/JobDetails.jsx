import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, Loader, ChevronDown, Plus, Sparkles } from 'lucide-react';
import axios from 'axios';

// Reusable component for a field in view mode
const InfoField = ({ label, value }) => (
    <div className="bg-background/60 border border-border/60 rounded-xl p-2.5 space-y-0.5 shadow-2xs">
        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">{label}</p>
        <p className="text-xs font-semibold text-foreground truncate">{value || 'N/A'}</p>
    </div>
);

// Custom Container Dropdown Component
const CustomSelect = ({ value, options, onChange, placeholder = "Select..." }) => {
    const [open, setOpen] = useState(false);
    const selectedOption = options.find(o => String(o.value) === String(value));

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full bg-background border border-border hover:border-primary/50 rounded-lg px-2.5 py-1.5 text-xs text-foreground flex items-center justify-between transition-all shadow-xs"
            >
                <span className="truncate font-medium">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-foreground-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl py-1.5 z-50 max-h-48 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-100">
                        {options.length > 0 ? (
                            options.map((opt) => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setOpen(false);
                                        }}
                                        className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between transition-colors ${
                                            isSelected 
                                                ? 'bg-primary/10 text-primary font-bold' 
                                                : 'text-foreground hover:bg-background-muted'
                                        }`}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-2 text-xs text-foreground-muted text-center">No options available</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// Reusable component for an editable field
const EditField = ({ label, name, value, onChange, type = 'text', options = [], onAddClick }) => {
    const commonProps = {
        id: name,
        name: name,
        value: value ?? '',
        onChange: onChange,
        className: "w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label htmlFor={name} className="block text-[11px] font-bold text-foreground-muted uppercase tracking-wider">{label}</label>
                {onAddClick && (
                    <button 
                        type="button" 
                        onClick={onAddClick}
                        className="text-[10px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                        + Add
                    </button>
                )}
            </div>
            {type === 'select' ? (
                <CustomSelect
                    value={value}
                    options={options}
                    onChange={(val) => {
                        onChange({
                            target: {
                                name: name,
                                value: val
                            }
                        });
                    }}
                />
            ) : (
                <input {...commonProps} type={type} />
            )}
        </div>
    );
};

// --- Modal Component for Adding Department ---
const AddDepartmentModal = ({ isOpen, onClose, onSuccess, API_URL }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !code) {
            setErr('Department name and code are required.');
            return;
        }
        setLoading(true);
        setErr('');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/departments`, { name, code, description }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            onSuccess(name);
            setName(''); setCode(''); setDescription('');
            onClose();
        } catch (error) {
            setErr(error.response?.data?.message || 'Failed to add department');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-2xl w-full max-w-md space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-sm font-bold text-foreground">Add New Department</h3>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                {err && <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-xs font-semibold">{err}</div>}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Department Name *</label>
                        <input value={name} onChange={e => setName(e.target.value)} required className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Department Code *</label>
                        <div className="relative">
                            <input 
                                value={code} 
                                onChange={e => setCode(e.target.value)} 
                                required 
                                className="w-full px-2.5 py-1.5 pr-8 bg-background border border-border rounded-lg text-xs font-medium"
                                placeholder="e.g. DEPT1001"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const randomCode = 'DEPT' + Math.floor(1000 + Math.random() * 9000);
                                    setCode(randomCode);
                                }}
                                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-primary hover:text-primary/80 transition-colors"
                                title="Auto Generate Department Code (DEPT + 4 digits)"
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                        <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold">Cancel</button>
                        <button type="submit" disabled={loading} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold flex items-center gap-1">
                            {loading ? <Loader className="animate-spin h-3.5 w-3.5" /> : 'Save Department'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Modal Component for Adding Designation ---
const AddDesignationModal = ({ isOpen, onClose, onSuccess, departments, API_URL }) => {
    const [title, setTitle] = useState('');
    const [level, setLevel] = useState('');
    const [departmentCode, setDepartmentCode] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !level || !departmentCode) {
            setErr('Title, Level, and Department are required.');
            return;
        }
        setLoading(true);
        setErr('');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/designations/for-department/${departmentCode}`, { title, level: String(level), description }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            onSuccess(title);
            setTitle(''); setLevel(''); setDepartmentCode(''); setDescription('');
            onClose();
        } catch (error) {
            setErr(error.response?.data?.message || 'Failed to add designation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-2xl w-full max-w-md space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-sm font-bold text-foreground">Add New Designation</h3>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                {err && <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-xs font-semibold">{err}</div>}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Designation Title *</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Department *</label>
                        <CustomSelect
                            value={departmentCode}
                            options={departments.map(d => ({ value: d.code, label: d.name }))}
                            onChange={(val) => setDepartmentCode(val)}
                            placeholder="Select Department..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Level *</label>
                        <input value={level} onChange={e => setLevel(e.target.value)} required className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs" placeholder="e.g. L4 or Junior" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                        <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold">Cancel</button>
                        <button type="submit" disabled={loading} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold flex items-center gap-1">
                            {loading ? <Loader className="animate-spin h-3.5 w-3.5" /> : 'Save Designation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Modal Component for Adding Job Band ---
const AddJobBandModal = ({ isOpen, onClose, onSuccess, designations, API_URL }) => {
    const [name, setName] = useState('');
    const [level, setLevel] = useState('');
    const [designationId, setDesignationId] = useState('');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !designationId) {
            setErr('Band name and Designation are required.');
            return;
        }
        setLoading(true);
        setErr('');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/jobBands/for-designation/${designationId}`, {
                name,
                level: String(level || ''),
                minSalary: minSalary ? Number(minSalary) : 0,
                maxSalary: maxSalary ? Number(maxSalary) : 0
            }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            onSuccess(name);
            setName(''); setLevel(''); setDesignationId(''); setMinSalary(''); setMaxSalary('');
            onClose();
        } catch (error) {
            setErr(error.response?.data?.message || 'Failed to add job band');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-2xl w-full max-w-md space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-sm font-bold text-foreground">Add New Job Band</h3>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                {err && <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-xs font-semibold">{err}</div>}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Band Name *</label>
                        <input value={name} onChange={e => setName(e.target.value)} required className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Designation *</label>
                        <CustomSelect
                            value={designationId}
                            options={designations.map(d => ({ value: d.id, label: d.title }))}
                            onChange={(val) => setDesignationId(val)}
                            placeholder="Select Designation..."
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">Level</label>
                            <input value={level} onChange={e => setLevel(e.target.value)} className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs" placeholder="e.g. 4" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">Min (AED)</label>
                            <input type="number" value={minSalary} onChange={e => setMinSalary(e.target.value)} className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">Max (AED)</label>
                            <input type="number" value={maxSalary} onChange={e => setMaxSalary(e.target.value)} className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                        <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold">Cancel</button>
                        <button type="submit" disabled={loading} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold flex items-center gap-1">
                            {loading ? <Loader className="animate-spin h-3.5 w-3.5" /> : 'Save Job Band'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const JobDetails = ({ employee }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [jobDetails, setJobDetails] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectOptions, setSelectOptions] = useState({
        departments: [],
        designations: [],
        jobBands: [],
    });

    // Modal state
    const [activeModal, setActiveModal] = useState(null); // 'department' | 'designation' | 'jobBand' | null

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const initialFormState = {
        location: '', actualLocation: '', department: '', designation: '', jobBand: '',
        reportsTo: '', dateOfJoining: '', probationEndDate: '', loginId: '',
        profileName: '', employeeNumber: '', legalEntity: '', contractType: '',
    };

    const fetchAllOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [deptRes, desigRes, jobBandRes] = await Promise.all([
                axios.get(`${API_URL}/departments`, { headers }),
                axios.get(`${API_URL}/designations`, { headers }),
                axios.get(`${API_URL}/jobBands`, { headers })
            ]);
            setSelectOptions({
                departments: deptRes.data,
                designations: desigRes.data,
                jobBands: jobBandRes.data,
            });
        } catch (err) {
            console.error("Error fetching options:", err);
        }
    };

    useEffect(() => {
        const fetchJobDetails = async () => {
            if (!employee?.employeeCode) return;
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };
                const [detailsRes, deptRes, desigRes, jobBandRes] = await Promise.all([
                    axios.get(`${API_URL}/job-details/${employee.employeeCode}`, { headers }),
                    axios.get(`${API_URL}/departments`, { headers }),
                    axios.get(`${API_URL}/designations`, { headers }),
                    axios.get(`${API_URL}/jobBands`, { headers })
                ]);

                setJobDetails(detailsRes.data);
                setFormData(detailsRes.data);
                setSelectOptions({
                    departments: deptRes.data,
                    designations: desigRes.data,
                    jobBands: jobBandRes.data,
                });
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setJobDetails(null);
                    setFormData(initialFormState);
                    setError('No job details found for this employee. You can add them now.');
                } else {
                    console.error("Error fetching job details:", err);
                    setError('Failed to load job details. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [employee, API_URL]);

    if (!employee) {
        return <div className="text-center text-slate-500">No employee selected.</div>;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(jobDetails || initialFormState);
        setError('');
    };

    const handleSave = async () => {
        setSaveLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/job-details/${employee.employeeCode}`, formData, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setJobDetails(response.data);
            setFormData(response.data);
            setIsEditing(false);
            alert('Job details updated successfully!');
        } catch (err) {
            console.error("Error updating job details:", err);
            const errorMessage = err.response?.data?.message || 'Failed to update job details. Please try again.';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDepartmentAdded = async (newDeptName) => {
        await fetchAllOptions();
        setFormData(prev => ({ ...prev, department: newDeptName }));
    };

    const handleDesignationAdded = async (newDesigTitle) => {
        await fetchAllOptions();
        setFormData(prev => ({ ...prev, designation: newDesigTitle }));
    };

    const handleJobBandAdded = async (newJobBandName) => {
        await fetchAllOptions();
        setFormData(prev => ({ ...prev, jobBand: newJobBandName }));
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    return (
        <div className="space-y-2.5">
            <div className="flex justify-end gap-2">
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className="px-3 py-1.5 rounded-lg border border-border hover:bg-background-muted text-xs font-semibold transition-colors" disabled={saveLoading}>Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs" disabled={saveLoading}>
                            {saveLoading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                            Save Details
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Details
                    </button>
                )}
            </div>
            {error && <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}
            
            <div className="bg-card border border-border rounded-2xl p-3 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                    <h3 className="text-xs font-bold text-foreground tracking-tight">Job & Employment Details</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {isEditing ? (
                        <>
                            <EditField 
                                label="Department" 
                                name="department" 
                                value={formData.department} 
                                onChange={handleChange} 
                                type="select" 
                                options={selectOptions.departments.map(d => ({ value: d.name, label: d.name }))} 
                                onAddClick={() => setActiveModal('department')}
                            />
                            <EditField 
                                label="Designation" 
                                name="designation" 
                                value={formData.designation} 
                                onChange={handleChange} 
                                type="select" 
                                options={selectOptions.designations.map(d => ({ value: d.title, label: d.title }))} 
                                onAddClick={() => setActiveModal('designation')}
                            />
                            <EditField 
                                label="Job Band" 
                                name="jobBand" 
                                value={formData.jobBand} 
                                onChange={handleChange} 
                                type="select" 
                                options={selectOptions.jobBands.map(j => ({ value: j.name, label: j.name }))} 
                                onAddClick={() => setActiveModal('jobBand')}
                            />
                            <EditField label="Reports To" name="reportsTo" value={formData.reportsTo} onChange={handleChange} />
                            <EditField label="Date of Joining" name="dateOfJoining" value={formData.dateOfJoining?.split('T')[0]} onChange={handleChange} type="date" />
                            <EditField label="Probation End Date" name="probationEndDate" value={formData.probationEndDate?.split('T')[0]} onChange={handleChange} type="date" />
                            <EditField label="Location" name="location" value={formData.location} onChange={handleChange} />
                            <EditField label="Actual Location" name="actualLocation" value={formData.actualLocation} onChange={handleChange} />
                            <EditField label="Legal Entity" name="legalEntity" value={formData.legalEntity} onChange={handleChange} />
                            <EditField label="Login ID" name="loginId" value={formData.loginId} onChange={handleChange} />
                            <EditField label="Profile Name" name="profileName" value={formData.profileName} onChange={handleChange} />
                            <EditField label="Employee Number" name="employeeNumber" value={formData.employeeNumber} onChange={handleChange} />
                            <EditField label="Contract Type" name="contractType" value={formData.contractType} onChange={handleChange} type="select" options={[{ value: 'LIMITED', label: 'Limited' }, { value: 'UNLIMITED', label: 'Unlimited' }]} />
                        </>
                    ) : (
                        <>
                            <InfoField label="Department" value={jobDetails?.department} />
                            <InfoField label="Designation" value={jobDetails?.designation} />
                            <InfoField label="Job Band" value={jobDetails?.jobBand} />
                            <InfoField label="Reports To" value={jobDetails?.reportsTo} />
                            <InfoField label="Date of Joining" value={jobDetails?.dateOfJoining} />
                            <InfoField label="Probation End Date" value={jobDetails?.probationEndDate} />
                            <InfoField label="Location" value={jobDetails?.location} />
                            <InfoField label="Actual Location" value={jobDetails?.actualLocation} />
                            <InfoField label="Legal Entity" value={jobDetails?.legalEntity} />
                            <InfoField label="Login ID" value={jobDetails?.loginId} />
                            <InfoField label="Profile Name" value={jobDetails?.profileName} />
                            <InfoField label="Employee Number" value={jobDetails?.employeeNumber} />
                            <InfoField label="Contract Type" value={jobDetails?.contractType} />
                        </>
                    )}
                </div>
            </div>

            {/* Modals for Adding Master Data */}
            <AddDepartmentModal
                isOpen={activeModal === 'department'}
                onClose={() => setActiveModal(null)}
                onSuccess={handleDepartmentAdded}
                API_URL={API_URL}
            />
            <AddDesignationModal
                isOpen={activeModal === 'designation'}
                onClose={() => setActiveModal(null)}
                onSuccess={handleDesignationAdded}
                departments={selectOptions.departments}
                API_URL={API_URL}
            />
            <AddJobBandModal
                isOpen={activeModal === 'jobBand'}
                onClose={() => setActiveModal(null)}
                onSuccess={handleJobBandAdded}
                designations={selectOptions.designations}
                API_URL={API_URL}
            />
        </div>
    );
};

export default JobDetails;
