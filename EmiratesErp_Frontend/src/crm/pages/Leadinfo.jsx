// import React, { useState, useEffect, useCallback } from 'react';
// import { ArrowLeft, ChevronDown, ChevronUp, Users, Edit, Loader, Building, Briefcase, Globe, MapPin, Tag, User, Calendar, StickyNote, Activity, CheckSquare, LayoutGrid, ListFilter, ArrowRight, ArrowLeftCircle, XCircle, CheckCircle, Phone, Mail, Filter, Search, ShoppingCart, Receipt, FileText } from 'lucide-react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import axios from 'axios';
// import LeadFullDetailsModal from '../components/LeadFullDetailsModal';
// import { AnimatePresence, motion } from 'framer-motion';
// import CrmTaskForm from '../components/CrmTaskForm';
// import CrmEventForm from '../components/CrmEventForm';
// import CrmCallLogForm from '../components/CrmCallLogForm';
// import CrmEmailForm from '../components/CrmEmailForm';
// import EventsTab from '../components/EventsTab';
// import TasksTab from '../components/TasksTab';
// import CallLogsTab from '../components/CallLogsTab';
// import EmailsTab from '../components/EmailsTab';

// const API_URL = import.meta.env.VITE_API_BASE_URL;

// // --- Sub-Components ---
// const InfoDisplay = ({ label, value, icon: Icon }) => (
//     <div className="flex items-start gap-2">
//         {Icon && <Icon className="h-4 w-4 text-foreground-muted mt-0.5 flex-shrink-0" />}
//         <div>
//             <p className="text-sm text-foreground-muted">{label}</p>
//             <p className="font-medium text-foreground break-words">{value || <span className="text-foreground-muted/50">N/A</span>}</p>
//         </div>
//     </div>
// );

// const Section = ({ title, children }) => (
//     <div className="p-4 border border-border rounded-lg bg-background-muted">
//         <h4 className="font-semibold mb-4 text-foreground-muted">{title}</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {children}
//         </div>
//     </div>
// );

// const ContentTab = ({ icon: Icon, label, isActive, onClick }) => (
//     <button
//         onClick={onClick}
//         className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${isActive
//             ? 'border-primary text-primary'
//             : 'border-transparent text-foreground-muted hover:text-foreground'
//             }`}
//     >
//         <Icon className="h-5 w-5" />
//         <span>{label}</span>
//     </button>
// );

// const ActivityFeed = ({ lead }) => (
//     <div className="p-4">
//         <h3 className="font-semibold text-foreground mb-4">Activity Feed</h3>
//         <p className="text-sm text-foreground-muted">Activity feed for this lead will be displayed here. This can include notes, tasks, events, and emails.</p>
//         <div className="mt-4 space-y-4">
//             <div className="p-3 bg-background-muted rounded-lg">
//                 <p className="text-sm font-medium">Note Added</p>
//                 <p className="text-xs text-foreground-muted">by Admin on {new Date().toLocaleDateString()}</p>
//                 <p className="text-sm mt-1">Called the lead, they are interested in a demo next week.</p>
//             </div>
//         </div>
//     </div>
// );

// const LeadStages = ({ allStages, currentStageName, onStatusChange, onStageChange, lead }) => {
//     const [notResponding, setNotResponding] = useState(false);
//     const navigate = useNavigate();

//     const sortedStages = [...allStages].sort((a, b) => a.sortOrder - b.sortOrder);
//     const currentStageIndex = sortedStages.findIndex(stage => stage.name === currentStageName);
//     const currentStage = sortedStages[currentStageIndex];

//     const handleBack = () => {
//         if (currentStageIndex > 0) {
//             const previousStage = sortedStages[currentStageIndex - 1];
//             onStageChange(previousStage);
//         }
//     };

//     const handleNext = () => {
//         if (notResponding) {
//             onStatusChange('NOT_RESPONDING');
//         } else if (currentStageIndex < sortedStages.length - 1) {
//             const nextStage = sortedStages[currentStageIndex + 1];
//             onStageChange(nextStage);
//         }
//     };

//     const handleLost = () => onStatusChange('LOST');
//     const handleCompleted = () => onStatusChange('ACTIVE');

//     const handleCreateQuotation = () => {
//         navigate('/sales-dashboard/quotations/new', { state: { lead } });
//     };

//     const handleCreateSaleOrder = () => {
//         navigate('/sales-dashboard/orders/new', { state: { lead } });
//     };

//     return (
//         <div className="p-6 bg-card rounded-lg shadow-sm space-y-8">
//             <div>
//                 <h3 className="font-semibold text-foreground mb-6">Lead Stage</h3>
//                 <div className="flex items-center justify-between w-full">
//                     {sortedStages.map((stage, index) => {
//                         const isStageCompleted = stage.isCompleted;
//                         const isActive = index === currentStageIndex;
//                         return (
//                             <React.Fragment key={stage.id}>
//                                 <div className="flex flex-col items-center text-center w-20">
//                                     <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${isActive ? 'bg-primary border-primary text-primary-foreground' : isStageCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-background border-border'}`}>
//                                         {isStageCompleted ? '✓' : index + 1}
//                                     </div>
//                                     <p className={`mt-2 text-xs font-medium ${isActive ? 'text-primary' : 'text-foreground-muted'}`}>{stage.name}</p>
//                                 </div>
//                                 {index < sortedStages.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${isStageCompleted ? 'bg-green-500' : 'bg-border'}`} />}
//                             </React.Fragment>
//                         );
//                     })}
//                 </div>
//             </div>

//             <div className="pt-6 border-t border-border">
//                 <h3 className="font-semibold text-foreground mb-4">Lead Progression Actions</h3>
//                 <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
//                     <label className="flex items-center gap-2 cursor-pointer text-sm">
//                         <input type="checkbox" checked={notResponding} onChange={(e) => setNotResponding(e.target.checked)} className="h-4 w-4 rounded" />
//                         Mark as "Not Responding"
//                     </label>
//                     <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
//                         {currentStage?.moveTo === 'Quotation' && (
//                             <button onClick={handleCreateQuotation} className="btn-primary flex items-center gap-1 bg-purple-600 hover:bg-purple-700">
//                                 Create Quotation <ArrowRight size={16} />
//                             </button>
//                         )}
//                         {currentStage?.moveTo === 'Sale Order' && (
//                             <button onClick={handleCreateSaleOrder} className="btn-primary flex items-center gap-1 bg-orange-600 hover:bg-orange-700">
//                                 Create Sale Order <ArrowRight size={16} />
//                             </button>
//                         )}
//                         <button onClick={handleBack} disabled={currentStageIndex <= 0} className="btn-secondary flex items-center gap-1 disabled:opacity-50">
//                             <ArrowLeftCircle size={16} /> Back
//                         </button>
//                         <button onClick={handleNext} className="btn-primary flex items-center gap-1">
//                             Next <ArrowRight size={16} />
//                         </button>
//                         <button onClick={handleLost} className="btn-danger flex items-center gap-1"><XCircle size={16} /> Lost</button>
//                         <button onClick={handleCompleted} className="btn-success flex items-center gap-1"><CheckCircle size={16} /> Completed</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const ActionGrid = ({ onNewTaskClick, onNewEventClick, onLogCallClick, onEmailClick }) => {
//     const actions = [
//         { label: 'New Task', icon: CheckSquare, onClick: onNewTaskClick },
//         { label: 'New Event', icon: Calendar, onClick: onNewEventClick },
//         { label: 'Log a Call', icon: Phone, onClick: onLogCallClick },
//         { label: 'Email', icon: Mail, onClick: onEmailClick },
//     ];
//     return (
//         <div className="p-6 border-t border-border">
//             <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {actions.map(action => (
//                     <button key={action.label} onClick={action.onClick} className="flex flex-col items-center justify-center p-4 bg-background-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-foreground-muted">
//                         <action.icon className="h-6 w-6 mb-2" />
//                         <span className="text-sm font-medium">{action.label}</span>
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// };

// const LeadDetailsGrid = ({ lead }) => (
//     <div className="p-4">
//         <h3 className="font-semibold text-foreground mb-4">Lead Details</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <InfoDisplay icon={User} label="Full Name" value={`${lead.firstName} ${lead.lastName}`} />
//             <InfoDisplay icon={Building} label="Company" value={lead.companyName} />
//             <InfoDisplay icon={Tag} label="Status" value={lead.status} />
//             <InfoDisplay icon={Briefcase} label="Industry" value={lead.industryName} />
//             <InfoDisplay icon={MapPin} label="Location" value={lead.locationName} />
//             <InfoDisplay icon={Globe} label="Website" value={lead.website} />
//             <InfoDisplay icon={User} label="Owner" value={lead.ownerName} />
//             <InfoDisplay icon={Calendar} label="Created At" value={lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'N/A'} />
//             <InfoDisplay icon={Calendar} label="Last Updated At" value={lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : 'N/A'} />
//         </div>
//     </div>
// );

