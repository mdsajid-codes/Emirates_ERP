import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Save, X } from 'lucide-react';
import { useAtsGeo } from '../hooks/useAtsGeo';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FormField = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-semibold text-foreground-muted">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">{children}</div>
    </div>
);

const AtsApplicantForm = ({ item, onSave, onCancel, loading: isSubmitting, hideActions }) => {
    const {
        countries,
        states,
        setSelectedCountryName,
        loadingCountries,
        loadingStates
    } = useAtsGeo();

    const [formData, setFormData] = useState({
        salutation: '',
        firstName: '',
        middleName: '',
        lastName: '',
        nickName: '',
        email: '',
        alternateEmail: '',
        homePhone: '',
        mobileNumber: '',
        workPhone: '',
        otherPhone: '',
        skypeId: '',
        linkedinUrl: '',
        facebookUrl: '',
        twitterUrl: '',
        videoReference: '',
        workAuthorization: 'US_CITIZEN',
        workAuthExpiry: '',
        hasClearance: false,
        source: 'MANUAL',
        experienceYears: 0,
        experienceMonths: 0,
        referredBy: '',
        applicantStatus: 'NEW_LEAD',
        applicantGroup: '',
        jobTitle: '',
        expectedPayAmount: '',
        expectedPayCurrency: 'USD',
        expectedPayPeriod: 'YEARLY',
        additionalComments: '',
        willingToRelocate: false,
        primarySkills: '',
        technology: '',
        taxTerms: 'W2',
        noticePeriod: 'IMMEDIATE',
        gpa: '',
        aadharNumber: '',
        nationality: '',
        referenceId: '',
        photoUrl: '',
        isBlacklisted: false,
        gender: 'MALE',
        raceEthnicity: '',
        veteranStatus: 'NOT_VETERAN',
        disability: 'NO',
        ownerId: '',
        userId: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        }
    });

    const [selectData, setSelectData] = useState({
        employees: [],
        countries: [],
        states: []
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            
            const [employeesRes] = await Promise.all([
                axios.get(`${API_URL}/employees/all`, { headers }).catch(() => ({ data: [] }))
            ]);

            setSelectData({
                employees: employeesRes.data?.content || employeesRes.data || [],
                countries: [],
                states: []
            });
        } catch (error) {
            console.error("Failed to fetch lookups", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (item) {
            setFormData({
                salutation: item.salutation || '',
                firstName: item.firstName || '',
                middleName: item.middleName || '',
                lastName: item.lastName || '',
                nickName: item.nickName || '',
                email: item.email || '',
                alternateEmail: item.alternateEmail || '',
                homePhone: item.homePhone || '',
                mobileNumber: item.mobileNumber || '',
                workPhone: item.workPhone || '',
                otherPhone: item.otherPhone || '',
                skypeId: item.skypeId || '',
                linkedinUrl: item.linkedinUrl || '',
                facebookUrl: item.facebookUrl || '',
                twitterUrl: item.twitterUrl || '',
                videoReference: item.videoReference || '',
                workAuthorization: item.workAuthorization || 'US_CITIZEN',
                workAuthExpiry: item.workAuthExpiry || '',
                hasClearance: item.hasClearance || false,
                source: item.source || 'MANUAL',
                experienceYears: item.experienceYears || 0,
                experienceMonths: item.experienceMonths || 0,
                referredBy: item.referredBy || '',
                applicantStatus: item.applicantStatus || 'NEW_LEAD',
                applicantGroup: item.applicantGroup || '',
                jobTitle: item.jobTitle || '',
                expectedPayAmount: item.expectedPayAmount || '',
                expectedPayCurrency: item.expectedPayCurrency || 'USD',
                expectedPayPeriod: item.expectedPayPeriod || 'YEARLY',
                additionalComments: item.additionalComments || '',
                willingToRelocate: item.willingToRelocate || false,
                primarySkills: item.primarySkills || '',
                technology: item.technology || '',
                taxTerms: item.taxTerms || 'W2',
                noticePeriod: item.noticePeriod || 'IMMEDIATE',
                gpa: item.gpa || '',
                aadharNumber: item.aadharNumber || '',
                nationality: item.nationality || '',
                referenceId: item.referenceId || '',
                photoUrl: item.photoUrl || '',
                isBlacklisted: item.isBlacklisted || false,
                gender: item.gender || 'MALE',
                raceEthnicity: item.raceEthnicity || '',
                veteranStatus: item.veteranStatus || 'NO',
                disability: item.disability || 'NO',
                ownerId: item.ownerId || '',
                userId: item.userId || '',
                address: item.address || { street: '', city: '', state: '', zip: '', country: '' }
            });
            if (item.address?.country) {
                setSelectedCountryName(item.address.country);
            }
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith("address.")) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            experienceYears: parseInt(formData.experienceYears) || 0,
            experienceMonths: parseInt(formData.experienceMonths) || 0,
            expectedPayAmount: formData.expectedPayAmount ? parseFloat(formData.expectedPayAmount) : null,
            gpa: formData.gpa ? parseFloat(formData.gpa) : null,
            ownerId: formData.ownerId ? parseInt(formData.ownerId) : null,
            userId: formData.userId ? parseInt(formData.userId) : null
        };
        onSave(payload);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-card">
            {!hideActions && (
                <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-background/50 sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-bold text-foreground">{item ? 'Edit Applicant Profile' : 'Create Applicant Profile'}</h3>
                        <p className="text-xs text-foreground-muted">Enter details to update or add the applicant.</p>
                    </div>
                    <button type="button" onClick={onCancel} className="p-2 rounded-full text-foreground-muted hover:bg-background-muted transition-colors">
                        <X size={20} />
                    </button>
                </div>
            )}

            <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                {/* Personal Information */}
                <section className="space-y-4">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border pb-1">Personal Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Salutation">
                            <input name="salutation" value={formData.salutation} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" placeholder="e.g. Mr. / Ms." />
                        </FormField>
                        <FormField label="First Name" required>
                            <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                        <FormField label="Last Name" required>
                            <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                        <FormField label="Middle Name">
                            <input name="middleName" value={formData.middleName} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                        <FormField label="Email" required>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                        <FormField label="Mobile Number">
                            <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                        <FormField label="Gender">
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground">
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                            </select>
                        </FormField>
                        <FormField label="Nationality">
                            <input name="nationality" value={formData.nationality} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                        <FormField label="Aadhaar / Gov ID">
                            <input name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                    </div>
                </section>

                {/* Address */}
                <section className="space-y-4">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border pb-1">Address Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Street">
                            <input name="address.street" value={formData.address.street} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                        <FormField label="City">
                            <input name="address.city" value={formData.address.city} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                        <FormField label="Country">
                            <select
                                name="address.country"
                                value={formData.address.country}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        address: {
                                            ...prev.address,
                                            country: val,
                                            state: ''
                                        }
                                    }));
                                    setSelectedCountryName(val);
                                }}
                                className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground"
                            >
                                <option value="">Select Country</option>
                                {countries.map(c => (
                                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="State">
                            <select
                                name="address.state"
                                value={formData.address.state}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        address: {
                                            ...prev.address,
                                            state: val
                                        }
                                    }));
                                }}
                                className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground"
                            >
                                <option value="">Select State</option>
                                {states.map(s => (
                                    <option key={s.id || s.name} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Zip Code">
                            <input name="address.zip" value={formData.address.zip} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                    </div>
                </section>

                {/* Recruitment Information */}
                <section className="space-y-4">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border pb-1">Recruitment & Skills</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Job Title" required>
                            <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} required className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" placeholder="e.g. Senior Software Engineer" />
                        </FormField>
                        <FormField label="Status">
                            <select name="applicantStatus" value={formData.applicantStatus} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground">
                                <option value="NEW_LEAD">New Lead</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="PLACED">Placed</option>
                                <option value="BLACKLISTED">Blacklisted</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </FormField>
                        <FormField label="Notice Period">
                            <select name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground">
                                <option value="IMMEDIATE">Immediate</option>
                                <option value="FIFTEEN_DAYS">15 Days</option>
                                <option value="THIRTY_DAYS">30 Days</option>
                                <option value="FORTY_FIVE_DAYS">45 Days</option>
                                <option value="SIXTY_DAYS">60 Days</option>
                                <option value="NINETY_DAYS">90 Days</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </FormField>
                        <FormField label="Source">
                            <select name="source" value={formData.source} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground">
                                <option value="MANUAL">Manual</option>
                                <option value="RESUME_IMPORT">Resume Import</option>
                                <option value="REFERRAL">Referral</option>
                                <option value="JOB_BOARD">Job Board</option>
                                <option value="LINKEDIN">LinkedIn</option>
                                <option value="VENDOR">Vendor</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </FormField>
                        <FormField label="Experience (Years)">
                            <input name="experienceYears" type="number" min="0" value={formData.experienceYears} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                        <FormField label="Experience (Months)">
                            <input name="experienceMonths" type="number" min="0" max="11" value={formData.experienceMonths} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                        <FormField label="Recruiter / Owner">
                            <select name="ownerId" value={formData.ownerId} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground">
                                <option value="">Select Recruiter</option>
                                {selectData.employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Expected Pay">
                            <div className="flex gap-2">
                                <input name="expectedPayAmount" type="number" value={formData.expectedPayAmount} onChange={handleChange} className="flex-1 px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" placeholder="Amount" />
                                <select name="expectedPayCurrency" value={formData.expectedPayCurrency} onChange={handleChange} className="w-20 px-2 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground">
                                    <option value="USD">USD</option>
                                    <option value="AED">AED</option>
                                    <option value="EUR">EUR</option>
                                    <option value="INR">INR</option>
                                </select>
                            </div>
                        </FormField>
                        <FormField label="Expected Pay Period">
                            <select name="expectedPayPeriod" value={formData.expectedPayPeriod} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground">
                                <option value="HOURLY">Hourly</option>
                                <option value="DAILY">Daily</option>
                                <option value="WEEKLY">Weekly</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                            </select>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Primary Skills">
                            <input name="primarySkills" value={formData.primarySkills} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" placeholder="e.g. Java, React, SQL" />
                        </FormField>
                        <FormField label="Technology">
                            <input name="technology" value={formData.technology} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" placeholder="e.g. Spring Boot, AWS, Docker" />
                        </FormField>
                    </div>
                </section>

                {/* Authorization & EEO */}
                <section className="space-y-4">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border pb-1">Work Auth & EEO compliance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Work Authorization">
                            <select name="workAuthorization" value={formData.workAuthorization} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground">
                                <option value="US_CITIZEN">US Citizen</option>
                                <option value="GREEN_CARD">Green Card</option>
                                <option value="H1B">H1B</option>
                                <option value="H4_EAD">H4 EAD</option>
                                <option value="OPT">OPT</option>
                                <option value="CPT">CPT</option>
                                <option value="TN">TN</option>
                                <option value="L1">L1</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </FormField>
                        <FormField label="Work Auth Expiry">
                            <input name="workAuthExpiry" type="date" value={formData.workAuthExpiry} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" />
                        </FormField>
                        <FormField label="Veteran Status">
                            <select name="veteranStatus" value={formData.veteranStatus} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground">
                                <option value="NOT_VETERAN">Not a Veteran</option>
                                <option value="VETERAN">Veteran</option>
                                <option value="ACTIVE_MILITARY">Active Military</option>
                                <option value="RECENTLY_SEPARATED">Recently Separated</option>
                                <option value="DISABLED_VETERAN">Disabled Veteran</option>
                                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                            </select>
                        </FormField>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 mt-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-foreground-muted cursor-pointer select-none">
                            <input name="hasClearance" type="checkbox" checked={formData.hasClearance} onChange={handleChange} className="w-4 h-4 text-primary focus:ring-primary/20 rounded border-border" />
                            <span>Security Clearance?</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-foreground-muted cursor-pointer select-none">
                            <input name="willingToRelocate" type="checkbox" checked={formData.willingToRelocate} onChange={handleChange} className="w-4 h-4 text-primary focus:ring-primary/20 rounded border-border" />
                            <span>Willing to Relocate?</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-foreground-muted cursor-pointer select-none">
                            <input name="isBlacklisted" type="checkbox" checked={formData.isBlacklisted} onChange={handleChange} className="w-4 h-4 text-primary focus:ring-primary/20 rounded border-border" />
                            <span>Blacklist Applicant?</span>
                        </label>
                    </div>
                </section>

                {/* Additional Comments */}
                <section className="space-y-4">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border pb-1">Additional Information</h4>
                    <FormField label="Comments / Notes">
                        <textarea name="additionalComments" value={formData.additionalComments} onChange={handleChange} rows="3" className="w-full px-3 py-2 bg-background border border-border rounded-theme focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground" placeholder="Any extra remarks about candidate profile..." />
                    </FormField>
                </section>
            </div>

            {!hideActions && (
                <div className="px-6 py-4 border-t border-border bg-background flex justify-end gap-3 sticky bottom-0 z-10 shadow-lg">
                    <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-semibold border border-border rounded-theme hover:bg-background-muted transition-all" disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-theme hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />}
                        Save Applicant
                    </button>
                </div>
            )}
            {hideActions && (
                <button id="personal-details-submit-btn" type="submit" className="hidden" />
            )}
        </form>
    );
};

export default AtsApplicantForm;
