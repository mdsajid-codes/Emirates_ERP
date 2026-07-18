import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  X,
  Eye,
  Truck,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  History,
  User
} from 'lucide-react';
import { toast } from 'react-toastify';
import CustomerForm from '../tripManagement/components/form/CustomerForm';
import CustomerFollowUpForm from './CustomerFollowUpForm';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [customer, setCustomer] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [trips, setTrips] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFollowUpFormOpen, setIsFollowUpFormOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

      const [cRes, fRes, tRes, iRes] = await Promise.all([
        axios.get(`${API_URL}/fleet/trip-customers/${id}`, { headers }),
        axios.get(`${API_URL}/fleet/trip-customers/${id}/follow-ups`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/fleet/trips`, { params: { customerId: id, size: 50 }, headers }),
        axios.get(`${API_URL}/fleet/trip-invoices`, { params: { customerId: id, size: 50 }, headers })
      ]);

      setCustomer(cRes.data);
      setFollowUps(fRes.data || []);
      setTrips(tRes.data.content || []);
      setInvoices(iRes.data.content || []);

    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Failed to load customer details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePreview = async () => {
    if (!customer?.contractDocumentPath) return;
    try {
      const response = await axios.get(`${API_URL}/warehouse/files/view?path=${encodeURIComponent(customer.contractDocumentPath)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: 'blob'
      });
      const blobUrl = URL.createObjectURL(response.data);
      setPreviewFile({
        url: blobUrl,
        name: "Customer Contract",
        type: response.data.type
      });
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error previewing document:", error);
      toast.error("Could not load preview");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground-muted font-medium animate-pulse">Loading customer records...</p>
        </div>
      </div>
    );
  }

  if (!customer) return <div className="p-20 text-center text-foreground font-bold">Customer not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-theme shadow-sm border border-border sticky top-0 z-10 backdrop-blur-md bg-card/90">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/fleet-dashboard/customers')}
            className="p-2 hover:bg-background rounded-full transition-colors text-foreground-muted hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
              <Building2 size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{customer.companyName}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${customer.active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                  {customer.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-foreground-muted">Customer Code: {customer.customerCode} • {customer.customerType}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-theme text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Edit size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Trips', value: trips.length.toLocaleString(), icon: <Truck />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Credit Limit', value: `AED ${customer.creditLimit?.toLocaleString() || 0}`, icon: <CreditCard />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Follow-Ups', value: followUps.length, icon: <History />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Terms', value: `${customer.paymentTermsDays || 0} Days`, icon: <Clock />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-4 rounded-theme border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              {React.cloneElement(stat.icon, { size: 24 })}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground-muted uppercase tracking-tight">{stat.label}</p>
              <p className="text-lg font-black text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-8 overflow-x-auto no-scrollbar scroll-smooth">
        {['overview', 'follow-ups', 'trip history', 'invoices & payments', 'contract'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-primary' : 'text-foreground-muted hover:text-foreground'
              }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Company Information</h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  {[
                    { label: 'Company Name', value: customer.companyName, icon: <Building2 size={14} /> },
                    { label: 'Contact Person', value: customer.contactPerson, icon: <User size={14} /> },
                    { label: 'Phone Number', value: customer.phone, icon: <Phone size={14} /> },
                    { label: 'Email Address', value: customer.email, icon: <Mail size={14} /> },
                    { label: 'TRN Number', value: customer.trnNumber, icon: <ShieldCheck size={14} /> },
                    { label: 'Customer Type', value: customer.customerType, icon: <TrendingUp size={14} /> },
                    { label: 'Credit Limit', value: `AED ${customer.creditLimit?.toLocaleString()}`, icon: <CreditCard size={14} /> },
                    { label: 'Payment Terms', value: `${customer.paymentTermsDays} Days`, icon: <Clock size={14} /> },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-foreground-muted uppercase flex items-center gap-1">
                        {item.icon} {item.label}
                      </span>
                      <span className="text-sm font-medium text-foreground">{item.value || 'N/A'}</span>
                    </div>
                  ))}
                  <div className="sm:col-span-2 flex flex-col gap-1 border-t border-border pt-4 mt-2">
                    <span className="text-[10px] font-bold text-foreground-muted uppercase flex items-center gap-1">
                      <MapPin size={14} /> Address
                    </span>
                    <span className="text-sm font-medium text-foreground">{customer.address || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Contract Status</h3>
                  <FileText size={14} className="text-primary" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground-muted font-bold uppercase">Start Date</span>
                    <span className="text-sm font-bold">{customer.contractStartDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground-muted font-bold uppercase">End Date</span>
                    <span className={`text-sm font-bold ${new Date(customer.contractEndDate) < new Date() ? 'text-error' : 'text-success'}`}>
                      {customer.contractEndDate || 'N/A'}
                    </span>
                  </div>
                  {customer.contractDocumentPath && (
                    <button
                      onClick={handlePreview}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-2 border border-primary/20 bg-primary/5 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all"
                    >
                      <Eye size={14} /> View Contract Document
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'follow-ups' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-end">
              <button
                onClick={() => setIsFollowUpFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-theme text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                <Plus size={16} /> Log Interaction
              </button>
            </div>
            <div className="space-y-4">
              {followUps.map((followUp, i) => (
                <div key={i} className="bg-card border border-border rounded-theme p-6 shadow-sm flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-black uppercase">
                          {followUp.purpose}
                        </span>
                        <h4 className="text-sm font-bold text-foreground">{followUp.followUpDate}</h4>
                      </div>
                      <div className="text-[10px] text-foreground-muted font-bold uppercase">
                        By: {followUp.assignedToName || 'System'}
                      </div>
                    </div>
                    <p className="text-sm text-foreground-muted leading-relaxed italic">"{followUp.notes}"</p>
                    {followUp.nextFollowUpDate && (
                      <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-warning">
                        <Clock size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Next Follow-Up: {followUp.nextFollowUpDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {followUps.length === 0 && (
                <div className="py-20 text-center bg-card rounded-theme border border-dashed border-border">
                  <MessageSquare size={48} className="mx-auto text-muted mb-4 opacity-20" />
                  <p className="text-foreground-muted italic">No interaction records found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'trip history' && (
          <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Trip No</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Vehicle</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Driver</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trips.map((trip, i) => (
                    <tr key={i} className="hover:bg-background-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-foreground">{trip.tripNo}</td>
                      <td className="px-6 py-4 text-sm text-foreground-muted">{trip.tripDate}</td>
                      <td className="px-6 py-4 text-sm text-foreground-muted">{trip.vehiclePlateNumber}</td>
                      <td className="px-6 py-4 text-sm text-foreground-muted">{trip.driverName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${trip.tripStatus === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          }`}>
                          {trip.tripStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/trips/trip-details/${trip.id}`)}
                          className="p-1.5 hover:bg-primary/10 text-primary rounded transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {trips.length === 0 && (
              <div className="p-20 text-center">
                <Truck size={48} className="mx-auto text-muted mb-4 opacity-20" />
                <p className="text-foreground-muted italic">No trip records found for this customer</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices & payments' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-success/5 border border-success/10 p-4 rounded-theme">
                <p className="text-[10px] font-bold text-success uppercase tracking-widest mb-1">Paid Amount</p>
                <p className="text-xl font-black text-success">AED {invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}</p>
              </div>
              <div className="bg-warning/5 border border-warning/10 p-4 rounded-theme">
                <p className="text-[10px] font-bold text-warning uppercase tracking-widest mb-1">Pending Amount</p>
                <p className="text-xl font-black text-warning">AED {invoices.filter(i => i.status === 'PENDING').reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}</p>
              </div>
              <div className="bg-error/5 border border-error/10 p-4 rounded-theme">
                <p className="text-[10px] font-bold text-error uppercase tracking-widest mb-1">Overdue Amount</p>
                <p className="text-xl font-black text-error">AED {invoices.filter(i => i.status === 'OVERDUE').reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Invoice No</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Due Date</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Total</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.map((invoice, i) => (
                      <tr key={i} className="hover:bg-background-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-foreground">{invoice.invoiceNumber}</td>
                        <td className="px-6 py-4 text-sm text-foreground-muted">{invoice.invoiceDate}</td>
                        <td className="px-6 py-4 text-sm text-foreground-muted">{invoice.dueDate || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm font-black text-foreground">AED {invoice.totalAmount?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${invoice.status === 'PAID' ? 'bg-success/10 text-success' :
                              invoice.status === 'PENDING' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                            }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/fleet-dashboard/invoices/${invoice.id}`)}
                            className="p-1.5 hover:bg-primary/10 text-primary rounded transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {invoices.length === 0 && (
                <div className="p-20 text-center">
                  <CreditCard size={48} className="mx-auto text-muted mb-4 opacity-20" />
                  <p className="text-foreground-muted italic">No invoice records found for this customer</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contract' && (
          <div className="animate-in fade-in duration-300 h-[600px] bg-card rounded-theme border border-border flex flex-col items-center justify-center">
            {customer.contractDocumentPath ? (
              <div className="w-full h-full p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest">Signed Contract Document</h3>
                  <button
                    onClick={handlePreview}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Refresh Preview
                  </button>
                </div>
                <div className="flex-1 bg-muted/10 rounded-lg border border-border flex items-center justify-center overflow-hidden">
                  <FileText size={64} className="text-primary opacity-20" />
                  <p className="absolute text-xs font-bold text-foreground-muted mt-20 uppercase tracking-widest">Document Available - Use Preview Button</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <ShieldCheck size={48} className="mx-auto text-muted mb-4 opacity-20" />
                <p className="text-foreground-muted italic">No contract document uploaded</p>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="mt-4 px-6 py-2 border border-primary text-primary rounded-theme text-xs font-bold hover:bg-primary hover:text-white transition-all"
                >
                  Upload Contract
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {isPreviewOpen && previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 h-[85vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Document Preview</h3>
                  <p className="text-xs text-foreground-muted">{previewFile.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  URL.revokeObjectURL(previewFile.url);
                  setPreviewFile(null);
                  setIsPreviewOpen(false);
                }}
                className="p-2 hover:bg-background-muted rounded-full transition-colors text-foreground-muted hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 bg-muted/10 p-4 overflow-hidden">
              {(previewFile.type?.includes('image')) ? (
                <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                  <img
                    src={previewFile.url}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                  />
                </div>
              ) : (
                <iframe
                  src={previewFile.url}
                  className="w-full h-full rounded border border-border bg-white shadow-inner"
                  title="Document Preview"
                />
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end bg-background-muted/30 gap-3">
              <button
                onClick={() => {
                  URL.revokeObjectURL(previewFile.url);
                  setPreviewFile(null);
                  setIsPreviewOpen(false);
                }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-theme font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        isEditing={true}
        initialData={customer}
        onSave={fetchData}
      />

      <CustomerFollowUpForm
        isOpen={isFollowUpFormOpen}
        onClose={() => setIsFollowUpFormOpen(false)}
        onSave={fetchData}
        customerId={id}
      />
    </div>
  );
};

export default CustomerDetails;