// // --- 1. Lead List Table Component (Matches Screenshot Design) ---
// const LeadListTable = () => {
//     const [leads, setLeads] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [metaData, setMetaData] = useState({ stages: {}, sources: {}, industries: {}, employees: [] });
//     const navigate = useNavigate();
//     const [searchTerm, setSearchTerm] = useState('');
//     const [currentPage, setCurrentPage] = useState(1);
//     const [pageSize, setPageSize] = useState(10);

//     // Filters
//     const [dateRange, setDateRange] = useState('This Year');
//     const [campaignFilter, setCampaignFilter] = useState('');
//     const [statusFilter, setStatusFilter] = useState('');
//     const [employeeFilter, setEmployeeFilter] = useState('');

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const token = localStorage.getItem('token');
//                 const headers = { "Authorization": `Bearer ${token}` };

//                 const [leadsRes, stagesRes, sourcesRes, industriesRes] = await Promise.all([
//                     axios.get(`${API_URL}/crm/leads?size=1000`, { headers }),
//                     axios.get(`${API_URL}/crm/lead-stages`, { headers }),
//                     axios.get(`${API_URL}/crm/lead-sources`, { headers }),
//                     axios.get(`${API_URL}/settings/industries`, { headers }),
//                 ]);

//                 const leadsData = leadsRes.data.content || [];
//                 const stagesMap = (stagesRes.data || []).reduce((acc, item) => ({ ...acc, [item.id]: item.name }), {});
//                 const sourcesMap = (sourcesRes.data || []).reduce((acc, item) => ({ ...acc, [item.id]: item.name }), {});
//                 const industriesMap = (industriesRes.data || []).reduce((acc, item) => ({ ...acc, [item.id]: item.name }), {});

//                 setLeads(leadsData);
//                 setMetaData({ stages: stagesMap, sources: sourcesMap, industries: industriesMap, employees: [] });
//             } catch (err) {
//                 console.error("Failed to fetch lead info", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, []);

//     const filteredLeads = leads.filter(lead => {
//         const matchesSearch = (lead.firstName?.toLowerCase() + ' ' + lead.lastName?.toLowerCase()).includes(searchTerm.toLowerCase()) ||
//             lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             lead.phone?.includes(searchTerm) ||
//             lead.leadNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

//         const matchesStatus = statusFilter ? lead.status === statusFilter : true;
//         return matchesSearch && matchesStatus;
//     });

//     const totalRecords = filteredLeads.length;
//     const totalPages = Math.ceil(totalRecords / pageSize);
//     const startIndex = (currentPage - 1) * pageSize;
//     const paginatedLeads = filteredLeads.slice(startIndex, startIndex + pageSize);

//     const renderPagination = () => {
//         const pages = [];
//         for (let i = 1; i <= totalPages; i++) {
//             if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
//                 pages.push(i);
//             } else if (pages[pages.length - 1] !== '...') {
//                 pages.push('...');
//             }
//         }

//         return (
//             <div className="flex items-center gap-1">
//                 <button
//                     disabled={currentPage === 1}
//                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                     className="min-w-[30px] h-8 px-2 rounded border text-sm flex items-center justify-center bg-white border-slate-200 text-slate-600 disabled:opacity-50"
//                 >
//                     &lt;
//                 </button>
//                 {pages.map((p, idx) => (
//                     <button
//                         key={idx}
//                         onClick={() => typeof p === 'number' && setCurrentPage(p)}
//                         className={`min-w-[30px] h-8 px-2 rounded border text-sm flex items-center justify-center transition-colors ${p === currentPage
//                             ? 'bg-teal-500 text-white border-teal-500'
//                             : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
//                             } ${typeof p !== 'number' ? 'cursor-default' : ''}`}
//                         disabled={typeof p !== 'number'}
//                     >
//                         {p}
//                     </button>
//                 ))}
//                 <button
//                     disabled={currentPage === totalPages}
//                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                     className="min-w-[30px] h-8 px-2 rounded border text-sm flex items-center justify-center bg-white border-slate-200 text-slate-600 disabled:opacity-50"
//                 >
//                     &gt;
//                 </button>
//             </div>
//         );
//     };

//     if (loading) {
//         return <div className="flex justify-center items-center h-full"><Loader className="animate-spin text-primary" size={32} /></div>;
//     }

//     return (
//         <div className="p-4 bg-slate-50 min-h-screen font-sans">
//             {/* Top Filters Bar */}
//             <div className="flex flex-wrap items-center gap-3 mb-4">
//                 <div className="flex items-center gap-2">
//                     <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
//                         ZT
//                     </div>
//                     <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
//                         <Filter size={18} />
//                     </div>
//                 </div>

//                 <select className="bg-white border border-slate-300 text-slate-700 text-sm rounded h-9 px-3 focus:outline-none focus:border-teal-500">
//                     <option>All Leads</option>
//                     <option>My Leads</option>
//                 </select>

//                 <select
//                     className="bg-white border border-slate-300 text-slate-700 text-sm rounded h-9 px-3 focus:outline-none focus:border-teal-500"
//                     value={dateRange}
//                     onChange={(e) => setDateRange(e.target.value)}
//                 >
//                     <option>This Year</option>
//                     <option>This Month</option>
//                     <option>Last Month</option>
//                 </select>

//                 <select
//                     className="bg-white border border-slate-300 text-slate-700 text-sm rounded h-9 px-3 min-w-[150px] focus:outline-none focus:border-teal-500"
//                     value={campaignFilter}
//                     onChange={(e) => setCampaignFilter(e.target.value)}
//                 >
//                     <option value="">Lead Campaign...</option>
//                 </select>

//                 <select
//                     className="bg-white border border-slate-300 text-slate-700 text-sm rounded h-9 px-3 min-w-[120px] focus:outline-none focus:border-teal-500"
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                 >
//                     <option value="">Status...</option>
//                     <option value="NEW">New</option>
//                     <option value="ACTIVE">Active</option>
//                     <option value="CONTACTED">Contacted</option>
//                     <option value="LOST">Lost</option>
//                     <option value="CONVERTED">Converted</option>
//                 </select>

//                 <select
//                     className="bg-white border border-slate-300 text-slate-700 text-sm rounded h-9 px-3 min-w-[120px] focus:outline-none focus:border-teal-500"
//                     value={employeeFilter}
//                     onChange={(e) => setEmployeeFilter(e.target.value)}
//                 >
//                     <option value="">Employee...</option>
//                 </select>
//             </div>

//             {/* Toolbar Row */}
//             <div className="bg-white p-3 rounded-t-lg border border-slate-200 border-b-0 flex flex-wrap justify-between items-center gap-4">
//                 <div className="flex items-center gap-3">
//                     <div className="flex items-center items-center gap-2 text-sm text-slate-600">
//                         <span className="font-semibold">Page Size</span>
//                         <select
//                             className="bg-slate-100 border border-slate-300 rounded px-2 py-1 focus:outline-none"
//                             value={pageSize}
//                             onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
//                         >
//                             <option value={10}>10</option>
//                             <option value={20}>20</option>
//                             <option value={50}>50</option>
//                             <option value={100}>100</option>
//                         </select>
//                     </div>
//                     <span className="text-sm font-semibold text-slate-600">Total Records {totalRecords}</span>
//                 </div>

//                 <div className="flex items-center gap-3">
//                     <div className="flex bg-slate-100 rounded-full p-1">
//                         <button className="px-4 py-1 rounded-full text-sm font-medium bg-teal-500 text-white shadow-sm">Team</button>
//                         <button className="px-4 py-1 rounded-full text-sm font-medium text-slate-500 hover:text-slate-700">Self</button>
//                     </div>

//                     <div className="flex items-center -space-x-px border border-teal-500 rounded overflow-hidden">
//                         <button className="p-2 text-teal-600 bg-white hover:bg-teal-50 border-r border-teal-500" title="Add New" onClick={() => navigate('/crm-dashboard/leads/new')}><div className="h-4 w-4 flex items-center justify-center font-bold">+</div></button>
//                         <button className="p-2 text-teal-600 bg-white hover:bg-teal-50 border-r border-teal-500" title="Import"><div className="h-4 w-4 flex items-center justify-center">↓</div></button>
//                         <button className="p-2 text-teal-600 bg-white hover:bg-teal-50 border-r border-teal-500" title="Export"><div className="h-4 w-4 flex items-center justify-center">↗</div></button>
//                         <button className="p-2 text-teal-600 bg-white hover:bg-teal-50 border-r border-teal-500" title="Refresh" onClick={() => window.location.reload()}><div className="h-4 w-4 flex items-center justify-center">⟳</div></button>
//                         <button className="p-2 text-teal-600 bg-white hover:bg-teal-50 border-r border-teal-500" title="Settings"><div className="h-4 w-4 flex items-center justify-center">⚙</div></button>
//                         <button className="p-2 text-teal-600 bg-white hover:bg-teal-50" title="Grid View"><LayoutGrid size={16} /></button>
//                     </div>

