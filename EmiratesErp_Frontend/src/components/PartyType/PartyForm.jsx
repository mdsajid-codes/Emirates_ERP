import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Save, X, Building, User, Mail, Briefcase, Percent, Plus, Trash2, ChevronDown, FileText, Truck, Share2, TrendingUp, ArrowLeft, MapPin, CreditCard, Banknote, ShieldCheck, Globe, Phone } from 'lucide-react';
import CompanyHubLayout from '../CompanyHubLayout';

const TabButton = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
      isActive
        ? 'bg-[#00A9A8] text-white shadow-2xs'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    {label}
  </button>
);

const ToggleSection = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-2xs overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none bg-gray-50/50 dark:bg-gray-750 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h3>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && <div className="p-6 space-y-4">{children}</div>}
    </div>
  );
};

const emptyAddress = () => ({
  attention: '',
  country: 'United Arab Emirates',
  addressLine1: '',
  addressLine2: '',
  city: 'Dubai',
  state: 'Dubai',
  zipCode: '',
  phone: '',
  fax: '',
});

const PartyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;

  const defaultPartyType = location.state?.partyType || 'CUSTOMER';

  const [party, setParty] = useState({
    partyType: defaultPartyType,
    companyName: '',
    primaryContactPerson: '',
    contactEmail: '',
    contactPhone: '',
    active: true,
    under: '',
    priceCategory: '',
    vendorCustomerCode: '',
    customerCode: '',
    primaryContactTitle: 'Mr.',
    primaryFirstName: '',
    primaryLastName: '',
    mobile: '',
    workPhone: '',
    skypeNameOrNumber: '',
    designation: '',
    department: '',
    website: '',
    panNumber: '',
    city: 'Dubai',
    region: 'Dubai',
    currency: 'AED',
    billingAddress: emptyAddress(),
    shippingAddress: emptyAddress(),
    vatTreatment: 'VAT_REGISTERED',
    vatNumber: '',
    tanNumber: '',
    cinNo: '',
    taxDeducted: false,
    openingBalance: 0,
    openingBalanceType: 'DR',
    creditLimitAllowed: 0,
    creditPeriodAllowed: 30,
    shippingSameAsBilling: true,
    ownerCeoName: '',
    ownerCeoContact: '',
    ownerCeoEmail: '',
    vatTrnNumber: '',
    termsAndConditionsInternal: '',
    termsAndConditionsDisplay: '',
    modeOfPayment: 'Bank Transfer',
    deliveryType: 'Standard Ground',
    paymentTerms: 'Net 30 Days',
    transportDispatchThrough: '',
    freightTerms: '',
    splInstruction: '',
    salesValuePreviousYear: 0,
    facebook: '',
    twitter: '',
    remarks: '',
    otherPersons: [],
    customFields: [],
    bankDetails: [],
  });

  const [activeTab, setActiveTab] = useState('companyDetails');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const getAuthHeaders = () => {
    const tenantId = localStorage.getItem('tenantId') || 'default';
    return {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json'
      }
    };
  };

  useEffect(() => {
    if (!isEditing) return;

    const fetchParty = async () => {
      setLoading(true);
      setError(null);
      try {
        const partyResponse = await axios.get(`${API_URL}/parties/${id}`, getAuthHeaders());
        const fetchedParty = partyResponse.data || {};

        fetchedParty.billingAddress = fetchedParty.billingAddress || emptyAddress();
        fetchedParty.shippingAddress = fetchedParty.shippingAddress || emptyAddress();
        fetchedParty.currency = fetchedParty.currency || 'AED';
        fetchedParty.openingBalance = Number(fetchedParty.openingBalance || 0);
        fetchedParty.creditLimitAllowed = Number(fetchedParty.creditLimitAllowed || 0);
        fetchedParty.creditPeriodAllowed = Number(fetchedParty.creditPeriodAllowed || 0);
        fetchedParty.active = typeof fetchedParty.active === 'boolean' ? fetchedParty.active : !!fetchedParty.active;
        fetchedParty.shippingSameAsBilling = !!fetchedParty.shippingSameAsBilling;

        setParty(prev => ({ ...prev, ...fetchedParty }));
      } catch (err) {
        console.error('Failed to fetch party:', err);
        setError('Failed to load party details.');
      } finally {
        setLoading(false);
      }
    };

    fetchParty();
  }, [id, isEditing, API_URL]);

  useEffect(() => {
    if (party.shippingSameAsBilling) {
      setParty(prev => ({
        ...prev,
        shippingAddress: { ...prev.billingAddress },
      }));
    }
  }, [party.shippingSameAsBilling, party.billingAddress]);

  const handleInputChange = (e) => {
    const { name, value: rawValue, type, checked, dataset } = e.target;
    let value;

    if (type === 'checkbox') {
      value = checked;
    } else if (type === 'number') {
      value = rawValue === '' ? '' : Number(rawValue);
    } else if (e.target.tagName === 'SELECT' && name === 'active') {
      value = rawValue === 'true' || rawValue === true;
    } else {
      value = rawValue;
    }

    if (dataset.list && dataset.index) {
      const { list, index } = dataset;
      const updatedList = [...party[list]];
      updatedList[index] = { ...updatedList[index], [name]: value };
      setParty(prev => ({ ...prev, [list]: updatedList }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setParty(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setParty(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePartyTypeChange = (type) => {
    setParty(prev => ({ ...prev, partyType: type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...party,
      currency: party.currency || 'AED',
      billingAddress: party.billingAddress || emptyAddress(),
      shippingAddress: party.shippingSameAsBilling ? party.billingAddress || emptyAddress() : party.shippingAddress || emptyAddress(),
      openingBalance: Number(party.openingBalance || 0),
      creditLimitAllowed: Number(party.creditLimitAllowed || 0),
      creditPeriodAllowed: Number(party.creditPeriodAllowed || 0),
      active: !!party.active,
      shippingSameAsBilling: !!party.shippingSameAsBilling,
    };

    const url = isEditing ? `${API_URL}/parties/${id}` : `${API_URL}/parties`;
    const method = isEditing ? 'put' : 'post';

    try {
      await axios[method](url, payload, getAuthHeaders());
      navigate('/company-settings/party-type');
    } catch (err) {
      console.error('Failed to save party:', err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to save party. Please check input values.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const addBankDetail = () => {
    setParty(prev => ({
      ...prev,
      bankDetails: [...(prev.bankDetails || []), { bankName: '', accountNumber: '', ifsCode: '', ibanCode: '', locationBranch: '' }]
    }));
  };

  const removeBankDetail = (index) => {
    setParty(prev => ({
      ...prev,
      bankDetails: prev.bankDetails.filter((_, i) => i !== index)
    }));
  };

  const addOtherPerson = () => {
    setParty(prev => ({
      ...prev,
      otherPersons: [...(prev.otherPersons || []), { salutation: 'Mr.', firstName: '', lastName: '', emailAddress: '', workPhone: '', mobile: '', designation: '' }]
    }));
  };

  const removeOtherPerson = (index) => {
    setParty(prev => ({
      ...prev,
      otherPersons: prev.otherPersons.filter((_, i) => i !== index)
    }));
  };

  if (loading && isEditing) {
    return (
      <CompanyHubLayout>
        <div className="flex justify-center items-center h-full py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#00A9A8]" />
        </div>
      </CompanyHubLayout>
    );
  }

  return (
    <CompanyHubLayout>
      <form onSubmit={handleSubmit} className="flex flex-col h-full bg-[#F7FAFF] dark:bg-gray-900">
        {/* Page Header */}
        <header className="bg-white dark:bg-gray-800 shadow-2xs px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/company-settings/party-type')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Back to Party List"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {isEditing ? 'Edit Party Profile' : 'Create New Party'}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Settings &gt; Manage Parties &gt; {isEditing ? 'Edit' : 'New Party'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/company-settings/party-type')}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="inline mr-1.5 h-4 w-4" /> Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold bg-[#00A9A8] hover:bg-[#008f8e] text-white rounded-lg shadow-2xs transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                {isEditing ? 'Update Party' : 'Save Party'}
              </button>
            </div>
          </div>
        </header>

        {/* Form Body Container */}
        <div className="flex-grow p-6 w-full">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs mb-6" role="alert">
              {error}
            </div>
          )}

          {/* Party Role Selector Bar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Party Type / Role:</span>
              <div className="flex items-center gap-2">
                {[
                  { key: 'CUSTOMER', label: 'Customer', badge: 'bg-blue-100 text-blue-800' },
                  { key: 'SUPPLIER', label: 'Supplier', badge: 'bg-purple-100 text-purple-800' },
                  { key: 'VENDOR', label: 'Logistics Vendor', badge: 'bg-amber-100 text-amber-800' },
                  { key: 'CRM_LEAD', label: 'CRM Lead', badge: 'bg-emerald-100 text-emerald-800' },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handlePartyTypeChange(item.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      party.partyType === item.key
                        ? 'border-[#00A9A8] bg-teal-50 dark:bg-teal-900/30 text-[#00A9A8]'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Status:</span>
              <select
                name="active"
                value={String(party.active)}
                onChange={handleInputChange}
                className="px-3 py-1 text-xs font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
            <TabButton label="Company Profile" isActive={activeTab === 'companyDetails'} onClick={() => setActiveTab('companyDetails')} />
            <TabButton label="Primary & Extra Contacts" isActive={activeTab === 'otherPerson'} onClick={() => setActiveTab('otherPerson')} />
            <TabButton label="Bank Details" isActive={activeTab === 'bankDetails'} onClick={() => setActiveTab('bankDetails')} />
            <TabButton label="Terms & Delivery" isActive={activeTab === 'termsDetails'} onClick={() => setActiveTab('termsDetails')} />
          </div>

          {/* TAB 1: Company Profile & Financials */}
          {activeTab === 'companyDetails' && (
            <div className="space-y-6">
              <ToggleSection title="Basic Company Information" icon={<Building className="w-5 h-5 text-[#00A9A8]" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Company / Legal Name *</label>
                    <input
                      name="companyName"
                      value={party.companyName}
                      onChange={handleInputChange}
                      placeholder="e.g. Dubai Trading LLC"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#00A9A8]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Customer / Party Code</label>
                    <input
                      name="customerCode"
                      value={party.customerCode}
                      onChange={handleInputChange}
                      placeholder="e.g. CUST-9001"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Vendor Reference Code</label>
                    <input
                      name="vendorCustomerCode"
                      value={party.vendorCustomerCode}
                      onChange={handleInputChange}
                      placeholder="e.g. VEN-402"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Website URL</label>
                    <input
                      name="website"
                      value={party.website}
                      onChange={handleInputChange}
                      placeholder="https://company.ae"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">City / Emirate</label>
                    <input
                      name="city"
                      value={party.city}
                      onChange={handleInputChange}
                      placeholder="Dubai"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Region / Country</label>
                    <input
                      name="region"
                      value={party.region}
                      onChange={handleInputChange}
                      placeholder="United Arab Emirates"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </ToggleSection>

              <ToggleSection title="Address Details (UAE)" icon={<MapPin className="w-5 h-5 text-[#00A9A8]" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Billing Address */}
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Billing Address</h4>
                    <div>
                      <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">Address Line 1</label>
                      <input name="billingAddress.addressLine1" value={party.billingAddress.addressLine1} onChange={handleInputChange} placeholder="Building, Street Name" className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">Address Line 2</label>
                      <input name="billingAddress.addressLine2" value={party.billingAddress.addressLine2} onChange={handleInputChange} placeholder="Suite, P.O. Box" className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">Emirate / City</label>
                        <input name="billingAddress.city" value={party.billingAddress.city} onChange={handleInputChange} placeholder="Dubai" className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">Country</label>
                        <input name="billingAddress.country" value={party.billingAddress.country} onChange={handleInputChange} placeholder="United Arab Emirates" className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Shipping Address</h4>
                      <label className="flex items-center text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                        <input type="checkbox" name="shippingSameAsBilling" checked={party.shippingSameAsBilling} onChange={handleInputChange} className="mr-1.5 rounded text-[#00A9A8]" />
                        Same as Billing
                      </label>
                    </div>
                    {!party.shippingSameAsBilling && (
                      <>
                        <div>
                          <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">Address Line 1</label>
                          <input name="shippingAddress.addressLine1" value={party.shippingAddress.addressLine1} onChange={handleInputChange} placeholder="Warehouse / Facility Address" className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">City</label>
                            <input name="shippingAddress.city" value={party.shippingAddress.city} onChange={handleInputChange} placeholder="Abu Dhabi" className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">Country</label>
                            <input name="shippingAddress.country" value={party.shippingAddress.country} onChange={handleInputChange} placeholder="United Arab Emirates" className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </ToggleSection>

              <ToggleSection title="Financial & Tax Setup (AED)" icon={<Percent className="w-5 h-5 text-[#00A9A8]" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Trade License / PAN</label>
                    <input name="panNumber" value={party.panNumber} onChange={handleInputChange} placeholder="TL-123456" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">VAT TRN Number (15-digit)</label>
                    <input name="vatTrnNumber" value={party.vatTrnNumber} onChange={handleInputChange} placeholder="100234567800003" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                    <select name="currency" value={party.currency || 'AED'} onChange={handleInputChange} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <option value="AED">AED (UAE Dirham)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="SAR">SAR (Saudi Riyal)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Credit Limit (AED)</label>
                    <input type="number" name="creditLimitAllowed" value={party.creditLimitAllowed} onChange={handleInputChange} placeholder="100000" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Credit Period (Days)</label>
                    <input type="number" name="creditPeriodAllowed" value={party.creditPeriodAllowed} onChange={handleInputChange} placeholder="30" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Opening Balance (AED)</label>
                    <input type="number" name="openingBalance" value={party.openingBalance} onChange={handleInputChange} placeholder="0" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Balance Type</label>
                    <select name="openingBalanceType" value={party.openingBalanceType} onChange={handleInputChange} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <option value="DR">Debit (DR)</option>
                      <option value="CR">Credit (CR)</option>
                    </select>
                  </div>
                </div>
              </ToggleSection>
            </div>
          )}

          {/* TAB 2: Contacts */}
          {activeTab === 'otherPerson' && (
            <div className="space-y-6">
              <ToggleSection title="Primary Contact Details" icon={<User className="w-5 h-5 text-[#00A9A8]" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <select name="primaryContactTitle" value={party.primaryContactTitle} onChange={handleInputChange} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Eng.">Eng.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                    <input name="primaryFirstName" value={party.primaryFirstName} onChange={handleInputChange} placeholder="Sajid" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                    <input name="primaryLastName" value={party.primaryLastName} onChange={handleInputChange} placeholder="Al-Maktoum" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                    <input name="contactEmail" value={party.contactEmail} onChange={handleInputChange} placeholder="sajid@company.ae" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Work Phone (+971)</label>
                    <input name="contactPhone" value={party.contactPhone} onChange={handleInputChange} placeholder="+971 4 123 4567" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Mobile (+971)</label>
                    <input name="mobile" value={party.mobile} onChange={handleInputChange} placeholder="+971 50 123 4567" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                    <input name="designation" value={party.designation} onChange={handleInputChange} placeholder="General Manager" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                </div>
              </ToggleSection>

              {/* Extra Contacts List */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center"><User className="w-4 h-4 mr-2 text-[#00A9A8]" /> Additional Contact Persons</h3>
                  <button type="button" onClick={addOtherPerson} className="px-3 py-1.5 text-xs font-semibold bg-[#00A9A8] text-white rounded-lg hover:bg-[#008f8e] transition-colors flex items-center">
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Person
                  </button>
                </div>
                {party.otherPersons && party.otherPersons.length > 0 ? (
                  <div className="space-y-3">
                    {party.otherPersons.map((person, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-between gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-grow">
                          <input data-list="otherPersons" data-index={idx} name="firstName" value={person.firstName} onChange={handleInputChange} placeholder="First Name" className="px-2.5 py-1.5 text-xs border rounded-md dark:bg-gray-800 dark:text-white" />
                          <input data-list="otherPersons" data-index={idx} name="lastName" value={person.lastName} onChange={handleInputChange} placeholder="Last Name" className="px-2.5 py-1.5 text-xs border rounded-md dark:bg-gray-800 dark:text-white" />
                          <input data-list="otherPersons" data-index={idx} name="emailAddress" value={person.emailAddress} onChange={handleInputChange} placeholder="Email Address" className="px-2.5 py-1.5 text-xs border rounded-md dark:bg-gray-800 dark:text-white" />
                          <input data-list="otherPersons" data-index={idx} name="mobile" value={person.mobile} onChange={handleInputChange} placeholder="Mobile" className="px-2.5 py-1.5 text-xs border rounded-md dark:bg-gray-800 dark:text-white" />
                        </div>
                        <button type="button" onClick={() => removeOtherPerson(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No additional contacts added yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Bank Details */}
          {activeTab === 'bankDetails' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center"><Banknote className="w-4 h-4 mr-2 text-[#00A9A8]" /> Bank Account Entries</h3>
                <button type="button" onClick={addBankDetail} className="px-3 py-1.5 text-xs font-semibold bg-[#00A9A8] text-white rounded-lg hover:bg-[#008f8e] transition-colors flex items-center">
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Bank Account
                </button>
              </div>
              {party.bankDetails && party.bankDetails.length > 0 ? (
                <div className="space-y-4">
                  {party.bankDetails.map((bank, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600 relative">
                      <button type="button" onClick={() => removeBankDetail(idx)} className="absolute top-3 right-3 p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">Bank Name</label>
                          <input data-list="bankDetails" data-index={idx} name="bankName" value={bank.bankName} onChange={handleInputChange} placeholder="e.g. Emirates NBD" className="w-full px-3 py-1.5 text-xs border rounded-md dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">Account Number</label>
                          <input data-list="bankDetails" data-index={idx} name="accountNumber" value={bank.accountNumber} onChange={handleInputChange} placeholder="101234567890" className="w-full px-3 py-1.5 text-xs border rounded-md dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">IBAN Code</label>
                          <input data-list="bankDetails" data-index={idx} name="ibanCode" value={bank.ibanCode} onChange={handleInputChange} placeholder="AE2803300000101234567890" className="w-full px-3 py-1.5 text-xs border rounded-md dark:bg-gray-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">Swift / BIC Code</label>
                          <input data-list="bankDetails" data-index={idx} name="ifsCode" value={bank.ifsCode} onChange={handleInputChange} placeholder="EBNDAEAD" className="w-full px-3 py-1.5 text-xs border rounded-md dark:bg-gray-800 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No bank accounts recorded for this party.</p>
              )}
            </div>
          )}

          {/* TAB 4: Terms & Notes */}
          {activeTab === 'termsDetails' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center"><FileText className="w-4 h-4 mr-2 text-[#00A9A8]" /> Terms & Conditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Payment Terms</label>
                  <input name="paymentTerms" value={party.paymentTerms} onChange={handleInputChange} placeholder="Net 30 Days" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Preferred Mode of Payment</label>
                  <input name="modeOfPayment" value={party.modeOfPayment} onChange={handleInputChange} placeholder="Bank Transfer / PDC" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Internal Notes & Remarks</label>
                  <textarea name="remarks" value={party.remarks} onChange={handleInputChange} rows={3} placeholder="Add any special instructions or remarks..." className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </CompanyHubLayout>
  );
};

export default PartyForm;