import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { User, FileText, Briefcase, MapPin, Search, Loader, Users, Camera, ArrowLeft, Mail, Phone, Clock, ChevronDown, Filter, Check, RotateCcw, UserPlus, FileDown, UploadCloud, Download, MoreVertical } from 'lucide-react';
import axios from 'axios';
import Profile from '../components/Hrpages/Profile';
import Leave from '../components/Hrpages/Leave';
import Payroll from '../components/Hrpages/Payroll';
import Address from '../components/Hrpages/Address';
import Documents from '../components/Hrpages/Documents';
import JobDetails from '../components/Hrpages/JobDetails';
import TimeAttendence from '../components/Hrpages/TimeAttendence';
import AddEmployeeModal from './AddEmployeeModal';
import BulkAddEmployeesModal from './BulkAddEmployeesModal';

const employeeNavLinks = [
    { name: 'Profile', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { name: 'Job Details', icon: Briefcase, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { name: 'Time & Attendance', icon: Clock, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
    { name: 'Address & Bank Details', icon: MapPin, color: 'text-green-600', bgColor: 'bg-green-100' },
    { name: 'Documents', icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-100' },
];

const CustomSelect = ({ label, icon: Icon, value, options, onChange, placeholder = "Select..." }) => {
    const [open, setOpen] = useState(false);
    const selectedOption = options.find(o => String(o.value) === String(value));

    return (
        <div className="relative w-full">
            {label && <label className="block text-[10px] font-extrabold text-foreground-muted uppercase tracking-wider mb-1">{label}</label>}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full bg-background border border-border hover:border-primary/50 rounded-xl px-3 py-1.5 text-xs text-foreground flex items-center justify-between transition-all shadow-xs"
            >
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon className="h-3.5 w-3.5 text-foreground-muted shrink-0" />}
                    <span className="truncate font-medium">{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
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

const Employee = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Profile');
    const [employee, setEmployee] = useState(null);
    const [allEmployees, setAllEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [photoUrl, setPhotoUrl] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedGender, setSelectedGender] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleTemplateDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/employees/bulk-template`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'employee_bulk_upload_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading template:", err);
            alert("Failed to download template.");
        }
    };

    const handleExport = () => {
        if (!filteredEmployees.length) {
            alert("No employees to export.");
            return;
        }
        const csvContent = "data:text/csv;charset=utf-8," 
            + ["Code,First Name,Last Name,Email,Gender,Status"]
            .concat(filteredEmployees.map(e => `"${e.employeeCode || ''}","${e.firstName || ''}","${e.lastName || ''}","${e.emailWork || ''}","${e.gender || ''}","${e.status || ''}"`))
            .join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const fetchAllEmployeesAndLocations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [employeesRes, locationsRes, departmentsRes] = await Promise.all([
                axios.get(`${API_URL}/employees/all`, { headers }),
                axios.get(`${API_URL}/locations`, { headers }),
                axios.get(`${API_URL}/departments`, { headers }),
            ]);

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

            setAllEmployees(employeesWithJobDetails);
            setLocations(locationsRes.data);
            setDepartments(departmentsRes.data);
        } catch (err) {
            console.error("Error fetching initial data:", err);
            setError("Failed to load employee and location data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllEmployeesAndLocations();
    }, []);

    useEffect(() => {
        if (employee?.employeeCode && employee.photoPath) {
            const fetchPhoto = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${API_URL}/employees/${employee.employeeCode}/photo`, {
                        headers: { Authorization: `Bearer ${token}` },
                        responseType: 'blob'
                    });
                    const objectURL = URL.createObjectURL(response.data);
                    setPhotoUrl(objectURL);
                } catch (error) {
                    console.error("Could not load employee photo", error);
                    setPhotoUrl(null);
                }
            };
            fetchPhoto();
        } else {
            setPhotoUrl(null);
        }

        return () => {
            if (photoUrl) {
                URL.revokeObjectURL(photoUrl);
            }
        };
    }, [employee]);

    const handleEmployeeUpdate = (updatedEmployee) => {
        setEmployee(updatedEmployee);
    };

    const handleSelectEmployee = async (selectedEmp) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [employeeRes, jobDetailsRes] = await Promise.all([
                axios.get(`${API_URL}/employees/${selectedEmp.employeeCode}`, { headers }),
                axios.get(`${API_URL}/job-details/${selectedEmp.employeeCode}`, { headers }).catch(() => ({ data: null }))
            ]);

            const employeeData = employeeRes.data;
            const name = employeeData.firstName + " " + employeeData.lastName;
            const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
            
            setEmployee({ ...employeeData, jobDetails: jobDetailsRes.data, initials });
        } catch (err) {
            setError("Could not fetch employee details.");
            console.error("Error selecting employee:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = useMemo(() => {
        const lowercasedFilter = searchTerm.trim().toLowerCase();
        return allEmployees.filter(emp => {
            const locationMatch = selectedLocation === 'all' || emp.location?.id === parseInt(selectedLocation);
            const departmentMatch = selectedDepartment === 'all' || emp.jobDetails?.department === selectedDepartment;
            const genderMatch = selectedGender === 'all' || emp.gender === selectedGender;

            if (!lowercasedFilter) {
                return locationMatch && genderMatch && departmentMatch;
            }

            const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
            const code = (emp.employeeCode || '').toLowerCase();
            const empId = String(emp.id || '').toLowerCase();

            const searchMatch = 
                fullName.includes(lowercasedFilter) ||
                code.includes(lowercasedFilter) ||
                empId.includes(lowercasedFilter);

            return locationMatch && genderMatch && departmentMatch && searchMatch;
        });
    }, [allEmployees, selectedLocation, selectedGender, searchTerm, selectedDepartment]);

    const activeFilterCount = (selectedDepartment !== 'all' ? 1 : 0) + (selectedGender !== 'all' ? 1 : 0);

    const EmployeeCard = ({ emp, onSelect }) => {
        const [photoSrc, setPhotoSrc] = useState(null);
        const initials = (emp.firstName?.[0] || '') + (emp.lastName?.[0] || '');

        useEffect(() => {
            let objectURL;
            if (emp.photoPath) {
                const fetchCardPhoto = async () => {
                    try {
                        const token = localStorage.getItem('token');
                        const response = await axios.get(`${API_URL}/employees/${emp.employeeCode}/photo`, {
                            headers: { Authorization: `Bearer ${token}` },
                            responseType: 'blob'
                        });
                        objectURL = URL.createObjectURL(response.data);
                        setPhotoSrc(objectURL);
                    } catch (error) {
                        // Silently fail
                    }
                };
                fetchCardPhoto();
            }
            return () => { if (objectURL) URL.revokeObjectURL(objectURL); };
        }, [emp.employeeCode, emp.photoPath]);

        return (
            <div 
                className="bg-card text-card-foreground p-3 rounded-2xl shadow-xs border border-border hover:border-primary/60 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between" 
                onClick={() => onSelect(emp)}
            >
                <div className="flex items-start gap-3">
                    {/* Employee Photo */}
                    <div className="w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-background-muted relative shadow-xs">
                        {photoSrc ? (
                            <img src={photoSrc} alt={`${emp.firstName} ${emp.lastName}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <span className="text-xl font-extrabold text-primary opacity-70">{initials}</span>
                            </div>
                        )}
                    </div>

                    {/* Employee Info */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-xs md:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                {emp.firstName} {emp.lastName}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                                    emp.status === 'ACTIVE' 
                                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' 
                                        : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                }`}>
                                    {emp.status?.toLowerCase() || 'active'}
                                </span>
                                <button className="text-foreground-muted hover:text-foreground p-0.5 rounded-md">
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                            {emp.jobDetails?.designation || 'Software Engineer'}
                        </p>

                        <p className="text-xs font-medium text-foreground-muted truncate">
                            {emp.employeeCode || 'EMP-1001'}
                        </p>

                        <p className="text-xs text-foreground-muted/90 truncate pt-0.5">
                            {emp.emailWork || emp.email || 'arjun.mehta@example.com'}
                        </p>

                        <p className="text-xs text-foreground-muted/90 truncate">
                            {emp.phonePrimary || '+971 50 123 4567'}
                        </p>
                    </div>
                </div>

                {/* Bottom Location Row */}
                <div className="mt-2 pt-2 border-t border-border/40 flex items-center text-xs text-foreground-muted">
                    <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{emp.location?.name || 'Dubai, UAE'}</span>
                    </div>
                </div>
            </div>
        );
    };

    const EmployeeList = useCallback(({ employees, onSelect }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {employees.map(emp => <EmployeeCard key={emp.employeeCode} emp={emp} onSelect={onSelect} />)}
        </div>
    ), [API_URL]);

    const renderContent = () => {
        if (!employee) {
            return (
                <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1">
                        <h3 className="text-xs font-bold text-foreground">Employees ({filteredEmployees.length})</h3>

                        {/* Action Icon Buttons */}
                        <div className="flex items-center gap-1.5">
                            {/* Add Employee */}
                            <button
                                type="button"
                                onClick={() => navigate('/employees/add')}
                                className="px-2 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                                title="Add Employee"
                            >
                                <UserPlus className="h-3.5 w-3.5" />
                                <span className="text-[11px]">Add Employee</span>
                            </button>

                            {/* Bulk Template Download */}
                            <button
                                type="button"
                                onClick={handleTemplateDownload}
                                className="p-1.5 bg-background border border-border hover:border-primary/50 text-foreground-muted hover:text-primary rounded-lg transition-all flex items-center gap-1 text-xs font-semibold shadow-xs"
                                title="Download Bulk Template"
                            >
                                <FileDown className="h-3.5 w-3.5" />
                                <span className="hidden md:inline text-[11px]">Template</span>
                            </button>

                            {/* Bulk Upload */}
                            <button
                                type="button"
                                onClick={() => setIsBulkModalOpen(true)}
                                className="p-1.5 bg-background border border-border hover:border-primary/50 text-foreground-muted hover:text-primary rounded-lg transition-all flex items-center gap-1 text-xs font-semibold shadow-xs"
                                title="Bulk Upload Employees"
                            >
                                <UploadCloud className="h-3.5 w-3.5" />
                                <span className="hidden md:inline text-[11px]">Bulk Upload</span>
                            </button>

                            {/* Export */}
                            <button
                                type="button"
                                onClick={handleExport}
                                className="p-1.5 bg-background border border-border hover:border-primary/50 text-foreground-muted hover:text-primary rounded-lg transition-all flex items-center gap-1 text-xs font-semibold shadow-xs"
                                title="Export Employees CSV"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span className="hidden md:inline text-[11px]">Export</span>
                            </button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-48"><Loader className="animate-spin h-6 w-6 text-primary" /></div>
                    ) : filteredEmployees.length > 0 ? (
                        <EmployeeList employees={filteredEmployees} onSelect={handleSelectEmployee} />
                    ) : (
                        <div className="text-center py-10 text-foreground-muted bg-card rounded-xl border border-border">
                            <h3 className="text-sm font-semibold text-foreground">No Employees Found</h3>
                            <p className="text-xs mt-0.5">No employees match the current filters.</p>
                        </div>
                    )}
                </div>
            );
        }

        switch (activeTab) {
            case 'Profile':
                return <Profile employee={employee} onUpdate={handleEmployeeUpdate} />
            case 'Job Details':
                return <JobDetails employee={employee} />
            case 'Address & Bank Details' :
                return <Address employee={employee} />
            case 'Documents' :
                return <Documents employee = {employee} />
            case 'Time & Attendance':
                return <TimeAttendence employee={employee} />
            case 'Leave' :
                return <Leave employee={employee} />
            case 'Salary':
                return <Payroll employee={employee} />
            default:
                return <div>Details for {activeTab}</div>;
        }
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !employee) return;

        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/employees/${employee.employeeCode}/photo`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            setEmployee(response.data);
        } catch (err) {
            console.error("Error uploading photo:", err);
            alert("Failed to upload photo. Please ensure it's a valid image file.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Header Search Element injected into DashboardLayout header
    const headerSearchElement = (
        <div className="relative w-full max-w-md flex items-center gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search by name, ID or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground text-xs font-bold"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Filter Icon & Popover */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-xs font-semibold ${
                        activeFilterCount > 0 || isFilterOpen
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-background border-border text-foreground-muted hover:text-foreground'
                    }`}
                    title="Filter Employees"
                >
                    <Filter className="h-4 w-4" />
                    {activeFilterCount > 0 && (
                        <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Filter Popover */}
                {isFilterOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                        <div className="absolute left-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 text-foreground space-y-4 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                            <div className="flex items-center gap-1.5">
                                <Filter className="h-3.5 w-3.5 text-primary" />
                                <span className="font-bold text-xs">Filter Employees</span>
                            </div>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={() => {
                                        setSelectedDepartment('all');
                                        setSelectedGender('all');
                                    }}
                                    className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Reset
                                </button>
                            )}
                        </div>

                        {/* Department Custom Dropdown */}
                        <CustomSelect
                            label="Department"
                            icon={Briefcase}
                            value={selectedDepartment}
                            onChange={val => setSelectedDepartment(val)}
                            options={[
                                { value: 'all', label: 'All Departments' },
                                ...departments.map(dept => ({ value: dept.name, label: dept.name }))
                            ]}
                        />

                        {/* Gender Custom Dropdown */}
                        <CustomSelect
                            label="Gender"
                            icon={Users}
                            value={selectedGender}
                            onChange={val => setSelectedGender(val)}
                            options={[
                                { value: 'all', label: 'All Genders' },
                                { value: 'MALE', label: 'Male' },
                                { value: 'FEMALE', label: 'Female' },
                                { value: 'OTHER', label: 'Other' },
                            ]}
                        />

                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="w-full py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            Apply Filters
                        </button>
                    </div>
                </>
            )}
            </div>
        </div>
    );

    // Header Extra Element (Location Dropdown) injected into DashboardLayout top header
    const headerExtraElement = (
        <div className="flex items-center gap-2">
            <div className="w-40 hidden sm:block">
                <CustomSelect
                    icon={MapPin}
                    value={selectedLocation}
                    onChange={val => setSelectedLocation(val)}
                    options={[
                        { value: 'all', label: 'All Locations' },
                        ...locations.map(loc => ({ value: loc.id, label: loc.name }))
                    ]}
                />
            </div>
        </div>
    );

    return (
        <DashboardLayout headerSearch={headerSearchElement} headerExtra={headerExtraElement}>
            <div className="p-2 space-y-2 max-w-[1600px] mx-auto font-sans bg-transparent text-foreground w-full pb-12">
                
                {/* Compact Header Bar (Only shown when employee selected) */}
                {employee && (
                    <div className="bg-card rounded-xl p-2.5 border border-border shadow-sm flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <button onClick={() => setEmployee(null)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                                <ArrowLeft size={16} />
                            </button>
                            <div className="relative group shrink-0">
                                {photoUrl ? ( 
                                    <img src={photoUrl} alt="Employee" className="w-9 h-9 rounded-full object-cover ring-2 ring-primary shadow-xs" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold ring-2 ring-primary/20">
                                        {employee.initials}
                                    </div>
                                )}
                                <label htmlFor="photo-upload" className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    {uploadingPhoto ? (
                                        <Loader className="animate-spin h-3.5 w-3.5 text-white" />
                                    ) : (
                                        <Camera className="h-3.5 w-3.5 text-white" />
                                    )}
                                </label>
                                <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-sm font-bold text-foreground truncate">
                                        {`${employee.firstName} ${employee.lastName}`}
                                    </h1>
                                    <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-md capitalize ${
                                        employee.status === 'ACTIVE' ? 'bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-500/20 text-red-700 dark:text-red-300'
                                    }`}>{employee.status.toLowerCase()}</span>
                                </div>
                                <p className="text-[10px] text-foreground-muted truncate">
                                    {employee.jobDetails?.designation || 'No Designation'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sub Navigation Bar for Selected Employee */}
                {employee && (
                    <div className="bg-card rounded-xl border border-border p-1 shadow-sm overflow-x-auto no-scrollbar">
                        <nav className="flex items-center gap-1 min-w-max">
                            {employeeNavLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => setActiveTab(link.name)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        activeTab === link.name
                                            ? `bg-primary/10 text-primary border border-primary/20 shadow-xs`
                                            : `text-foreground-muted hover:text-foreground hover:bg-background-muted`
                                    }`}
                                > 
                                    <link.icon className={`h-3.5 w-3.5 ${activeTab === link.name ? 'text-primary' : 'text-foreground-muted'}`} />
                                    <span>{link.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="w-full">
                    {error ? (
                        <div className="text-center p-4 bg-card rounded-xl border border-red-500/20 text-red-600 text-xs">{error}</div>
                    ) : (
                        renderContent()
                    )}
                </div>

            </div>

            {/* Modals */}
            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onEmployeeAdded={fetchAllEmployeesAndLocations}
            />
            <BulkAddEmployeesModal
                isOpen={isBulkModalOpen}
                onClose={() => {
                    setIsBulkModalOpen(false);
                    fetchAllEmployeesAndLocations();
                }}
            />
        </DashboardLayout>
    );
};

export default Employee;