//                     <div className="relative">
//                         <input
//                             type="text"
//                             placeholder="Search"
//                             className="pl-3 pr-8 py-1.5 border border-slate-300 rounded text-sm w-48 focus:outline-none focus:border-teal-500 transition-all"
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                         />
//                         <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
//                     </div>
//                 </div>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto bg-white border border-slate-200 rounded-b-lg shadow-sm">
//                 <table className="w-full text-xs text-left">
//                     <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-tight">
//                         <tr>
//                             <th className="px-3 py-3 w-12 text-center border-r border-slate-100">S.No.</th>
//                             <th className="px-3 py-3 border-r border-slate-100">Date</th>
//                             <th className="px-3 py-3 border-r border-slate-100">Name</th>
//                             <th className="px-3 py-3 border-r border-slate-100">Lead No</th>
//                             <th className="px-3 py-3 border-r border-slate-100">Requirements</th>
//                             <th className="px-3 py-3 border-r border-slate-100">Company</th>
//                             <th className="px-3 py-3 border-r border-slate-100">Phone</th>
//                             <th className="px-3 py-3 border-r border-slate-100">Lead Status</th>
//                             <th className="px-3 py-3 border-r border-slate-100">Lead Source</th>
//                             <th className="px-3 py-3 border-r border-slate-100">Industry</th>
//                             <th className="px-3 py-3 border-r border-slate-100">Last Comment</th>
//                             <th className="px-3 py-3 w-16 text-center">Action</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-100">
//                         {paginatedLeads.length > 0 ? paginatedLeads.map((lead, index) => (
//                             <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
//                                 <td className="px-3 py-2.5 text-center text-slate-500 border-r border-slate-50">{startIndex + index + 1}</td>
//                                 <td className="px-3 py-2.5 text-slate-600 border-r border-slate-50 whitespace-nowrap">
//                                     {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-'}
//                                 </td>
//                                 <td className="px-3 py-2.5 border-r border-slate-50">
//                                     <Link to={`/crm-dashboard/leads/${lead.id}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
//                                         {lead.firstName} {lead.lastName}
//                                     </Link>
//                                 </td>
//                                 <td className="px-3 py-2.5 text-blue-500 border-r border-slate-50">{lead.leadNo}</td>
//                                 <td className="px-3 py-2.5 text-slate-600 border-r border-slate-50 max-w-xs truncate" title={lead.requirements}>{lead.requirements || '-'}</td>
//                                 <td className="px-3 py-2.5 text-slate-600 border-r border-slate-50 max-w-xs truncate" title={lead.companyName}>{lead.companyName}</td>
//                                 <td className="px-3 py-2.5 text-slate-600 border-r border-slate-50 whitespace-nowrap">{lead.phone}</td>
//                                 <td className="px-3 py-2.5 border-r border-slate-50">
//                                     <span className="text-slate-700">{lead.status}</span>
//                                 </td>
//                                 <td className="px-3 py-2.5 text-slate-600 border-r border-slate-50">{metaData.sources[lead.leadSourceId] || '-'}</td>
//                                 <td className="px-3 py-2.5 text-slate-600 border-r border-slate-50">{metaData.industries[lead.industryId] || '-'}</td>
//                                 <td className="px-3 py-2.5 text-slate-600 border-r border-slate-50 max-w-xs truncate" title={lead.notes}>{lead.notes || '-'}</td>
//                                 <td className="px-3 py-2.5 text-center">
//                                     <button
//                                         onClick={() => navigate(`/crm-dashboard/leads/${lead.id}`)}
//                                         className="h-7 w-7 rounded bg-teal-500 text-white hover:bg-teal-600 flex items-center justify-center mx-auto transition-colors shadow-sm"
//                                         title="Edit/View"
//                                     >
//                                         <Edit className="h-3.5 w-3.5" />
//                                     </button>
//                                 </td>
//                             </tr>
//                         )) : (
//                             <tr>
//                                 <td colSpan="12" className="px-6 py-12 text-center text-slate-400">
//                                     <div className="flex flex-col items-center">
//                                         <Users className="h-12 w-12 text-slate-200 mb-2" />
//                                         <p>No leads found matching your criteria.</p>
//                                     </div>
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Bottom Pagination */}
//             <div className="flex justify-end mt-4">
//                 {renderPagination()}
//             </div>
//         </div>
//     );
// };

// // --- 2. Lead Detail View Component (Redesigned with Navy Blue Theme) ---
// const LeadDetailView = ({ leadId }) => {
//     const navigate = useNavigate();
//     const [lead, setLead] = useState(null);
//     const [leadStages, setLeadStages] = useState([]);
//     const [recentLeads, setRecentLeads] = useState([]); // For Sidebar
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     // Action State
//     const [activeSidebarTab, setActiveSidebarTab] = useState('Activity');
//     const [notResponding, setNotResponding] = useState(false);

//     // Forms State
//     const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
//     const [editingTask, setEditingTask] = useState(null);
//     const [isEventFormOpen, setIsEventFormOpen] = useState(false);
//     const [editingEvent, setEditingEvent] = useState(null);
//     const [isCallLogFormOpen, setIsCallLogFormOpen] = useState(false);
//     const [editingCallLog, setEditingCallLog] = useState(null);
//     const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);

//     const fetchData = useCallback(async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const token = localStorage.getItem('token');
//             const headers = { "Authorization": `Bearer ${token}` };

//             const [leadRes, stagesRes, leadsListRes] = await Promise.all([
//                 axios.get(`${API_URL}/crm/leads/${leadId}`, { headers }),
//                 axios.get(`${API_URL}/crm/lead-stages`, { headers }),
//                 axios.get(`${API_URL}/crm/leads?size=10&sort=updatedAt,desc`, { headers }) // Mocking "Recently Viewed" with recent updates
//             ]);

//             setLead(leadRes.data);
//             setLeadStages(Array.isArray(stagesRes.data) ? stagesRes.data : []);
//             setRecentLeads(leadsListRes.data.content || []);

//         } catch (err) {
//             setError('Failed to fetch lead details.');
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     }, [leadId]);

//     useEffect(() => {
//         if (leadId) fetchData();
//     }, [fetchData, leadId]);

//     // Stage Update Logic
//     const handleStageUpdate = async (stage) => {
//         if (!lead || !stage) return;
//         try {
//             const token = localStorage.getItem('token');
//             const headers = { "Authorization": `Bearer ${token}` };
//             await axios.put(`${API_URL}/crm/leads/${leadId}/stage`, { stageId: stage.id }, { headers });
//             await fetchData();
//         } catch (err) {
//             alert(`Error: ${err.response?.data?.message || 'Failed to update lead stage.'}`);
//         }
//     };

//     const handleActionSave = async (url, method, data, modalSetter) => {
//         try {
//             const token = localStorage.getItem('token');
//             await axios[method](url, data, { headers: { "Authorization": `Bearer ${token}` } });
//             modalSetter(false);
//         } catch (err) {
//             alert(`Error: ${err.response?.data?.message || 'Failed to save.'}`);
//         }
//     };

//     // Handlers
//     const handleNextStage = () => {
//         const sorted = [...leadStages].sort((a, b) => a.sortOrder - b.sortOrder);
//         const idx = sorted.findIndex(s => s.name === lead.currentStageName);
//         if (idx < sorted.length - 1) handleStageUpdate(sorted[idx + 1]);
//     };

//     const handlePrevStage = () => {
//         const sorted = [...leadStages].sort((a, b) => a.sortOrder - b.sortOrder);
//         const idx = sorted.findIndex(s => s.name === lead.currentStageName);
//         if (idx > 0) handleStageUpdate(sorted[idx - 1]);
//     };

//     const handleStatusChange = async (status) => {
//         // Implement status change logic API call if specific endpoint exists, or update lead
//         // trying generic update for now
//         try {
//             const token = localStorage.getItem('token');
//             const headers = { "Authorization": `Bearer ${token}` };
//             await axios.put(`${API_URL}/crm/leads/${leadId}`, { ...lead, status }, { headers });
//             await fetchData();
//         } catch (err) {
//             alert('Failed to update status');
//         }
//     };

//     // --- Action Handlers (Restored) ---
//     const handleOpenNewTask = () => { setEditingTask(null); setIsTaskFormOpen(true); };
//     const handleEditTask = (task) => { setEditingTask(task); setIsTaskFormOpen(true); };

//     const handleOpenNewEvent = () => { setEditingEvent(null); setIsEventFormOpen(true); };
//     const handleEditEvent = (event) => { setEditingEvent(event); setIsEventFormOpen(true); };

//     const handleOpenLogCall = () => { setEditingCallLog(null); setIsCallLogFormOpen(true); };
//     const handleEditCallLog = (log) => { setEditingCallLog(log); setIsCallLogFormOpen(true); };

//     const handleOpenEmailForm = () => { setIsEmailFormOpen(true); };


//     if (loading) return <div className="flex justify-center items-center h-full"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
//     if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
//     if (!lead) return <div className="text-center p-4">Lead not found.</div>;

