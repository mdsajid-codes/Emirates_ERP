import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, FileText, CheckCircle, ChevronRight, ChevronLeft, Loader } from 'lucide-react';
import InputField from './InputField';
import SecureImage from './SecureImage';

const initialBasicState = {
    companyName: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    emirate: '',
    poBox: '',
    country: '',
    tradeLicenseNumber: '',
    tradeLicenseExpiry: '',
    trn: '',
    mohreEstablishmentId: '',
    visaQuotaTotal: '',
    employerBankRoutingCode: ''
};

const MyCompanyInfoForm = ({ initialData, onSave, isLoading }) => {
    const [step, setStep] = useState(1);
    const [basicDetails, setBasicDetails] = useState(initialBasicState);
    const [bankDetails, setBankDetails] = useState([]);
    const [customFields, setCustomFields] = useState([]);
    const [files, setFiles] = useState({
        logoImage: null,
        signatureImage: null,
        stampImage: null,
        invoiceHeaderImage: null,
        invoiceFooterImage: null,
        watermarkImage: null
    });
    // To show previews or existing URLs
    const [fileUrls, setFileUrls] = useState({});

    useEffect(() => {
        if (initialData) {
            setBasicDetails({
                companyName: initialData.companyName || '',
                phone: initialData.phone || '',
                email: initialData.email || '',
                website: initialData.website || '',
                address: initialData.address || '',
                city: initialData.city || '',
                emirate: initialData.emirate || '',
                poBox: initialData.poBox || '',
                country: initialData.country || '',
                tradeLicenseNumber: initialData.tradeLicenseNumber || '',
                tradeLicenseExpiry: initialData.tradeLicenseExpiry || '',
                trn: initialData.trn || '',
                mohreEstablishmentId: initialData.mohreEstablishmentId || '',
                visaQuotaTotal: initialData.visaQuotaTotal || '',
                employerBankRoutingCode: initialData.employerBankRoutingCode || ''
            });
            setBankDetails(initialData.bankDetails || []);
            setCustomFields(initialData.customFields || []);
            setFileUrls({
                logoImage: initialData.logoUrl,
                signatureImage: initialData.signatureUrl,
                stampImage: initialData.stampUrl,
                invoiceHeaderImage: initialData.invoiceHeaderUrl,
                invoiceFooterImage: initialData.invoiceFooterUrl,
                watermarkImage: initialData.watermarkUrl
            });
        }
    }, [initialData]);

    const handleBasicChange = (e) => {
        const { name, value } = e.target;
        setBasicDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleBankChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const updatedBanks = [...bankDetails];
        updatedBanks[index] = { ...updatedBanks[index], [name]: type === 'checkbox' ? checked : value };
        setBankDetails(updatedBanks);
    };

    const addBank = () => {
        setBankDetails([...bankDetails, { bankName: '', accountNumber: '', ifscCode: '', accountHolderName: '', branchName: '', swiftCode: '', iban: '', isPrimary: false }]);
    };

    const removeBank = (index) => {
        setBankDetails(bankDetails.filter((_, i) => i !== index));
    };

    const handleCustomFieldChange = (index, e) => {
        const { name, value } = e.target;
        const updatedFields = [...customFields];
        updatedFields[index] = { ...updatedFields[index], [name]: value };
        setCustomFields(updatedFields);
    };

    const addCustomField = () => {
        setCustomFields([...customFields, { fieldName: '', fieldValue: '', fieldType: 'text', documentName: '' }]);
    };

    const removeCustomField = (index) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };

    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [key]: file }));
            // Create preview URL
            setFileUrls(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        // Append basic details
        Object.keys(basicDetails).forEach(key => {
            formData.append(key, basicDetails[key]);
        });

        // Append files
        Object.keys(files).forEach(key => {
            if (files[key]) {
                formData.append(key, files[key]);
            }
        });

        // Append Bank Details - Spring Boot expects complex objects as indexed parameters in FormData or simply handled if we stringify.
        // But for @ModelAttribute List<MyBankDetailsRequest>, standard indexed notation like bankDetails[0].bankName works.
        bankDetails.forEach((bank, index) => {
            Object.keys(bank).forEach(key => {
                if (key !== 'id') { // Don't send ID for new ones, though backend handles clear/add
                    formData.append(`bankDetails[${index}].${key}`, bank[key]);
                }
            });
        });

        // Append Custom Fields
        customFields.forEach((field, index) => {
            Object.keys(field).forEach(key => {
                if (key !== 'id') {
                    formData.append(`customFields[${index}].${key}`, field[key]);
                }
            });
        });

        onSave(formData);
    };

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!basicDetails.companyName?.trim()) return "Company Name is required.";
            // Add other mandatory fields here if needed
        }
        if (currentStep === 2) {
            for (let i = 0; i < bankDetails.length; i++) {
                const bank = bankDetails[i];
                if (!bank.bankName?.trim()) return `Bank Name is required for Account #${i + 1}`;
                if (!bank.accountNumber?.trim()) return `Account Number is required for Account #${i + 1}`;
                if (!bank.ifscCode?.trim()) return `IFSC Code is required for Account #${i + 1}`;
            }
        }
        return null;
    };

    const handleNext = (e) => {
        e.preventDefault(); // crucial to prevent form submission
        const errorMsg = validateStep(step);
        if (errorMsg) {
            alert(errorMsg);
            return;
        }
        setStep(prev => prev + 1);
    };

    const steps = [
        { id: 1, title: 'Basic Details' },
        { id: 2, title: 'Bank Details' },
        { id: 3, title: 'Documents & Extras' }
    ];

    return (
        <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
            {/* Stepper Header */}
            <div className="border-b border-border bg-background-muted/50 p-4">
                <div className="flex items-center justify-center space-x-4">
                    {steps.map((s, idx) => (
                        <div key={s.id} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= s.id ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground-muted text-foreground-muted bg-background'} font-semibold text-sm transition-colors`}>
                                {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${step >= s.id ? 'text-primary' : 'text-foreground-muted'}`}>{s.title}</span>
                            {idx < steps.length - 1 && <div className="w-8 h-0.5 bg-border mx-4" />}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                {/* Step 1: Basic Details */}
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Company Name" name="companyName" value={basicDetails.companyName} onChange={handleBasicChange} required />
                            <InputField label="Phone" name="phone" value={basicDetails.phone} onChange={handleBasicChange} />
                            <InputField label="Email" name="email" type="email" value={basicDetails.email} onChange={handleBasicChange} />
                            <InputField label="Website" name="website" value={basicDetails.website} onChange={handleBasicChange} />
                        </div>
                        <h4 className="font-semibold text-lg text-foreground border-b border-border pb-2 mt-4">Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Street Address" name="address" value={basicDetails.address} onChange={handleBasicChange} />
                            <InputField label="City" name="city" value={basicDetails.city} onChange={handleBasicChange} />
                            <InputField label="Emirate" name="emirate" value={basicDetails.emirate} onChange={handleBasicChange} />
                            <InputField label="PO Box" name="poBox" value={basicDetails.poBox} onChange={handleBasicChange} />
                            <InputField label="Country" name="country" value={basicDetails.country} onChange={handleBasicChange} />
                        </div>
                        <h4 className="font-semibold text-lg text-foreground border-b border-border pb-2 mt-4">Statutory (UAE)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Trade License No." name="tradeLicenseNumber" value={basicDetails.tradeLicenseNumber} onChange={handleBasicChange} />
                            <InputField label="License Expiry" name="tradeLicenseExpiry" type="date" value={basicDetails.tradeLicenseExpiry} onChange={handleBasicChange} />
                            <InputField label="TRN" name="trn" value={basicDetails.trn} onChange={handleBasicChange} />
                            <InputField label="MOHRE Est. ID" name="mohreEstablishmentId" value={basicDetails.mohreEstablishmentId} onChange={handleBasicChange} />
                            <InputField label="Visa Quota Total" name="visaQuotaTotal" type="number" value={basicDetails.visaQuotaTotal} onChange={handleBasicChange} />
                            <InputField label="Employer Bank Routing Code" name="employerBankRoutingCode" value={basicDetails.employerBankRoutingCode} onChange={handleBasicChange} />
                        </div>
                    </div>
                )}

                {/* Step 2: Bank Details */}
                {step === 2 && (
                    <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
                        {bankDetails.map((bank, index) => (
                            <div key={index} className="bg-background-muted p-4 rounded-lg border border-border relative">
                                <button type="button" onClick={() => removeBank(index)} className="absolute top-2 right-2 text-foreground-muted hover:text-red-500"><Trash2 size={18} /></button>
                                <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                                    <FileText size={18} /> Account #{index + 1}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <InputField label="Bank Name" name="bankName" value={bank.bankName} onChange={(e) => handleBankChange(index, e)} required />
                                    <InputField label="Account Number" name="accountNumber" value={bank.accountNumber} onChange={(e) => handleBankChange(index, e)} required />
                                    <InputField label="IFSC Code" name="ifscCode" value={bank.ifscCode} onChange={(e) => handleBankChange(index, e)} required />
                                    <InputField label="Holder Name" name="accountHolderName" value={bank.accountHolderName} onChange={(e) => handleBankChange(index, e)} />
                                    <InputField label="Branch" name="branchName" value={bank.branchName} onChange={(e) => handleBankChange(index, e)} />
                                    <InputField label="Swift Code" name="swiftCode" value={bank.swiftCode} onChange={(e) => handleBankChange(index, e)} />
                                    <InputField label="IBAN" name="iban" value={bank.iban} onChange={(e) => handleBankChange(index, e)} />
                                    <div className="flex items-center md:h-full pt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name="isPrimary" checked={bank.isPrimary} onChange={(e) => handleBankChange(index, e)} className="h-5 w-5 rounded border-border text-primary focus:ring-primary" />
                                            <span className="text-sm font-medium text-foreground">Primary Account</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addBank} className="w-full py-3 border-2 border-dashed border-border rounded-lg text-foreground-muted hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2">
                            <Plus /> Add Bank Account
                        </button>
                    </div>
                )}

                {/* Step 3: Documents & Custom Fields */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                        <h4 className="font-semibold text-lg text-foreground border-b border-border pb-2">Branding Assets</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { key: 'logoImage', label: 'Company Logo' },
                                { key: 'signatureImage', label: 'Auth. Signature' },
                                { key: 'stampImage', label: 'Company Stamp' },
                                { key: 'invoiceHeaderImage', label: 'Invoice Header' },
                                { key: 'invoiceFooterImage', label: 'Invoice Footer' },
                                { key: 'watermarkImage', label: 'Watermark' },
                            ].map(({ key, label }) => (
                                <div key={key} className="bg-background-muted p-4 rounded-lg text-center">
                                    <label className="block text-sm font-medium mb-2 text-foreground">{label}</label>
                                    <div className="relative group cursor-pointer border-2 border-dashed border-border hover:border-primary rounded-lg p-4 h-32 flex flex-col items-center justify-center overflow-hidden bg-card">
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" onChange={(e) => handleFileChange(e, key)} />
                                        {fileUrls[key] ? (
                                            <SecureImage src={fileUrls[key]} alt={label} className="h-full w-full object-contain" />
                                        ) : (
                                            <>
                                                <Upload className="h-6 w-6 text-foreground-muted mb-1" />
                                                <span className="text-xs text-foreground-muted">Click to upload</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h4 className="font-semibold text-lg text-foreground border-b border-border pb-2 mt-8">Custom Fields</h4>
                        <div className="space-y-3">
                            {customFields.map((field, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-3 items-end md:items-center bg-background-muted p-3 rounded-lg">
                                    <div className="flex-1 w-full"><InputField placeholder="Field Name" name="fieldName" value={field.fieldName} onChange={(e) => handleCustomFieldChange(index, e)} /></div>
                                    <div className="flex-1 w-full"><InputField placeholder="Value" name="fieldValue" value={field.fieldValue} onChange={(e) => handleCustomFieldChange(index, e)} /></div>
                                    <div className="w-full md:w-32"><InputField placeholder="Type" name="fieldType" value={field.fieldType} onChange={(e) => handleCustomFieldChange(index, e)} /></div>
                                    <button type="button" onClick={() => removeCustomField(index)} className="p-2 text-red-500 hover:bg-background rounded transition-colors self-end md:self-center bg-card shadow-sm"><Trash2 size={16} /></button>
                                </div>
                            ))}
                            <button type="button" onClick={addCustomField} className="btn-secondary btn-sm flex items-center gap-1">
                                <Plus size={16} /> Add Custom Field
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex justify-between items-center mt-8 pt-4 border-t border-border">
                    {step > 1 ? (
                        <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary flex items-center gap-2"><ChevronLeft size={18} /> Previous</button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button type="button" onClick={handleNext} className="btn-primary flex items-center gap-2">Next <ChevronRight size={18} /></button>
                    ) : (
                        <button type="submit" className="btn-primary flex items-center gap-2" disabled={isLoading}>
                            {isLoading ? <Loader className="animate-spin h-4 w-4" /> : <Save size={18} />} Save All Changes
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default MyCompanyInfoForm;
