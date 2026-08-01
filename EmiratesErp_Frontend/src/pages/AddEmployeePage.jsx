import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { ArrowLeft, ArrowRight, Check, Loader, User, Briefcase, FileText, Clock, Eye, EyeOff, Sparkles, ChevronDown, X } from 'lucide-react';
import axios from 'axios';

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
                        {options.map((opt) => {
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
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

const EditField = ({ label, name, value, onChange, type = 'text', options = [], required = false, onGenerate = null, onAddClick = null, ...rest }) => {
    const [showPassword, setShowPassword] = useState(false);

    const commonProps = {
        id: name,
        name: name,
        value: value ?? '',
        onChange: onChange,
        required: required,
        ...rest
    };

    const isPassword = type === 'password';

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label htmlFor={name} className="block text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
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
                                value: val,
                            }
                        });
                    }}
                    placeholder="Select..."
                />
            ) : (
                <div className="relative">
                    <input 
                        {...commonProps} 
                        type={isPassword ? (showPassword ? 'text' : 'password') : type} 
                        className={`w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all ${isPassword || onGenerate ? 'pr-8' : ''}`}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-foreground-muted hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                    )}
                    {onGenerate && (
                        <button
                            type="button"
                            onClick={onGenerate}
                            className="absolute inset-y-0 right-0 pr-2 flex items-center text-primary hover:text-primary/80 transition-colors p-1"
                            title="Auto Generate Employee Code (EMP+4 digits)"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
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

const AddEmployeePage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const [formData, setFormData] = useState({
        user: { name: '', email: '', password: '', confirmPassword: '' },
        employee: { employeeCode: '', firstName: '', middleName: '', lastName: '', emailWork: '', emailPersonal: '', phonePrimary: '', dob: '', locationId: null, gender: '', martialStatus: '', status: 'ACTIVE' },
        profile: { address: '', city: '', state: '', country: '', postalCode: '', emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '', bankName: '', bankAccountNumber: '', ifscCode: '', bloodGroup: '', laborCardNumber: '', laborCardExpiry: '', molId: '', routingCode: '', notes: '', nationality: '', preferredName: '', jobType: '', office: '', iban: '', paymentMethod: '', isWpsRegistered: false },
        jobDetails: { location: '', actualLocation: '', department: '', designation: '', jobBand: '', reportsTo: '', dateOfJoining: '', probationEndDate: '', loginId: '', profileName: '', employeeNumber: '', legalEntity: '' },
        timeAttendence: { timeTypeId: null, workTypeId: null, shiftTypeId: null, weeklyOffPolicyId: null, leaveGroupId: null, attendenceCaptureScheme: '', attendancePolicyId: null, holidayList: '', expensePolicy: '', recruitmentPolicy: '', isRosterBasedEmployee: false }
    });

    const [activeModal, setActiveModal] = useState(null);

    const fetchAllOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [deptRes, desigRes, jobBandRes] = await Promise.all([
                axios.get(`${API_URL}/departments`, { headers }),
                axios.get(`${API_URL}/designations`, { headers }),
                axios.get(`${API_URL}/jobBands`, { headers })
            ]);
            setSelectOptions(prev => ({
                ...prev,
                departments: deptRes.data,
                designations: desigRes.data,
                jobBands: jobBandRes.data,
            }));
        } catch (err) {
            console.error("Error fetching options:", err);
        }
    };

    const handleDepartmentAdded = async (newDeptName) => {
        await fetchAllOptions();
        setFormData(prev => ({
            ...prev,
            jobDetails: { ...prev.jobDetails, department: newDeptName }
        }));
    };

    const handleDesignationAdded = async (newDesigTitle) => {
        await fetchAllOptions();
        setFormData(prev => ({
            ...prev,
            jobDetails: { ...prev.jobDetails, designation: newDesigTitle }
        }));
    };

    const handleJobBandAdded = async (newJobBandName) => {
        await fetchAllOptions();
        setFormData(prev => ({
            ...prev,
            jobDetails: { ...prev.jobDetails, jobBand: newJobBandName }
        }));
    };

    const [selectOptions, setSelectOptions] = useState({
        departments: [],
        designations: [],
        jobBands: [],
        nationalities: [],
        workTypes: [],
        shiftTypes: [],
        leaveGroups: [],
        weeklyOffPolicies: [],
        timeTypes: [],
        attendanceTrackingPolicies: [],
    });
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };
                const [deptRes, desigRes, jobBandRes, natRes, workTypeRes, shiftTypeRes, leaveGroupRes, weekOffRes, timeTypeRes, locRes, attendanceTrackingRes] = await Promise.all([
                    axios.get(`${API_URL}/departments`, { headers }),
                    axios.get(`${API_URL}/designations`, { headers }),
                    axios.get(`${API_URL}/jobBands`, { headers }),
                    axios.get(`${API_URL}/nationalities`, { headers }),
                    axios.get(`${API_URL}/work-types`, { headers }),
                    axios.get(`${API_URL}/shift-types`, { headers }),
                    axios.get(`${API_URL}/leave-groups`, { headers }),
                    axios.get(`${API_URL}/weekly-off-policies`, { headers }),
                    axios.get(`${API_URL}/time-types`, { headers }),
                    axios.get(`${API_URL}/locations`, { headers }),
                    axios.get(`${API_URL}/attendance-policies`, { headers }),
                ]);
                setSelectOptions({
                    departments: deptRes.data,
                    designations: desigRes.data,
                    jobBands: jobBandRes.data,
                    nationalities: natRes.data,
                    workTypes: workTypeRes.data,
                    shiftTypes: shiftTypeRes.data,
                    leaveGroups: leaveGroupRes.data,
                    weeklyOffPolicies: weekOffRes.data,
                    timeTypes: timeTypeRes.data,
                    attendanceTrackingPolicies: attendanceTrackingRes.data,
                });
                setLocations(locRes.data);
            } catch (err) {
                console.error("Error fetching dropdown options for Add Employee page:", err);
            }
        };
        fetchDropdownData();
    }, [API_URL]);

    const handleAutoGenerateCode = () => {
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const autoCode = `EMP${randomDigits}`;
        setFormData(prev => ({
            ...prev,
            employee: {
                ...prev.employee,
                employeeCode: autoCode,
            }
        }));
    };

    const handleNestedChange = (section) => (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: finalValue,
            },
        }));
    };

    const handleNext = () => setCurrentStep(prev => prev + 1);
    const handleBack = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.user.password !== formData.user.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            // Step 1: Create User
            await axios.post(`${API_URL}/users/register`, {
                name: formData.user.name,
                email: formData.user.email,
                password: formData.user.password,
                roles: ['EMPLOYEE'],
                isActive: true,
                isLocked: false,
            }, { headers });

            // Step 2: Register Employee
            const employeeRequest = {
                email: formData.user.email,
                ...formData.employee,
                locationId: formData.employee.locationId || null,
            };
            await axios.post(`${API_URL}/employees/register`, employeeRequest, { headers });
            const employeeCodeToUse = formData.employee.employeeCode;

            // Step 3: Profile Details
            await axios.put(`${API_URL}/employee-profiles/${employeeCodeToUse}`, formData.profile, { headers });

            // Step 4: Job Details
            await axios.put(`${API_URL}/job-details/${employeeCodeToUse}`, formData.jobDetails, { headers });

            // Step 5: Time & Attendance
            await axios.put(`${API_URL}/time-attendence/${employeeCodeToUse}`, formData.timeAttendence, { headers });

            alert('Employee added successfully!');
            navigate('/employees');

        } catch (err) {
            console.error("Error adding employee:", err);
            let errorMessage = 'An error occurred while creating employee.';
            if (err.response?.data) {
                errorMessage = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || JSON.stringify(err.response.data));
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: '1. Core Details', icon: User },
        { id: 2, title: '2. Job Details', icon: Briefcase },
        { id: 3, title: '3. Profile & Bank', icon: FileText },
        { id: 4, title: '4. Time & Attendance', icon: Clock },
    ];

    return (
        <DashboardLayout>
            <div className="p-2 space-y-2 max-w-[1600px] mx-auto font-sans bg-transparent text-foreground w-full pb-12">
                
                {/* Header Action Bar */}
                <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/employees')}
                            className="p-1.5 rounded-lg bg-background hover:bg-primary/10 text-primary border border-border transition-colors flex items-center gap-1.5 text-xs font-semibold"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back to Employees</span>
                        </button>
                        <div>
                            <h1 className="text-sm font-bold text-foreground">Add New Employee</h1>
                            <p className="text-[10px] text-foreground-muted">Complete the multi-step form below to register a new employee profile</p>
                        </div>
                    </div>
                </div>

                {/* Step Indicator Bar */}
                <div className="bg-card rounded-xl border border-border p-1.5 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                        {steps.map(step => (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(step.id)}
                                className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    currentStep === step.id
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : currentStep > step.id
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'bg-background text-foreground-muted border border-border'
                                }`}
                            >
                                <step.icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{step.title}</span>
                                {currentStep > step.id && <Check className="h-3 w-3 shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Form Container */}
                <div className="bg-card rounded-xl border border-border p-3 shadow-sm">
                    {error && (
                        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Step 1: User & Core Employee Details */}
                        {currentStep === 1 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">User Credentials</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                    <EditField label="Full Name" name="name" value={formData.user.name} onChange={handleNestedChange('user')} required />
                                    <EditField label="Login Email" name="email" type="email" value={formData.user.email} onChange={handleNestedChange('user')} required />
                                    <EditField label="Password" name="password" type="password" value={formData.user.password} onChange={handleNestedChange('user')} required />
                                    <EditField label="Confirm Password" name="confirmPassword" type="password" value={formData.user.confirmPassword} onChange={handleNestedChange('user')} required />
                                </div>

                                <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5 pt-2">Core Employee Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                    <EditField 
                                        label="Employee Code / ID" 
                                        name="employeeCode" 
                                        value={formData.employee.employeeCode} 
                                        onChange={handleNestedChange('employee')} 
                                        onGenerate={handleAutoGenerateCode}
                                        required 
                                    />
                                    <EditField label="First Name" name="firstName" value={formData.employee.firstName} onChange={handleNestedChange('employee')} required />
                                    <EditField label="Middle Name" name="middleName" value={formData.employee.middleName} onChange={handleNestedChange('employee')} />
                                    <EditField label="Last Name" name="lastName" value={formData.employee.lastName} onChange={handleNestedChange('employee')} required />
                                    <EditField label="Work Email" name="emailWork" type="email" value={formData.employee.emailWork} onChange={handleNestedChange('employee')} />
                                    <EditField label="Personal Email" name="emailPersonal" type="email" value={formData.employee.emailPersonal} onChange={handleNestedChange('employee')} />
                                    <EditField label="Primary Phone" name="phonePrimary" value={formData.employee.phonePrimary} onChange={handleNestedChange('employee')} />
                                    <EditField label="Date of Birth" name="dob" type="date" value={formData.employee.dob} onChange={handleNestedChange('employee')} />
                                    <EditField 
                                        label="Primary Location" 
                                        name="locationId" 
                                        type="select" 
                                        value={formData.employee.locationId} 
                                        onChange={handleNestedChange('employee')}
                                        options={locations.map(l => ({ value: l.id, label: l.name }))}
                                    />
                                    <EditField 
                                        label="Gender" 
                                        name="gender" 
                                        type="select" 
                                        value={formData.employee.gender} 
                                        onChange={handleNestedChange('employee')}
                                        options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]}
                                    />
                                    <EditField 
                                        label="Marital Status" 
                                        name="martialStatus" 
                                        type="select" 
                                        value={formData.employee.martialStatus} 
                                        onChange={handleNestedChange('employee')}
                                        options={[{ value: 'SINGLE', label: 'Single' }, { value: 'MARRIED', label: 'Married' }, { value: 'DIVORCED', label: 'Divorced' }, { value: 'WIDOWED', label: 'Widowed' }]}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Job Details */}
                        {currentStep === 2 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Job & Organizational Assignment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                    <EditField 
                                        label="Department" 
                                        name="department" 
                                        type="select" 
                                        value={formData.jobDetails.department} 
                                        onChange={handleNestedChange('jobDetails')}
                                        options={selectOptions.departments.map(d => ({ value: d.name, label: d.name }))}
                                        onAddClick={() => setActiveModal('department')}
                                    />
                                    <EditField 
                                        label="Designation" 
                                        name="designation" 
                                        type="select" 
                                        value={formData.jobDetails.designation} 
                                        onChange={handleNestedChange('jobDetails')}
                                        options={selectOptions.designations.map(d => ({ value: d.title, label: d.title }))}
                                        onAddClick={() => setActiveModal('designation')}
                                    />
                                    <EditField 
                                        label="Job Band" 
                                        name="jobBand" 
                                        type="select" 
                                        value={formData.jobDetails.jobBand} 
                                        onChange={handleNestedChange('jobDetails')}
                                        options={selectOptions.jobBands.map(b => ({ value: b.name, label: b.name }))}
                                        onAddClick={() => setActiveModal('jobBand')}
                                    />
                                    <EditField label="Date of Joining" name="dateOfJoining" type="date" value={formData.jobDetails.dateOfJoining} onChange={handleNestedChange('jobDetails')} />
                                    <EditField label="Probation End Date" name="probationEndDate" type="date" value={formData.jobDetails.probationEndDate} onChange={handleNestedChange('jobDetails')} />
                                    <EditField label="Legal Entity" name="legalEntity" value={formData.jobDetails.legalEntity} onChange={handleNestedChange('jobDetails')} />
                                    <EditField 
                                        label="Contract Type" 
                                        name="contractType" 
                                        type="select" 
                                        value={formData.jobDetails.contractType} 
                                        onChange={handleNestedChange('jobDetails')}
                                        options={[{ value: 'PERMANENT', label: 'Permanent' }, { value: 'TEMPORARY', label: 'Temporary' }, { value: 'CONTRACT', label: 'Contract' }]}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Additional Profile & Banking */}
                        {currentStep === 3 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Address & Emergency Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                    <EditField label="Residential Address" name="address" value={formData.profile.address} onChange={handleNestedChange('profile')} />
                                    <EditField label="City" name="city" value={formData.profile.city} onChange={handleNestedChange('profile')} />
                                    <EditField label="Country" name="country" value={formData.profile.country} onChange={handleNestedChange('profile')} />
                                    <EditField label="Emergency Contact Name" name="emergencyContactName" value={formData.profile.emergencyContactName} onChange={handleNestedChange('profile')} />
                                    <EditField label="Emergency Contact Phone" name="emergencyContactPhone" value={formData.profile.emergencyContactPhone} onChange={handleNestedChange('profile')} />
                                    <EditField 
                                        label="Nationality" 
                                        name="nationality" 
                                        type="select" 
                                        value={formData.profile.nationality} 
                                        onChange={handleNestedChange('profile')}
                                        options={selectOptions.nationalities.map(n => ({ value: n.name, label: n.name }))}
                                    />
                                </div>

                                <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5 pt-2">Banking & Payroll Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                    <EditField label="Bank Name" name="bankName" value={formData.profile.bankName} onChange={handleNestedChange('profile')} />
                                    <EditField label="Account Number" name="bankAccountNumber" value={formData.profile.bankAccountNumber} onChange={handleNestedChange('profile')} />
                                    <EditField label="IBAN Number" name="iban" value={formData.profile.iban} onChange={handleNestedChange('profile')} />
                                    <EditField label="MOL ID (Dubai/UAE)" name="molId" value={formData.profile.molId} onChange={handleNestedChange('profile')} />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Time & Attendance */}
                        {currentStep === 4 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5">Time & Policy Assignments</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                    <EditField 
                                        label="Work Type" 
                                        name="workTypeId" 
                                        type="select" 
                                        value={formData.timeAttendence.workTypeId} 
                                        onChange={handleNestedChange('timeAttendence')}
                                        options={selectOptions.workTypes.map(w => ({ value: w.id, label: w.name }))}
                                    />
                                    <EditField 
                                        label="Shift Type" 
                                        name="shiftTypeId" 
                                        type="select" 
                                        value={formData.timeAttendence.shiftTypeId} 
                                        onChange={handleNestedChange('timeAttendence')}
                                        options={selectOptions.shiftTypes.map(s => ({ value: s.id, label: s.name }))}
                                    />
                                    <EditField 
                                        label="Leave Group" 
                                        name="leaveGroupId" 
                                        type="select" 
                                        value={formData.timeAttendence.leaveGroupId} 
                                        onChange={handleNestedChange('timeAttendence')}
                                        options={selectOptions.leaveGroups.map(l => ({ value: l.id, label: l.name }))}
                                    />
                                    <EditField 
                                        label="Weekly Off Policy" 
                                        name="weeklyOffPolicyId" 
                                        type="select" 
                                        value={formData.timeAttendence.weeklyOffPolicyId} 
                                        onChange={handleNestedChange('timeAttendence')}
                                        options={selectOptions.weeklyOffPolicies.map(w => ({ value: w.id, label: w.name }))}
                                    />
                                    <EditField 
                                        label="Attendance Policy" 
                                        name="attendancePolicyId" 
                                        type="select" 
                                        value={formData.timeAttendence.attendancePolicyId} 
                                        onChange={handleNestedChange('timeAttendence')}
                                        options={selectOptions.attendanceTrackingPolicies.map(a => ({ value: a.id, label: a.policyName }))}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-3 py-1.5 rounded-lg border border-border hover:bg-background-muted text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Back
                                </button>
                            ) : <div />}

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                                >
                                    <span>Next Step</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                                >
                                    {loading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                                    <span>Save & Create Employee</span>
                                </button>
                            )}
                        </div>
                    </form>
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
        </DashboardLayout>
    );
};

export default AddEmployeePage;