//     const initials = `${lead.firstName ? lead.firstName.charAt(0) : ''}${lead.lastName ? lead.lastName.charAt(0) : ''}`;
//     const sortedStages = [...leadStages].sort((a, b) => a.sortOrder - b.sortOrder);
//     const currentStageIndex = sortedStages.findIndex(s => s.name === lead.currentStageName);

//     return (
//         <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
//             {/* 1. Top Header Info Card */}
//             <div className="bg-white border-b border-slate-200">
//                 <div className="px-6 py-4">
//                     <div className="flex justify-between items-start">
//                         <div className="flex items-start gap-4">
//                             <div className="h-12 w-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
//                                 {initials}
//                             </div>
//                             <div className="h-12 w-12 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-sm -ml-6 z-10 border-2 border-white">
//                                 {lead.firstName?.[0]}
//                             </div>

//                             <div>
//                                 <div className="flex items-center gap-2">
//                                     <h1 className="text-xl font-bold text-slate-800">{lead.firstName} {lead.lastName} <ChevronDown className="inline h-4 w-4 text-slate-400" /></h1>
//                                     <span className="text-slate-400 text-sm">@ {lead.leadNo}</span>
//                                 </div>
//                                 <div className="flex flex-wrap items-center gap-6 mt-2 text-sm text-slate-600">
//                                     <div className="flex items-center gap-2">
//                                         <Building size={16} className="text-slate-400" />
//                                         <span>{lead.companyName || 'No Company'}</span>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <Briefcase size={16} className="text-slate-400" />
//                                         <span>{lead.industryName || 'No Industry'}</span>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <Globe size={16} className="text-slate-400" />
//                                         <span>{lead.website ? <a href={lead.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{lead.website}</a> : 'No Website'}</span>
//                                     </div>
//                                 </div>

//                                 <div className="flex flex-wrap items-center gap-6 mt-2 text-sm text-slate-600">
//                                     <div className="flex items-center gap-2">
//                                         <MapPin size={16} className="text-slate-400" />
//                                         <span>{lead.locationName || 'N/A'}</span>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <Filter size={16} className="text-slate-400" />
//                                         <span className="capitalize">{lead.status}</span>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <Tag size={16} className="text-slate-400" />
//                                         <span>{lead.leadSourceId ? 'Source ID: ' + lead.leadSourceId : 'No Source'}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="flex flex-col items-end gap-2 text-sm">
//                             <div className="flex items-center gap-4">
//                                 <span className="flex items-center gap-2 text-slate-600"><Phone size={14} /> {lead.phone}</span>
//                                 <span className="flex items-center gap-2 text-slate-600"><Mail size={14} /> {lead.email}</span>
//                             </div>
//                             <div className="flex gap-2 mt-2">
//                                 <button className="p-1.5 border border-teal-500 text-teal-500 rounded hover:bg-teal-50"><Activity size={16} /></button>
//                                 <button className="p-1.5 border border-teal-500 text-teal-500 rounded hover:bg-teal-50"><User size={16} /></button>
//                                 <button className="p-1.5 border border-teal-500 text-teal-500 rounded hover:bg-teal-50"><Edit size={16} /></button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Info Bar */}
//                 <div className="bg-slate-50 px-6 py-2 border-t border-slate-200 flex flex-wrap gap-8 text-xs text-slate-500">
//                     <div>
//                         <span className="block text-slate-400 mb-0.5">Owner</span>
//                         <span className="font-medium text-slate-700">{lead.ownerName || 'Unassigned'}</span>
//                         <User className="inline h-3 w-3 ml-1 text-slate-400" />
//                     </div>
//                     <div>
//                         <span className="block text-slate-400 mb-0.5">Created By</span>
//                         <span className="font-medium text-slate-700">Admin, {new Date(lead.createdAt).toLocaleString()}</span>
//                     </div>
//                     <div>
//                         <span className="block text-slate-400 mb-0.5">Last Modified By</span>
//                         <span className="font-medium text-slate-700">Admin, {new Date(lead.updatedAt).toLocaleString()}</span>
//                     </div>
//                 </div>
//             </div>

//             <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">

//                 {/* Main Content Area (Left 3 Columns) */}
//                 <div className="lg:col-span-3 space-y-6">

//                     {/* 2. Chevron Stage Bar */}
//                     <div className="bg-white p-1 rounded shadow-sm border border-slate-200 overflow-x-auto">
//                         <div className="flex min-w-max">
//                             {sortedStages.map((stage, index) => {
//                                 const isCompleted = index < currentStageIndex;
//                                 const isCurrent = index === currentStageIndex;
//                                 const isUpcoming = index > currentStageIndex;

//                                 let bgClass = "bg-slate-100 text-slate-500";
//                                 if (isCompleted) bgClass = "bg-teal-500 text-white";
//                                 if (isCurrent) bgClass = "bg-teal-600 text-white"; // Darker teal for current

//                                 return (
//                                     <div
//                                         key={stage.id}
//                                         onClick={() => handleStageUpdate(stage)}
//                                         className={`relative flex items-center justify-center px-8 py-3 text-sm font-medium cursor-pointer transition-colors ${bgClass}`}
//                                         style={{
//                                             clipPath: "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)",
//                                             marginLeft: index === 0 ? "0" : "-20px",
//                                             paddingLeft: index === 0 ? "2rem" : "2.5rem",
//                                             zIndex: 100 - index
//                                         }}
//                                     >
//                                         {stage.name} {isCurrent && <CheckCircle size={14} className="ml-2" />}
//                                     </div>
//                                 )
//                             })}
//                         </div>
//                     </div>


//                     {/* 3. Status Action Bar */}
//                     <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//                         <div className="flex items-center gap-2">
//                             <span className="font-semibold text-slate-700">Status : {lead.status}</span>
//                         </div>
//                         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
//                             <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer mr-4 whitespace-nowrap">
//                                 <input type="checkbox" checked={notResponding} onChange={(e) => setNotResponding(e.target.checked)} className="rounded border-slate-300" />
//                                 Not Responding
//                             </label>
//                             <button onClick={handlePrevStage} className="px-4 py-1.5 bg-teal-500 text-white rounded text-sm font-medium hover:bg-teal-600 whitespace-nowrap flex items-center gap-1">
//                                 <ArrowLeft size={14} /> Back
//                             </button>
//                             <button onClick={() => handleStatusChange('LOST')} className="px-4 py-1.5 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 whitespace-nowrap">
//                                 Lost
//                             </button>
//                             <button onClick={() => handleStatusChange('CONVERTED')} className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 whitespace-nowrap">
//                                 Completed
//                             </button>
//                             <button onClick={handleNextStage} className="px-4 py-1.5 bg-slate-800 text-white rounded text-sm font-medium hover:bg-slate-900 whitespace-nowrap flex items-center gap-1">
//                                 Next <ArrowRight size={14} />
//                             </button>
//                         </div>
//                     </div>

//                     {/* 4. Action Toolbar */}
//                     <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
//                         <div className="flex items-center gap-3">
//                             <button
//                                 onClick={handleOpenNewTask}
//                                 className="flex items-center gap-2 px-4 py-2 bg-white border border-green-500 text-green-600 rounded-md text-sm font-semibold hover:bg-green-50 transition-colors"
//                             >
//                                 <CheckSquare className="h-4 w-4" /> New Task
//                             </button>
//                             <button
//                                 onClick={() => { setEditingEvent(null); setIsEventFormOpen(true); }}
//                                 className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-500 text-blue-600 rounded-md text-sm font-semibold hover:bg-blue-50 transition-colors"
//                             >
//                                 <Calendar className="h-4 w-4" /> New Event
//                             </button>
//                             <button className="p-2 border border-slate-200 rounded text-slate-400 hover:text-slate-600">...</button>
//                             <button
//                                 onClick={() => { setEditingCallLog(null); setIsCallLogFormOpen(true); }}
//                                 className="flex items-center gap-2 px-4 py-2 bg-white border border-teal-500 text-teal-600 rounded-md text-sm font-semibold hover:bg-teal-50 transition-colors"
//                             >
//                                 <Phone className="h-4 w-4" /> Call a Log
//                             </button>
//                             <button className="p-2 border border-slate-200 rounded text-slate-400 hover:text-slate-600">...</button>
//                             <button
//                                 onClick={() => setIsEmailFormOpen(true)}
//                                 className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-500 text-orange-600 rounded-md text-sm font-semibold hover:bg-orange-50 transition-colors"
//                             >
//                                 <Mail className="h-4 w-4" /> Email
//                             </button>

//                             {/* Dynamic MoveTo Button */}
//                             {sortedStages[currentStageIndex]?.moveTo === 'QUOTATION' && (
//                                 <button
//                                     onClick={() => navigate('/sales-dashboard/quotations/new', { state: { lead } })}
//                                     className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm ml-2"
//                                 >
//                                     <FileText className="h-4 w-4" /> Create Quotation
//                                 </button>
//                             )}
//                             {sortedStages[currentStageIndex]?.moveTo === 'SALES_ORDER' && (
//                                 <button
//                                     onClick={() => navigate('/sales-dashboard/orders/new', { state: { lead } })}
//                                     className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm ml-2"
//                                 >
//                                     <ShoppingCart className="h-4 w-4" /> Create Sales Order
//                                 </button>
//                             )}
//                             {sortedStages[currentStageIndex]?.moveTo === 'INVOICE' && (
//                                 <button
//                                     onClick={() => navigate('/sales-dashboard/invoices/new', { state: { lead } })}
//                                     className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm ml-2"
//                                 >
//                                     <Receipt className="h-4 w-4" /> Create Invoice
//                                 </button>
//                             )}

