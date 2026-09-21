import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Loader2, Search, X, Building, User, Mail, Phone, ChevronLeft, ChevronRight, HelpCircle, Download, LayoutGrid, List, Eye, MapPin, Hash, Briefcase, Banknote, Users as UsersIcon, FileText, ChevronDown, Landmark, CreditCard, Truck, CircleDollarSign, Code, Percent, Share2, Globe, CalendarDays, BookUser, Info, MessageSquare, Link as LinkIcon, TrendingUp, UserCheck, ShieldCheck, Upload, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import CompanyHubLayout from '../CompanyHubLayout';

const INITIAL_PARTY_STATE = {
    companyName: '',
    primaryContactPerson: '',
    contactEmail: '',
    contactPhone: '',
    partyType: 'CUSTOMER',
};

const getPartyTypeBadge = (type) => {
    switch (type) {
        case 'CUSTOMER':
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Customer</span>;
        case 'SUPPLIER':
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">Supplier</span>;
        case 'VENDOR':
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Vendor</span>;
        case 'CRM_LEAD':
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">CRM Lead</span>;
        default:
            return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{type || 'Customer'}</span>;
    }
};

const PartyCard = ({ party, onEdit, onDelete, onView }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5">
        <div>
            <div className="flex justify-between items-start mb-3 gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center truncate">
                    <Building className="w-5 h-5 mr-2 text-[#00A9A8] shrink-0" />
                    <span className="truncate">{party.companyName}</span>
                </h3>
                {getPartyTypeBadge(party.partyType)}
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mt-2">
                <p className="flex items-center"><User className="w-4 h-4 mr-2 text-gray-400 shrink-0" /> <span className="truncate">{party.primaryContactPerson || 'N/A'}</span></p>
                <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400 shrink-0" /> <span className="truncate">{party.contactEmail || 'N/A'}</span></p>
                <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400 shrink-0" /> <span className="truncate">{party.contactPhone || 'N/A'}</span></p>
            </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
            <span className={`px-2 py-0.5 text-[11px] font-medium rounded-md ${party.active ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {party.active ? 'Active' : 'Inactive'}
            </span>
            <div className="flex items-center gap-1">
                <button onClick={() => onView(party)} title="View Party Details" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400">
                    <Eye className="h-4 w-4" />
                </button>
                <button onClick={() => onEdit(party.id)} title="Edit Party" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400">
                    <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(party.id)} title="Delete Party" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-gray-700">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    </div>
);

const ToggleSection = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-t border-gray-200 dark:border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <div className="flex items-center">
                    {icon}
                    <span className="font-semibold ml-3">{title}</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 bg-gray-50 dark:bg-gray-900">{children}</div>}
        </div>
    );
};

const PartyViewModal = ({ party, onClose, onEdit, onDelete, isLoadingDetails }) => {
    if (!party) return null;

    const DetailItem = ({ icon, label, value }) => (
        <div className="flex items-start text-sm mb-3">
            <div className="text-gray-400 mr-3 mt-0.5">{icon}</div>
            <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{value || 'N/A'}</p>
            </div>
        </div>
    );

    const formatFullName = (p) => {
        const parts = [p.primaryContactTitle, p.primaryFirstName, p.primaryLastName].filter(Boolean);
        if (parts.length > 0) {
            return parts.join(' ');
        }
        return p.primaryContactPerson || 'N/A';
    };

    const formatAddress = (address) => {
        if (!address) return 'N/A';
        if (typeof address !== 'object') return address;

        const parts = [
            address.addressLine,
            address.addressLine1,
            address.city,
            address.state,
            address.zipCode,
            address.country
        ].filter(Boolean);

        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-xs" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-[#00A9A8]">
                            <Building className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{party.companyName}</h2>
                                {getPartyTypeBadge(party.partyType)}
                            </div>
                            <p className="text-xs text-gray-500">Code: {party.customerCode || party.vendorCustomerCode || party.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onEdit(party)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300">
                            <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button onClick={() => onDelete(party.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-gray-700">
                            <Trash2 className="h-4.5 w-4.5" />
                        </button>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                <main className="overflow-y-auto">
                    {isLoadingDetails ? <div className="flex justify-center items-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#00A9A8]" /></div> : <>
                        <ToggleSection title="Primary Information" icon={<Info className="w-5 h-5 text-[#00A9A8]" />} defaultOpen={true}>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                                <DetailItem icon={<UserCheck className="w-4 h-4" />} label="Primary Contact" value={formatFullName(party)} />
                                <DetailItem icon={<Mail className="w-4 h-4" />} label="Email" value={party.contactEmail} />
                                <DetailItem icon={<Phone className="w-4 h-4" />} label="Contact Phone" value={party.contactPhone} />
                                <DetailItem icon={<Phone className="w-4 h-4" />} label="Mobile" value={party.mobile} />
                                <DetailItem icon={<Briefcase className="w-4 h-4" />} label="Designation" value={party.designation} />
                                <DetailItem icon={<UsersIcon className="w-4 h-4" />} label="Department" value={party.department} />
                                <DetailItem icon={<Hash className="w-4 h-4" />} label="Customer Code" value={party.customerCode} />
                                <DetailItem icon={<Hash className="w-4 h-4" />} label="Vendor/Customer Code" value={party.vendorCustomerCode} />
                                <DetailItem icon={<Globe className="w-4 h-4" />} label="Website" value={party.website} />
                                <DetailItem icon={<User className="w-4 h-4" />} label="Owner/CEO Name" value={party.ownerCeoName} />
                                <DetailItem icon={<Phone className="w-4 h-4" />} label="Owner/CEO Contact" value={party.ownerCeoContact} />
                                <DetailItem icon={<Mail className="w-4 h-4" />} label="Owner/CEO Email" value={party.ownerCeoEmail} />
                                <DetailItem icon={<MapPin className="w-4 h-4" />} label="City" value={party.city} />
                                <DetailItem icon={<MapPin className="w-4 h-4" />} label="Region" value={party.region} />
                                <DetailItem icon={<Briefcase className="w-4 h-4" />} label="Status" value={
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${party.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {party.active ? 'Active' : 'Inactive'}
                                    </span>
                                } />
                            </div>
                        </ToggleSection>

                        <ToggleSection title="Address Details" icon={<MapPin className="w-5 h-5 text-[#00A9A8]" />}>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 text-sm flex items-center"><MapPin className="w-4 h-4 mr-2 text-[#00A9A8]" /> Billing Address</h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{formatAddress(party.billingAddress)}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 text-sm flex items-center"><Truck className="w-4 h-4 mr-2 text-[#00A9A8]" /> Shipping Address</h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{party.shippingSameAsBilling ? 'Same as Billing Address' : formatAddress(party.shippingAddress)}</p>
                                </div>
                            </div>
                        </ToggleSection>

                        <ToggleSection title="Tax & Financials (AED)" icon={<Percent className="w-5 h-5 text-[#00A9A8]" />}>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                                <DetailItem icon={<CreditCard className="w-4 h-4" />} label="PAN / Trade License" value={party.panNumber} />
                                <DetailItem icon={<ShieldCheck className="w-4 h-4" />} label="VAT Treatment" value={party.vatTreatment} />
                                <DetailItem icon={<Hash className="w-4 h-4" />} label="VAT TRN Number" value={party.vatTrnNumber || party.vatNumber} />
                                <DetailItem icon={<CircleDollarSign className="w-4 h-4" />} label="Opening Balance" value={`${party.openingBalanceType || ''} AED ${party.openingBalance || 0}`} />
                                <DetailItem icon={<CircleDollarSign className="w-4 h-4" />} label="Credit Limit" value={party.creditLimitAllowed ? `AED ${party.creditLimitAllowed}` : 'N/A'} />
                                <DetailItem icon={<CalendarDays className="w-4 h-4" />} label="Credit Period" value={party.creditPeriodAllowed ? `${party.creditPeriodAllowed} days` : 'N/A'} />
                                <DetailItem icon={<TrendingUp className="w-4 h-4" />} label="Sales (Prev. Year)" value={party.salesValuePreviousYear ? `AED ${party.salesValuePreviousYear}` : 'N/A'} />
                                <DetailItem icon={<CircleDollarSign className="w-4 h-4" />} label="Currency" value={party.currency || 'AED'} />
                            </div>
                        </ToggleSection>

                        <ToggleSection title="Bank Details" icon={<Banknote className="w-5 h-5 text-[#00A9A8]" />}>
                            {party.bankDetails && party.bankDetails.length > 0 ? (
                                <div className="space-y-3 p-4">
                                    {party.bankDetails.map((bank, index) => (
                                        <div key={index} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <DetailItem icon={<Landmark className="w-4 h-4" />} label="Bank Name" value={bank.bankName} />
                                            <DetailItem icon={<Hash className="w-4 h-4" />} label="Account Number" value={bank.accountNumber} />
                                            <DetailItem icon={<Code className="w-4 h-4" />} label="IFSC / BIC" value={bank.ifsCode} />
                                            <DetailItem icon={<Code className="w-4 h-4" />} label="IBAN Code" value={bank.ibanCode} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 p-4">No bank details recorded for this party.</p>
                            )}
                        </ToggleSection>
                    </>}
                </main>
            </div>
        </div>
    );
};

const PartyType = () => {
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [isImportGuideOpen, setIsImportGuideOpen] = useState(false);
    const [viewingParty, setViewingParty] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importErrors, setImportErrors] = useState([]);
    const [importSuccess, setImportSuccess] = useState('');
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [partyTypeFilter, setPartyTypeFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const partyTypes = ['ALL', 'CUSTOMER', 'SUPPLIER', 'VENDOR', 'CRM_LEAD'];

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const getAuthHeaders = () => {
        const tenantId = localStorage.getItem('tenantId') || 'default';
        return {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'X-Tenant-ID': tenantId
            }
        };
    };

    const fetchParties = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: currentPage,
                size: pageSize,
            });
            if (partyTypeFilter !== 'ALL') {
                params.append('type', partyTypeFilter);
            }

            const response = await axios.get(`${API_URL}/parties?${params.toString()}`, getAuthHeaders());
            setParties(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || (response.data.content ? response.data.content.length : 0));
            setError(null);
        } catch (err) {
            setError('Failed to fetch parties. Please check server connections.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParties();
    }, [currentPage, pageSize, partyTypeFilter]);

    const filteredParties = parties.filter(p => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (p.companyName && p.companyName.toLowerCase().includes(term)) ||
            (p.primaryContactPerson && p.primaryContactPerson.toLowerCase().includes(term)) ||
            (p.contactEmail && p.contactEmail.toLowerCase().includes(term)) ||
            (p.customerCode && p.customerCode.toLowerCase().includes(term))
        );
    });

    const handleView = async (party) => {
        try {
            setViewingParty(party);
            setIsLoadingDetails(true);
            const response = await axios.get(`${API_URL}/parties/${party.id}`, getAuthHeaders());
            setViewingParty(response.data);
        } catch (err) {
            setError('Failed to fetch party details.');
            console.error(err);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(`${API_URL}/parties/bulk-template`, {
                ...getAuthHeaders(),
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'party_bulk_import_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to download template.');
            console.error(err);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get(`${API_URL}/parties/export`, {
                ...getAuthHeaders(),
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'parties_export.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to export parties.');
            console.error(err);
        }
    };

    const handleImportFile = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsImporting(true);
        setImportErrors([]);
        setImportSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`${API_URL}/parties/bulk-import`, formData, getAuthHeaders());
            setImportSuccess('Parties imported successfully! List updated.');
            fetchParties();
        } catch (err) {
            setImportErrors(err.response?.data || ['An unknown error occurred during import.']);
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = null;
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this party?')) {
            try {
                await axios.delete(`${API_URL}/parties/${id}`, getAuthHeaders());
                setViewingParty(null);
                fetchParties();
            } catch (err) {
                setError('Failed to delete party. Please try again.');
                console.error(err);
            }
        }
    };

    return (
        <CompanyHubLayout>
            <div className="flex flex-col h-full bg-[#F7FAFF] dark:bg-gray-900">
                <header className="bg-white dark:bg-gray-800 shadow-2xs px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/company-settings')} title="Back to Settings" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Manage Parties</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Add, edit, or remove customer and vendor information.</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-grow p-6 flex flex-col w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden" accept=".xlsx, .xls, .csv" />
                            <button onClick={() => fileInputRef.current.click()} disabled={isImporting} className="flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-2xs transition-colors disabled:opacity-50">
                                {isImporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin text-[#00A9A8]" /> : <Upload className="mr-1.5 h-4 w-4 text-gray-500" />}
                                Import
                            </button>
                            <button onClick={handleDownloadTemplate} className="flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-2xs transition-colors">
                                <Download className="mr-1.5 h-4 w-4 text-gray-500" />
                                Template
                            </button>
                            <button onClick={handleExport} className="flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-2xs transition-colors">
                                <FileSpreadsheet className="mr-1.5 h-4 w-4 text-gray-500" />
                                Export
                            </button>
                            <div className="h-6 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>
                            <div className="flex items-center p-0.5 bg-gray-200 dark:bg-gray-700 rounded-lg">
                                <button onClick={() => setViewMode('table')} title="List View" className={`p-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <List className="h-4 w-4" />
                                </button>
                                <button onClick={() => setViewMode('card')} title="Grid View" className={`p-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'card' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <button onClick={() => setIsImportGuideOpen(true)} title="Import Help Guide" className="p-2 text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 shadow-2xs transition-colors">
                                <HelpCircle className="h-4.5 w-4.5" />
                            </button>
                            <button onClick={() => navigate('/company-settings/party-type/new')} className="flex items-center justify-center px-4 py-2 bg-[#00A9A8] hover:bg-[#008f8e] text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors">
                                <Plus className="mr-1.5 h-4 w-4" /> Add Party
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by company name, contact, code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9A8] dark:text-white shadow-2xs"
                            />
                        </div>
                        <select
                            value={partyTypeFilter}
                            onChange={(e) => { setPartyTypeFilter(e.target.value); setCurrentPage(0); }}
                            className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9A8] dark:text-white shadow-2xs"
                        >
                            {partyTypes.map(type => (
                                <option key={type} value={type}>
                                    {type === 'ALL' ? 'All Party Types' : type === 'CRM_LEAD' ? 'CRM Lead' : type.charAt(0) + type.slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs mb-4" role="alert">{error}</div>}
                    {importSuccess && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-xs mb-4" role="alert">{importSuccess}</div>}

                    <main className="flex-grow">
                        {loading ? (
                            <div className="flex justify-center items-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00A9A8]" /></div>
                        ) : filteredParties.length > 0 ? (
                            viewMode === 'card' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {filteredParties.map(party => (
                                        <PartyCard key={party.id} party={party} onEdit={() => navigate(`/company-settings/party-type/edit/${party.id}`)} onDelete={handleDelete} onView={handleView} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">#</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">Company Name</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">Code</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">Contact Person</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">Email</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">City</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">Role Type</th>
                                                    <th scope="col" className="px-5 py-3.5 font-bold">Status</th>
                                                    <th scope="col" className="px-5 py-3.5 text-right font-bold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {filteredParties.map((party, index) => (
                                                    <tr key={party.id} className="hover:bg-teal-50/30 dark:hover:bg-gray-750 transition-colors">
                                                        <td className="px-5 py-4 text-xs text-gray-500">{currentPage * pageSize + index + 1}</td>
                                                        <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{party.companyName}</td>
                                                        <td className="px-5 py-4 text-xs font-mono text-gray-500">{party.customerCode || party.vendorCustomerCode || 'N/A'}</td>
                                                        <td className="px-5 py-4">{party.primaryContactPerson || 'N/A'}</td>
                                                        <td className="px-5 py-4 text-xs">{party.contactEmail || 'N/A'}</td>
                                                        <td className="px-5 py-4 text-xs">{party.city || 'N/A'}</td>
                                                        <td className="px-5 py-4">{getPartyTypeBadge(party.partyType)}</td>
                                                        <td className="px-5 py-4">
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${party.active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                                                                {party.active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 text-right whitespace-nowrap">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button onClick={() => handleView(party)} title="View Details" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                                <button onClick={() => navigate(`/company-settings/party-type/edit/${party.id}`)} title="Edit" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                                <button onClick={() => handleDelete(party.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 text-red-500">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-16 text-center shadow-2xs">
                                <Search className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                                <h3 className="text-base font-bold text-gray-800 dark:text-white">No Parties Found</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">There are no records matching your current filter. Get started by creating a new party entry.</p>
                                <button onClick={() => navigate('/company-settings/party-type/new')} className="mt-4 inline-flex items-center px-4 py-2 bg-[#00A9A8] text-white text-xs font-semibold rounded-lg hover:bg-[#008f8e] transition-colors">
                                    <Plus className="mr-1.5 h-4 w-4" /> Create First Party
                                </button>
                            </div>
                        )}
                    </main>

                    {!loading && parties.length > 0 && (
                        <footer className="flex flex-col sm:flex-row justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 gap-4">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <span>Rows per page:</span>
                                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }} className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00A9A8]">
                                    {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                                </select>
                                <span className="ml-2">
                                    Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements || parties.length)} of {totalElements || parties.length} entries
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </footer>
                    )}
                </div>

                {isImportGuideOpen && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-xs" onClick={() => setIsImportGuideOpen(false)}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">Party Bulk Import Guide</h3>
                                <button onClick={() => setIsImportGuideOpen(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
                                    Prepare your CSV or Excel file matching the following format for seamless bulk party ingestion:
                                </p>
                                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-xs text-left text-gray-600 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th scope="col" className="px-4 py-2.5 font-bold">Field Name</th>
                                                <th scope="col" className="px-4 py-2.5 font-bold">Required</th>
                                                <th scope="col" className="px-4 py-2.5 font-bold">Description</th>
                                                <th scope="col" className="px-4 py-2.5 font-bold">Example</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            <tr>
                                                <td className="px-4 py-2.5 font-mono font-bold text-gray-900 dark:text-white">companyName</td>
                                                <td className="px-4 py-2.5 text-red-600 font-bold">Yes</td>
                                                <td className="px-4 py-2.5">Legal name of the business entity</td>
                                                <td className="px-4 py-2.5">Emirates Logistics LLC</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2.5 font-mono font-bold text-gray-900 dark:text-white">partyType</td>
                                                <td className="px-4 py-2.5 text-red-600 font-bold">Yes</td>
                                                <td className="px-4 py-2.5">CUSTOMER, SUPPLIER, or VENDOR</td>
                                                <td className="px-4 py-2.5">CUSTOMER</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2.5 font-mono">primaryContactPerson</td>
                                                <td className="px-4 py-2.5 text-gray-400">No</td>
                                                <td className="px-4 py-2.5">Main point of contact full name</td>
                                                <td className="px-4 py-2.5">Sajid Al-Maktoum</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2.5 font-mono">vatTrnNumber</td>
                                                <td className="px-4 py-2.5 text-gray-400">No</td>
                                                <td className="px-4 py-2.5">UAE 15-digit Tax Registration Number</td>
                                                <td className="px-4 py-2.5">100234567800003</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewingParty && (
                    <PartyViewModal
                        party={viewingParty}
                        onClose={() => setViewingParty(null)}
                        onEdit={(party) => navigate(`/company-settings/party-type/edit/${party.id}`)}
                        onDelete={handleDelete}
                        isLoadingDetails={isLoadingDetails}
                    />
                )}
            </div>
        </CompanyHubLayout>
    );
};

export default PartyType;
