import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, Loader, ChevronDown } from 'lucide-react';
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
const EditField = ({ label, name, value, onChange, type = 'text', options = [] }) => {
    const commonProps = {
        id: name,
        name: name,
        value: value ?? '',
        onChange: onChange,
        className: "w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-all"
    };

    return (
        <div className="space-y-1">
            <label htmlFor={name} className="block text-[11px] font-bold text-foreground-muted uppercase tracking-wider">{label}</label>
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
                <input {...commonProps} type={type} />
            )}
        </div>
    );
};

const TimeAttendence = ({ employee }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [timeAttendence, setTimeAttendence] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectOptions, setSelectOptions] = useState({
        timeTypes: [], workTypes: [], shiftTypes: [], weeklyOffPolicies: [], leaveGroups: [], attendanceTrackingPolicies: [],
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const initialFormState = {
        timeTypeId: null, workTypeId: null, shiftTypeId: null, weeklyOffPolicyId: null, leaveGroupId: null,
        attendenceCaptureScheme: '', holidayList: '', expensePolicy: '',
        attendancePolicyId: null, recruitmentPolicy: '', isRosterBasedEmployee: false
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!employee?.employeeCode) return;
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { "Authorization": `Bearer ${token}` };

                const [detailsRes, timeTypeRes, workTypeRes, shiftTypeRes, weekOffRes, leaveGroupRes, attendanceTrackingRes] = await Promise.all([
                    axios.get(`${API_URL}/time-attendence/${employee.employeeCode}`, { headers }).catch(err => {
                        if (err.response && err.response.status === 404) return { data: null };
                        throw err;
                    }),
                    axios.get(`${API_URL}/time-types`, { headers }),
                    axios.get(`${API_URL}/work-types`, { headers }),
                    axios.get(`${API_URL}/shift-types`, { headers }),
                    axios.get(`${API_URL}/weekly-off-policies`, { headers }),
                    axios.get(`${API_URL}/leave-groups`, { headers }),
                    axios.get(`${API_URL}/attendance-policies`, { headers }),
                ]);

                const detailsData = detailsRes.data;
                setTimeAttendence(detailsData);
                // Map backend entity to frontend form state with IDs
                if (detailsData) {
                    setFormData({
                        ...initialFormState, // Start with a clean slate
                        ...detailsData, // Spread existing data
                        timeTypeId: detailsData.timeType?.id || null,
                        workTypeId: detailsData.workType?.id || null,
                        weeklyOffPolicyId: detailsData.weeklyOffPolicy?.id || null,
                        leaveGroupId: detailsData.leaveGroup?.id || null,
                        attendancePolicyId: detailsData.attendancePolicy?.id || null,
                    });
                } else {
                    setFormData(initialFormState);
                }

                setSelectOptions({
                    timeTypes: timeTypeRes.data,
                    workTypes: workTypeRes.data,
                    shiftTypes: shiftTypeRes.data,
                    weeklyOffPolicies: weekOffRes.data,
                    leaveGroups: leaveGroupRes.data,
                    attendanceTrackingPolicies: attendanceTrackingRes.data,
                });

            } catch (err) {
                console.error("Error fetching time & attendance data:", err);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [employee, API_URL]);

    if (!employee) {
        return <div className="text-center text-slate-500">No employee selected.</div>;
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (timeAttendence) {
            setFormData({
                ...initialFormState,
                ...timeAttendence,
                timeTypeId: timeAttendence.timeType?.id || null,
                workTypeId: timeAttendence.workType?.id || null,
                weeklyOffPolicyId: timeAttendence.weeklyOffPolicy?.id || null,
                leaveGroupId: timeAttendence.leaveGroup?.id || null,
                attendancePolicyId: timeAttendence.attendancePolicy?.id || null,
            });
        } else {
            setFormData(initialFormState);
        }
        setError('');
    };

    const handleSave = async () => {
        setSaveLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/time-attendence/${employee.employeeCode}`, formData, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const updatedDetails = response.data;
            setTimeAttendence(updatedDetails);
            setFormData({
                ...initialFormState,
                ...updatedDetails,
                shiftTypeId: updatedDetails.shiftType?.id || null, // Assuming shiftType might be part of the response
                timeTypeId: updatedDetails.timeType?.id || null,
                workTypeId: updatedDetails.workType?.id || null,
                weeklyOffPolicyId: updatedDetails.weeklyOffPolicy?.id || null,
                leaveGroupId: updatedDetails.leaveGroup?.id || null,
                attendancePolicyId: updatedDetails.attendancePolicy?.id || null,
            });
            setIsEditing(false);
            alert('Time & Attendance details updated successfully!');
        } catch (err) {
            console.error("Error updating details:", err);
            const errorMessage = err.response?.data?.message || 'Failed to update details. Please try again.';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    const currentData = isEditing ? formData : timeAttendence || {};

    // Helper to find the name from the ID for display purposes
    const findName = (id, list, key = 'id', nameKey = 'name') => list.find(item => item[key] === id)?.[nameKey] || 'N/A';

    const fields = [
        { name: 'timeTypeId', label: 'Time Type', type: 'select', options: selectOptions.timeTypes.map(o => ({ value: o.id, label: o.name })), viewValue: findName(currentData.timeType?.id, selectOptions.timeTypes) },
        { name: 'workTypeId', label: 'Work Type', type: 'select', options: selectOptions.workTypes.map(o => ({ value: o.id, label: o.name })), viewValue: findName(currentData.workType?.id, selectOptions.workTypes) },
        // { name: 'shiftTypeId', label: 'Shift Type', type: 'select', options: selectOptions.shiftTypes.map(o => ({ value: o.id, label: `${o.name} (${o.startTime} - ${o.endTime})` })), viewValue: findName(currentData.shiftType?.id, selectOptions.shiftTypes) },
        { name: 'weeklyOffPolicyId', label: 'Weekly Off Policy', type: 'select', options: selectOptions.weeklyOffPolicies.map(o => ({ value: o.id, label: o.name })), viewValue: findName(currentData.weeklyOffPolicy?.id, selectOptions.weeklyOffPolicies) },
        { name: 'leaveGroupId', label: 'Leave Group', type: 'select', options: selectOptions.leaveGroups.map(o => ({ value: o.id, label: o.name })), viewValue: findName(currentData.leaveGroup?.id, selectOptions.leaveGroups) },
        { name: 'attendancePolicyId', label: 'Attendance Tracking Policy', type: 'select', options: selectOptions.attendanceTrackingPolicies.map(p => ({ value: p.id, label: p.policyName })), viewValue: findName(currentData.attendancePolicy?.id, selectOptions.attendanceTrackingPolicies, 'id', 'policyName') },
        // { name: 'attendenceCaptureScheme', label: 'Attendance Capture Scheme' },
        // { name: 'holidayList', label: 'Holiday List' },
        // { name: 'expensePolicy', label: 'Expense Policy' },
        // { name: 'recruitmentPolicy', label: 'Recruitment Policy' },
    ];

    return (
        <div className="space-y-2.5">
            <div className="flex justify-end gap-2">
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className="px-3 py-1.5 rounded-lg border border-border hover:bg-background-muted text-xs font-semibold transition-colors" disabled={saveLoading}>Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs" disabled={saveLoading}>
                            {saveLoading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                            Save Policy
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Policy
                    </button>
                )}
            </div>
            {error && <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}
            
            <div className="bg-card border border-border rounded-2xl p-3 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                    <h3 className="text-xs font-bold text-foreground tracking-tight">Time & Attendance Policy Assignments</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {fields.map(field => (
                        isEditing ? (
                            <EditField key={field.name} label={field.label} name={field.name} value={formData[field.name]} onChange={handleChange} type={field.type} options={field.options} />
                        ) : (
                            <InfoField key={field.name} label={field.label} value={field.viewValue} />
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TimeAttendence;