//                             <button className="p-2 border border-slate-200 rounded text-slate-400 hover:text-slate-600">...</button>
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <div className="flex items-center gap-2 bg-slate-100 rounded-full px-1 py-1">
//                                 <div className="w-8 h-4 bg-slate-300 rounded-full relative cursor-pointer">
//                                     <div className="absolute right-0.5 top-0.5 h-3 w-3 bg-white rounded-full shadow-sm"></div>
//                                 </div>
//                             </div>
//                             <button className="p-2 rounded-full bg-[#0B213F] text-white hover:bg-[#0B213F]/90"><Filter size={16} /></button>
//                         </div>
//                     </div>

//                     {/* 5. Event Details / Tabs */}
//                     <div className="bg-white rounded-lg shadow-sm border border-slate-200 min-h-[500px]">
//                         <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
//                             <h4 className="font-semibold text-slate-700">Event Details</h4>
//                         </div>
//                         <div className="flex border-b border-slate-200">
//                             <button
//                                 onClick={() => setActiveSidebarTab('Call Logs')}
//                                 className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeSidebarTab === 'Call Logs' ? 'border-teal-500 text-teal-600 bg-teal-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
//                             >
//                                 Calls ({lead.callLogs?.length || 0})
//                             </button>
//                             <button
//                                 onClick={() => setActiveSidebarTab('Events')}
//                                 className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeSidebarTab === 'Events' ? 'border-teal-500 text-teal-600 bg-teal-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
//                             >
//                                 Upcoming
//                             </button>
//                             <button
//                                 onClick={() => setActiveSidebarTab('Activity')}
//                                 className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeSidebarTab === 'Activity' ? 'border-teal-500 text-teal-600 bg-teal-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
//                             >
//                                 Overdue
//                             </button>
//                             <button
//                                 onClick={() => setActiveSidebarTab('Completed')}
//                                 className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeSidebarTab === 'Completed' ? 'border-teal-500 text-teal-600 bg-teal-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
//                             >
//                                 Completed
//                             </button>
//                         </div>

//                         <div className="p-4">
//                             {activeSidebarTab === 'Call Logs' && <CallLogsTab leadId={leadId} onAddCallLog={() => setIsCallLogFormOpen(true)} onEditCallLog={setEditingCallLog} />}
//                             {activeSidebarTab === 'Events' && <EventsTab leadId={leadId} onAddEvent={() => setIsEventFormOpen(true)} onEditEvent={setEditingEvent} />}
//                             {(activeSidebarTab === 'Activity' || activeSidebarTab === 'Completed') && (
//                                 <div className="text-center py-10 text-slate-400">
//                                     <p>No activities to show.</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                 </div>

//                 {/* Right Sidebar (Recently Viewed) */}
//                 <div className="lg:col-span-1 space-y-4">
//                     {/* Recently Viewed */}
//                     <div className="bg-slate-100 rounded-lg p-4">
//                         <h3 className="font-semibold text-slate-800 mb-4 text-sm">Recently-Viewed Leads 10</h3>
//                         <div className="space-y-3">
//                             {recentLeads.slice(0, 5).map(rLead => (
//                                 <div key={rLead.id} onClick={() => navigate(`/crm-dashboard/leads/${rLead.id}`)} className="flex items-start gap-3 cursor-pointer group hover:bg-white p-2 rounded transition-colors">
//                                     <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
//                                         {rLead.firstName?.[0]}{rLead.lastName?.[0]}
//                                     </div>
//                                     <div className="overflow-hidden">
//                                         <h4 className="font-medium text-sm text-green-600 group-hover:underline truncate">{rLead.firstName} {rLead.lastName}</h4>
//                                         <p className="text-xs text-slate-500 truncate">{rLead.companyName}</p>
//                                         <p className="text-xs text-slate-400 truncate flex items-center gap-1"><Phone size={10} /> {rLead.phone}</p>
//                                     </div>
//                                 </div>
//                             ))}
//                             {recentLeads.length === 0 && <p className="text-xs text-slate-400">No recent leads.</p>}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Modals */}
//             <AnimatePresence>
//                 {isTaskFormOpen && (
//                     <LeadFullDetailsModal isOpen={isTaskFormOpen} onClose={() => setIsTaskFormOpen(false)} title={editingTask ? "Edit Task" : "New Task"}>
//                         <CrmTaskForm item={editingTask} onSave={async (data) => {
//                             const method = data.id ? 'put' : 'post';
//                             const url = data.id ? `${API_URL}/crm/tasks/${data.id}` : `${API_URL}/crm/tasks`;
//                             handleActionSave(url, method, { ...data, leadId: parseInt(leadId) }, setIsTaskFormOpen);
//                         }} onCancel={() => setIsTaskFormOpen(false)} loading={formSubmitting} />
//                     </LeadFullDetailsModal>
//                 )}
//                 {isEventFormOpen && (
//                     <LeadFullDetailsModal isOpen={isEventFormOpen} onClose={() => setIsEventFormOpen(false)} title={editingEvent ? "Edit Event" : "New Event"}>
//                         <CrmEventForm item={editingEvent} onSave={async (data) => {
//                             const method = data.id ? 'put' : 'post';
//                             const url = data.id ? `${API_URL}/crm/events/${data.id}` : `${API_URL}/crm/events`;
//                             handleActionSave(url, method, { ...data, leadId: parseInt(leadId) }, setIsEventFormOpen);
//                         }} onCancel={() => setIsEventFormOpen(false)} loading={formSubmitting} />
//                     </LeadFullDetailsModal>
//                 )}
//                 {isCallLogFormOpen && (
//                     <LeadFullDetailsModal isOpen={isCallLogFormOpen} onClose={() => setIsCallLogFormOpen(false)} title={editingCallLog ? "Edit Call Log" : "Log a Call"}>
//                         <CrmCallLogForm item={editingCallLog} onSave={async (data) => {
//                             const method = data.id ? 'put' : 'post';
//                             const url = data.id ? `${API_URL}/crm/call-logs/${data.id}` : `${API_URL}/crm/call-logs`;
//                             handleActionSave(url, method, { ...data, leadId: parseInt(leadId) }, setIsCallLogFormOpen);
//                         }} onCancel={() => setIsCallLogFormOpen(false)} loading={formSubmitting} />
//                     </LeadFullDetailsModal>
//                 )}
//                 {isEmailFormOpen && (
//                     <LeadFullDetailsModal isOpen={isEmailFormOpen} onClose={() => setIsEmailFormOpen(false)} title="Compose Email">
//                         <CrmEmailForm onSave={async (data) => {
//                             handleActionSave(`${API_URL}/crm/emails`, 'post', { ...data, leadId: parseInt(leadId) }, setIsEmailFormOpen);
//                         }} onCancel={() => setIsEmailFormOpen(false)} loading={formSubmitting} />
//                     </LeadFullDetailsModal>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// };


// // --- Main Switcher Component ---
// const LeadInfo = () => {
//     const { leadId } = useParams();
//     // If leadId is present, we are in Detail mode. Otherwise, we are in List mode.
//     if (leadId) {
//         return <LeadDetailView leadId={leadId} />;
//     } else {
//         return <LeadListTable />;
//     }
// };

// export default LeadInfo;


import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Users, Edit, Loader, Building, Briefcase, Globe, MapPin, Tag, User, Calendar, StickyNote, Activity, CheckSquare, LayoutGrid, ListFilter, ArrowRight, ArrowLeftCircle, XCircle, CheckCircle, Phone, Mail, Paperclip } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeadFullDetailsModal from '../components/LeadFullDetailsModal'; // New modal for full details
import { AnimatePresence, motion } from 'framer-motion';
import CrmTaskForm from '../components/CrmTaskForm';
import CrmEventForm from '../components/CrmEventForm';
import CrmCallLogForm from '../components/CrmCallLogForm'; // Import the new form
import CrmEmailForm from '../components/CrmEmailForm'; // Import the new email form
import EventsTab from '../components/EventsTab';
import TasksTab from '../components/TasksTab';
import CallLogsTab from '../components/CallLogsTab'; // Import the new tab
import EmailsTab from '../components/EmailsTab'; // Import the new email tab
import AttachmentsTab from '../components/AttachmentsTab';
import { useCrmPermissions } from '../context/CrmPermissionsContext';
const API_URL = import.meta.env.VITE_API_BASE_URL;
const InfoDisplay = ({ label, value, icon: Icon, colorClass = "text-primary bg-primary/10" }) => (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-theme shadow-sm hover:border-primary/30 hover:shadow-md transition-all group">
        <div className={`p-3 rounded-full ${colorClass} group-hover:scale-110 transition-transform`}>
            {Icon && <Icon className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-bold text-foreground truncate break-words">
                {value || <span className="text-foreground-muted/40 italic font-medium">Not Specified</span>}
            </p>
        </div>
    </div>
);

const Section = ({ title, children }) => (
    <div className="p-4 border border-border rounded-lg bg-background-muted">
        <h4 className="font-semibold mb-4 text-foreground-muted">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children}
        </div>
    </div>
);

const ContentTab = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
    >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
    </button>
);
const MetricCard = ({ icon: Icon, label, value, colorClass }) => (
    <div className="bg-card border border-border p-5 rounded-theme shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${colorClass} group-hover:scale-110 transition-transform`}>
                <Icon size={18} />
            </div>
            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-[0.2em]">Live Data</span>
        </div>
        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-foreground">{value}</h4>
    </div>
);

const ActivityFeed = ({ lead, stages, tasks = [], events = [], calls = [] }) => {
    const currentStageIndex = stages.findIndex(s => s.name === lead.currentStageName);
    const progress = ((currentStageIndex + 1) / stages.length) * 100;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Strategic Intelligence Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card border border-border p-8 rounded-theme shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">Current Standing</h3>
                            <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest opacity-60">Lead Progression Analysis</p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full uppercase tracking-widest">
                                {lead.currentStageName || 'Initial Stage'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-bold text-foreground-muted uppercase tracking-widest">
                            <span>Pipeline Maturity</span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"
                            />
                        </div>
                        <div className="flex justify-between pt-2">
                            {stages.slice(0, 5).map((s, i) => (
                                <div key={s.id} className={`flex flex-col items-center gap-1 ${i <= currentStageIndex ? 'opacity-100' : 'opacity-30'}`}>
                                    <div className={`w-2 h-2 rounded-full ${i <= currentStageIndex ? 'bg-primary' : 'bg-slate-300'}`}></div>
                                    <span className="text-[8px] font-bold uppercase tracking-tighter">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border p-8 rounded-theme shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Activity size={80} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-tight mb-6">Strategic Snapshot</h3>
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-blue-500/10 text-blue-500"><Building size={14} /></div>
                            <div>
                                <p className="text-[9px] font-bold text-foreground-muted uppercase tracking-widest">Corporate Entity</p>
                                <p className="text-xs font-bold text-foreground">{lead.companyName || 'Private Lead'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-purple-500/10 text-purple-500"><User size={14} /></div>
                            <div>
                                <p className="text-[9px] font-bold text-foreground-muted uppercase tracking-widest">Protocol Owner</p>
                                <p className="text-xs font-bold text-foreground">{lead.ownerName || 'Unassigned'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-orange-500/10 text-orange-500"><Tag size={14} /></div>
                            <div>
                                <p className="text-[9px] font-bold text-foreground-muted uppercase tracking-widest">Engagement Status</p>
                                <p className="text-xs font-bold text-foreground">{lead.status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Operational Health Grid */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-6 w-1 bg-accent rounded-full"></div>
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Operational Health</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MetricCard icon={CheckSquare} label="Pending Tasks" value={tasks.filter(t => t.status !== 'COMPLETED').length} colorClass="text-primary bg-primary/10" />
                    <MetricCard icon={Calendar} label="Scheduled Events" value={events.length} colorClass="text-accent bg-accent/10" />
                    <MetricCard icon={Phone} label="Call Interactions" value={calls.length} colorClass="text-blue-500 bg-blue-500/10" />
                    <MetricCard icon={Mail} label="Digital Outreach" value="0" colorClass="text-indigo-500 bg-indigo-500/10" />
                </div>
            </div>

            {/* Recent Engagement Intelligence */}
            <div className="bg-slate-50/50 border border-border p-8 rounded-theme">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-6 w-1 bg-success rounded-full"></div>
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Recent Intelligence</h3>
                </div>
                {tasks.length > 0 || events.length > 0 ? (
                    <div className="space-y-4">
                        {tasks.slice(0, 2).map(task => (
                            <div key={task.id} className="flex items-center gap-4 p-4 bg-white border border-border rounded-theme shadow-sm">
                                <div className="p-2 rounded bg-primary/10 text-primary"><CheckSquare size={16} /></div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-foreground uppercase tracking-tight">{task.subject}</p>
                                    <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest opacity-60">Due: {task.dueDate}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">{task.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 opacity-40">
                        <Activity size={30} className="mx-auto mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted">No Recent Activity Detected</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const LeadStages = ({ allStages, currentStageName, onStatusChange, onStageChange, lead, hasPermission }) => {
    const [notResponding, setNotResponding] = useState(false);
    const navigate = useNavigate();

    const sortedStages = [...allStages].sort((a, b) => a.sortOrder - b.sortOrder);
    const currentStageIndex = sortedStages.findIndex(stage => stage.name === currentStageName);
    const currentStage = sortedStages[currentStageIndex];

    const handleBack = () => {
        if (currentStageIndex > 0) {
            const previousStage = sortedStages[currentStageIndex - 1];
            onStageChange(previousStage);
        }
    };

    const handleNext = () => {
        if (notResponding) {
            onStatusChange('NOT_RESPONDING');
        } else if (currentStageIndex < sortedStages.length - 1) {
            const nextStage = sortedStages[currentStageIndex + 1];
            onStageChange(nextStage);
        }
    };

    const handleLost = () => onStatusChange('LOST');
    const handleCompleted = () => onStatusChange('ACTIVE');

    const handleCreateQuotation = () => {
        navigate('/sales/quotations/new', { state: { lead } });
    };

    const handleCreateSaleOrder = () => {
        navigate('/sales/orders/new', { state: { lead } });
    };

    return (
        <div className="p-8 bg-card rounded-theme shadow-sm border border-border space-y-10">
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-6 w-1 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Lead Progression Matrix</h3>
                </div>
                
                <div className="flex items-center justify-between w-full px-4">
                    {sortedStages.map((stage, index) => {
                        const isStageCompleted = stage.isCompleted;
                        const isActive = index === currentStageIndex;
                        return (
                            <React.Fragment key={stage.id}>
                                <div className="flex flex-col items-center text-center relative group">
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm
                                        ${isActive ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20' : 
                                          isStageCompleted ? 'bg-success border-success text-white shadow-lg shadow-success/10' : 
                                          'bg-background border-border text-foreground-muted opacity-60'}
                                    `}>
                                        {isStageCompleted ? <CheckCircle className="h-6 w-6" /> : <span className="text-sm font-bold">{index + 1}</span>}
                                    </div>
                                    <p className={`mt-3 text-[11px] font-bold uppercase tracking-wider absolute -bottom-8 whitespace-nowrap
                                        ${isActive ? 'text-primary' : isStageCompleted ? 'text-success' : 'text-foreground-muted'}
                                    `}>
                                        {stage.name}
                                    </p>
                                </div>
                                {index < sortedStages.length - 1 && (
                                    <div className="flex-1 h-1 mx-4 relative overflow-hidden bg-border rounded-full">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: isStageCompleted ? '100%' : '0%' }}
                                            className={`h-full ${isStageCompleted ? 'bg-success' : 'bg-primary/20'}`}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
                <div className="h-10"></div> {/* Spacer for absolute labels */}
            </div>

            {hasPermission && hasPermission('LEAD', 'update') && (
                <div className="pt-8 border-t border-border">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-6 w-1 bg-accent rounded-full"></div>
                        <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Strategic Actions</h3>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-slate-50/50 p-6 rounded-theme border border-border/50">
                        <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-foreground-muted uppercase tracking-widest group">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${notResponding ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}>
                                {notResponding && <CheckCircle size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" checked={notResponding} onChange={(e) => setNotResponding(e.target.checked)} className="hidden" />
                            Mark as "Not Responding"
                        </label>
                        <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">
                            {currentStage?.moveTo === 'Quotation' && (
                                <button onClick={handleCreateQuotation} className="bg-purple-600 text-white px-6 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 transition-all">
                                    Create Quotation <ArrowRight size={14} />
                                </button>
                            )}
                            {currentStage?.moveTo === 'Sale Order' && (
                                <button onClick={handleCreateSaleOrder} className="bg-orange-600 text-white px-6 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-105 transition-all">
                                    Create Sale Order <ArrowRight size={14} />
                                </button>
                            )}
                            <button onClick={handleBack} disabled={currentStageIndex <= 0} className="px-6 py-2.5 bg-white border border-border text-foreground-muted rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 disabled:opacity-30 transition-all">
                                <ArrowLeftCircle size={14} /> Back
                            </button>
                            <button onClick={handleNext} className="bg-primary text-primary-foreground px-8 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/25 hover:scale-105 transition-all">
                                Next Stage <ArrowRight size={14} />
                            </button>
                            <button onClick={handleLost} className="bg-error text-white px-6 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-error/20 hover:scale-105 transition-all">
                                <XCircle size={14} /> Lost Deal
                            </button>
                            <button onClick={handleCompleted} className="bg-success text-white px-6 py-2.5 rounded-theme font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-success/20 hover:scale-105 transition-all">
                                <CheckCircle size={14} /> Convert Lead
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ActionGrid = ({ onNewTaskClick, onNewEventClick, onLogCallClick, onEmailClick, hasPermission }) => {
    const actions = [];
    if (!hasPermission || hasPermission('TASK', 'create')) {
        actions.push({ label: 'New Task', icon: CheckSquare, onClick: onNewTaskClick });
    }
    if (!hasPermission || hasPermission('EVENT', 'create')) {
        actions.push({ label: 'New Event', icon: Calendar, onClick: onNewEventClick });
    }
    if (!hasPermission || hasPermission('CALL_LOG', 'create')) {
        actions.push({ label: 'Log a Call', icon: Phone, onClick: onLogCallClick });
    }
    if (!hasPermission || hasPermission('EMAIL', 'sendEmail')) {
        actions.push({ label: 'Email', icon: Mail, onClick: onEmailClick });
    }

    // Handle case where onClick might be undefined
    const handleActionClick = (action) => {
        if (action.onClick) action.onClick();
        else alert(`${action.label} functionality not implemented yet.`);
    };

    return (
        <div className="p-8 border-t border-border bg-slate-50/30">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-success rounded-full"></div>
                <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Quick Operational Actions</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {actions.map(action => (
                    <button 
                        key={action.label} 
                        onClick={action.onClick} 
                        className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-theme hover:bg-slate-50 hover:border-primary/30 hover:shadow-lg transition-all gap-4 group"
                    >
                        <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <action.icon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-foreground uppercase tracking-widest">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const LeadDetailsGrid = ({ lead }) => (
    <div className="p-8 space-y-10">
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-primary rounded-full"></div>
                <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Core Intelligence</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoDisplay icon={User} label="Full Name" value={`${lead.firstName} ${lead.lastName}`} colorClass="text-blue-500 bg-blue-500/10" />
                <InfoDisplay icon={Tag} label="Status" value={lead.status} colorClass="text-emerald-500 bg-emerald-500/10" />
                <InfoDisplay icon={User} label="Lead Owner" value={lead.ownerName} colorClass="text-purple-500 bg-purple-500/10" />
            </div>
        </div>

        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-accent rounded-full"></div>
                <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Institutional Context</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoDisplay icon={Building} label="Company Name" value={lead.companyName} colorClass="text-orange-500 bg-orange-500/10" />
                <InfoDisplay icon={Briefcase} label="Target Industry" value={lead.industryName} colorClass="text-indigo-500 bg-indigo-500/10" />
                <InfoDisplay icon={Globe} label="Digital Presence" value={lead.website} colorClass="text-cyan-500 bg-cyan-500/10" />
                <InfoDisplay icon={MapPin} label="Geographic Sector" value={lead.locationName} colorClass="text-red-500 bg-red-500/10" />
            </div>
        </div>

        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-slate-400 rounded-full"></div>
                <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Temporal Tracking</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoDisplay icon={Calendar} label="Capture Date" value={lead.createdAt ? new Date(lead.createdAt).toLocaleString() : null} colorClass="text-slate-500 bg-slate-500/10" />
                <InfoDisplay icon={Activity} label="Last Modification" value={lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : null} colorClass="text-slate-500 bg-slate-500/10" />
            </div>
        </div>
    </div>
);

const LeadInfo = () => {
    const { hasPermission } = useCrmPermissions();
    const { leadId } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [leadStages, setLeadStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
    const [isFullDetailsModalOpen, setIsFullDetailsModalOpen] = useState(false);
    const [activeSidebarTab, setActiveSidebarTab] = useState('Activity');
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [isEventFormOpen, setIsEventFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [isCallLogFormOpen, setIsCallLogFormOpen] = useState(false);
    const [editingCallLog, setEditingCallLog] = useState(null);
    const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [calls, setCalls] = useState([]);

    const fetchData = useCallback(async () => {
        if (!leadId) {
            setError('No lead ID provided.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            // Fetch lead details and lead stages
            const [leadRes, stagesRes, tasksRes, eventsRes, callsRes] = await Promise.all([
                axios.get(`${API_URL}/crm/leads/${leadId}`, { headers }),
                axios.get(`${API_URL}/crm/lead-stages`, { headers }),
                axios.get(`${API_URL}/crm/tasks/lead/${leadId}`, { headers }),
                axios.get(`${API_URL}/crm/events/lead/${leadId}`, { headers }),
                axios.get(`${API_URL}/crm/call-logs/by-lead/${leadId}`, { headers })
            ]);

            setLead(leadRes.data);
            setTasks(tasksRes.data);
            setEvents(eventsRes.data);
            setCalls(callsRes.data);

            if (Array.isArray(stagesRes.data)) {
                setLeadStages(stagesRes.data);
            } else {
                console.warn("Lead stages data is not an array:", stagesRes.data);
                setLeadStages([]);
            }
        } catch (err) {
            setError('Failed to fetch lead intelligence.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStageUpdate = async (newStage) => {
        if (!lead || !newStage) return;
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            // Update the lead's currentStage to the new stage ID
            await axios.put(`${API_URL}/crm/leads/${leadId}/stage`, { stageId: newStage.id }, { headers });

            // Refresh all data to reflect the change
            await fetchData();
        } catch (err) {
            console.error("Failed to update lead stage:", err);
            alert(`Error: ${err.response?.data?.message || 'Failed to update lead stage.'}`);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!lead) return;
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            await axios.put(`${API_URL}/crm/leads/${leadId}/status`, { status: newStatus }, { headers });
            await fetchData();
        } catch (err) {
            console.error("Failed to update lead status:", err);
            alert(`Error: ${err.response?.data?.message || 'Failed to update lead status.'}`);
        }
    };

    const handleOpenNewTask = () => {
        setEditingTask(null);
        setIsTaskFormOpen(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setIsTaskFormOpen(true);
    };

    const handleSaveTask = async (taskData) => {
        setFormSubmitting(true);
        const isUpdating = Boolean(editingTask?.id);
        const url = isUpdating ? `${API_URL}/crm/tasks/${editingTask.id}` : `${API_URL}/crm/tasks`;
        const method = isUpdating ? 'put' : 'post';

        try {
            const token = localStorage.getItem('token');
            await axios[method](url, taskData, { headers: { "Authorization": `Bearer ${token}` } });
            setIsTaskFormOpen(false);
            // Optionally, force a refresh of the tasks tab if it's active
            // For now, TasksTab refetches on its own when leadId changes, which is sufficient
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save task.'}`);
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleOpenNewEvent = () => {
        setEditingEvent(null);
        setIsEventFormOpen(true);
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setIsEventFormOpen(true);
    };

    const handleSaveEvent = async (eventData) => {
        setFormSubmitting(true);
        const isUpdating = Boolean(editingEvent?.id);
        const url = isUpdating ? `${API_URL}/crm/events/${editingEvent.id}` : `${API_URL}/crm/events`;
        const method = isUpdating ? 'put' : 'post';

        try {
            const token = localStorage.getItem('token');
            await axios[method](url, eventData, { headers: { "Authorization": `Bearer ${token}` } });
            setIsEventFormOpen(false);
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save event.'}`);
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleOpenLogCall = () => {
        setEditingCallLog(null);
        setIsCallLogFormOpen(true);
    };

    const handleEditCallLog = (log) => {
        setEditingCallLog(log);
        setIsCallLogFormOpen(true);
    };

    const handleSaveCallLog = async (logData) => {
        setFormSubmitting(true);
        const isUpdating = Boolean(editingCallLog?.id);
        const url = isUpdating ? `${API_URL}/crm/call-logs/${editingCallLog.id}` : `${API_URL}/crm/call-logs`;
        const method = isUpdating ? 'put' : 'post';

        try {
            const token = localStorage.getItem('token');
            await axios[method](url, logData, { headers: { "Authorization": `Bearer ${token}` } });
            setIsCallLogFormOpen(false);
            // The CallLogsTab will refetch data automatically when it's rendered again.
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save call log.'}`);
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleOpenEmailForm = () => {
        setIsEmailFormOpen(true);
    };

    const handleSendEmail = async (emailData) => {
        setFormSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/crm/emails/send`, emailData, { headers: { "Authorization": `Bearer ${token}` } });
            setIsEmailFormOpen(false);
            // The EmailsTab will refetch its data automatically when it becomes active again.
            alert("Email sent successfully!");
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to send email. Check SMTP settings.'}`);
        } finally {
            setFormSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error}</div>;
    }

    if (!lead) {
        return <div className="text-center p-4">Lead not found.</div>;
    }

    const initials = `${lead.firstName ? lead.firstName.charAt(0) : ''}${lead.lastName ? lead.lastName.charAt(0) : ''}`;

    return (
        <div className="bg-background text-foreground flex flex-col h-full">
            {/* Header */}
            <header className={`bg-card text-card-foreground border-b border-border flex-shrink-0 transition-all duration-300 ${isHeaderExpanded ? 'h-auto' : 'h-24'}`}>
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">                        <button onClick={() => navigate('/crm-dashboard/leads/all')} className="p-1.5 rounded-full hover:bg-background-muted">
                        <ArrowLeft className="h-5 w-5 text-foreground" />
                    </button>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                                {initials}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">{lead.firstName} {lead.lastName}</h2>
                                <p className="text-sm text-foreground-muted">Lead No: {lead.leadNo || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col text-sm text-right">
                            <p className="text-foreground-muted">Phone: {lead.phone || 'N/A'}</p>
                            <p className="text-foreground-muted">Email: {lead.email || 'N/A'}</p>
                        </div>
                        <button onClick={() => setIsFullDetailsModalOpen(true)} className="btn-secondary p-2" title="View All Details">
                            <Users className="h-5 w-5" />
                        </button>
                        {hasPermission('LEAD', 'update') && (
                            <button onClick={() => alert('Edit functionality to be implemented here.')} className="btn-secondary p-2" title="Edit Lead">
                                <Edit className="h-5 w-5" />
                            </button>
                        )}
                        <button onClick={() => setIsHeaderExpanded(!isHeaderExpanded)} className="btn-secondary p-2" title={isHeaderExpanded ? 'Collapse Details' : 'Expand Details'}>
                            {isHeaderExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {isHeaderExpanded && (
                    <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <InfoDisplay icon={Building} label="Company" value={lead.companyName} />
                        <InfoDisplay icon={Briefcase} label="Industry" value={lead.industryName} />
                        <InfoDisplay icon={Globe} label="Website" value={lead.website} />
                        <InfoDisplay icon={MapPin} label="Location" value={lead.locationName} />
                        <InfoDisplay icon={Tag} label="Status" value={lead.status} />
                        <InfoDisplay icon={User} label="Owner" value={lead.ownerName} />
                        <InfoDisplay icon={Calendar} label="Created At" value={lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'N/A'} />
                        <InfoDisplay icon={Calendar} label="Last Updated At" value={lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : 'N/A'} />
                        {lead.notes && <InfoDisplay icon={StickyNote} label="Notes" value={lead.notes} />}
                    </div>
                )}
            </header>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-border flex-shrink-0">
                    <nav className="flex items-center space-x-2 px-4">
                        <ContentTab icon={Activity} label="Activity" isActive={activeSidebarTab === 'Activity'} onClick={() => setActiveSidebarTab('Activity')} />
                        <ContentTab icon={ListFilter} label="Lead Stages" isActive={activeSidebarTab === 'Lead Stages'} onClick={() => setActiveSidebarTab('Lead Stages')} />
                        <ContentTab icon={LayoutGrid} label="Details Grid" isActive={activeSidebarTab === 'Details Grid'} onClick={() => setActiveSidebarTab('Details Grid')} />
                        {hasPermission('TASK', 'view') && (
                            <ContentTab icon={CheckSquare} label="Tasks" isActive={activeSidebarTab === 'Tasks'} onClick={() => setActiveSidebarTab('Tasks')} />
                        )}
                        {hasPermission('EVENT', 'view') && (
                            <ContentTab icon={Calendar} label="Events" isActive={activeSidebarTab === 'Events'} onClick={() => setActiveSidebarTab('Events')} />
                        )}
                        {hasPermission('CALL_LOG', 'view') && (
                            <ContentTab icon={Phone} label="Call Logs" isActive={activeSidebarTab === 'Call Logs'} onClick={() => setActiveSidebarTab('Call Logs')} />
                        )}
                        {hasPermission('EMAIL', 'view') && (
                            <ContentTab icon={Mail} label="Emails" isActive={activeSidebarTab === 'Emails'} onClick={() => setActiveSidebarTab('Emails')} />
                        )}
                        {hasPermission('ATTACHMENT', 'view') && (
                            <ContentTab icon={Paperclip} label="Attachments" isActive={activeSidebarTab === 'Attachments'} onClick={() => setActiveSidebarTab('Attachments')} />
                        )}
                        <ContentTab icon={StickyNote} label="Notes" isActive={activeSidebarTab === 'Notes'} onClick={() => setActiveSidebarTab('Notes')} />
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeSidebarTab === 'Activity' && <ActivityFeed lead={lead} stages={leadStages} tasks={tasks} events={events} calls={calls} />}
                    {activeSidebarTab === 'Lead Stages' && (
                        <div>
                            <LeadStages allStages={leadStages} currentStageName={lead.currentStageName} onStatusChange={handleStatusUpdate} onStageChange={handleStageUpdate} lead={lead} hasPermission={hasPermission} />
                            <ActionGrid onNewTaskClick={handleOpenNewTask} onNewEventClick={handleOpenNewEvent} onLogCallClick={handleOpenLogCall} onEmailClick={handleOpenEmailForm} hasPermission={hasPermission} />
                        </div>
                    )}
                    {activeSidebarTab === 'Details Grid' && <LeadDetailsGrid lead={lead} />}
                    {activeSidebarTab === 'Tasks' && <TasksTab leadId={leadId} onAddTask={handleOpenNewTask} onEditTask={handleEditTask} />}
                    {activeSidebarTab === 'Events' && <EventsTab leadId={leadId} onAddEvent={handleOpenNewEvent} onEditEvent={handleEditEvent} />}
                    {activeSidebarTab === 'Call Logs' && <CallLogsTab leadId={leadId} onAddCallLog={handleOpenLogCall} onEditCallLog={handleEditCallLog} />}
                    {activeSidebarTab === 'Emails' && <EmailsTab leadId={leadId} onComposeEmail={handleOpenEmailForm} />}
                    {activeSidebarTab === 'Attachments' && <AttachmentsTab leadId={leadId} />}
                    {activeSidebarTab === 'Notes' && (
                        <div className="p-8 animate-in fade-in duration-500">
                            <div className="bg-card border border-border p-8 rounded-theme shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                                            <StickyNote className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">Lead Intelligence</h3>
                                            <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest opacity-60">Strategic observations and internal notes</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => alert('Edit functionality to be implemented in the lead edit form.')}
                                        className="flex items-center gap-2 px-4 py-2 bg-background-muted border border-border text-foreground-muted hover:text-primary hover:border-primary/30 text-[10px] font-bold uppercase tracking-widest rounded-theme transition-all shadow-sm"
                                    >
                                        <Edit size={14} /> Update Notes
                                    </button>
                                </div>
                                
                                <div className="bg-background-muted/30 p-8 rounded-theme border border-border/50 min-h-[300px] relative">
                                    {lead.notes ? (
                                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium relative z-10">
                                            {lead.notes}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-20 opacity-30">
                                            <StickyNote size={60} className="mb-4 text-foreground-muted" />
                                            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground-muted">No Intelligence Captured</h4>
                                            <p className="text-[10px] uppercase tracking-widest mt-2">Initialize strategic notes to track lead progress</p>
                                        </div>
                                    )}
                                    {/* Decorative background element */}
                                    <div className="absolute bottom-4 right-4 opacity-[0.03] select-none pointer-events-none">
                                        <StickyNote size={120} />
                                    </div>
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-foreground-muted">
                                        <Calendar size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Last Modified: {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">A</div>
                                            <div className="w-8 h-8 rounded-full border-2 border-card bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">S</div>
                                        </div>
                                        <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Shared Intelligence</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full Details Modal */}
            <LeadFullDetailsModal
                isOpen={isFullDetailsModalOpen}
                onClose={() => setIsFullDetailsModalOpen(false)}
                lead={lead}
            />

            {/* Task Form Sidebar */}
            <AnimatePresence>
                {isTaskFormOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsTaskFormOpen(false)} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-lg bg-card text-card-foreground shadow-lg z-50"
                        >
                            <CrmTaskForm item={editingTask} onSave={handleSaveTask} onCancel={() => setIsTaskFormOpen(false)} loading={formSubmitting} leadId={leadId} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Event Form Sidebar */}
            <AnimatePresence>
                {isEventFormOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsEventFormOpen(false)} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-lg bg-card text-card-foreground shadow-lg z-50"
                        >
                            <CrmEventForm item={editingEvent} onSave={handleSaveEvent} onCancel={() => setIsEventFormOpen(false)} loading={formSubmitting} leadId={leadId} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Call Log Form Sidebar */}
            <AnimatePresence>
                {isCallLogFormOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsCallLogFormOpen(false)} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-lg bg-card text-card-foreground shadow-lg z-50"
                        >
                            <CrmCallLogForm item={editingCallLog} onSave={handleSaveCallLog} onCancel={() => setIsCallLogFormOpen(false)} loading={formSubmitting} leadId={leadId} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Email Form Sidebar */}
            <AnimatePresence>
                {isEmailFormOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsEmailFormOpen(false)} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-lg bg-card text-card-foreground shadow-lg z-50"
                        >
                            <CrmEmailForm lead={lead} onSave={handleSendEmail} onCancel={() => setIsEmailFormOpen(false)} loading={formSubmitting} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default LeadInfo;