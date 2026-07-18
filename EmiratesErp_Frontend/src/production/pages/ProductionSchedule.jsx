import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ProductionSchedule = () => {
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    // View Type State: 'Manufacturing Order', 'Workstation', 'Employees'
    const [viewType, setViewType] = useState('Manufacturing Order');

    const [finishedGoodsMap, setFinishedGoodsMap] = useState({});
    const [customerMap, setCustomerMap] = useState({});
    const [salesOrderMap, setSalesOrderMap] = useState({});

    // Fetch Lookup Data
    useEffect(() => {
        const fetchLookupData = async () => {
            try {
                const token = localStorage.getItem('token');
                const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

                const [fgRes, custRes, soRes] = await Promise.all([
                    axios.get(`${API_URL}/production/finished-goods`, authHeaders),
                    axios.get(`${API_URL}/parties`, { ...authHeaders, params: { type: 'CUSTOMER', size: 1000 } }),
                    axios.get(`${API_URL}/sales/orders`, { ...authHeaders, params: { size: 1000 } })
                ]);

                // Maps
                const fgMap = {};
                (fgRes.data.content || fgRes.data || []).forEach(g => fgMap[g.id] = g);
                setFinishedGoodsMap(fgMap);

                const custMap = {};
                (custRes.data.content || custRes.data || []).forEach(c => custMap[c.id] = c);
                setCustomerMap(custMap);

                const soMap = {};
                (soRes.data.content || soRes.data || []).forEach(s => soMap[s.id] = s);
                setSalesOrderMap(soMap);

            } catch (e) {
                console.error("Failed to load lookup data", e);
            }
        };
        fetchLookupData();
    }, []);

    // Filter State
    const [filterOptions, setFilterOptions] = useState([]);
    const [selectedFilterId, setSelectedFilterId] = useState('all');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

    // Dropdown open state for View Type
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Current Date Range
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    // Fetch Filter Options when viewType changes
    useEffect(() => {
        const fetchFilters = async () => {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            setFilterOptions([]);
            setSelectedFilterId('all');

            try {
                let data = [];
                if (viewType === 'Manufacturing Order') {
                    const res = await axios.get(`${API_URL}/production/manufacturing-orders`, { headers, params: { size: 1000 } });
                    data = (res.data.content || []).map(mo => ({ id: mo.id, label: mo.moNumber }));
                } else if (viewType === 'Workstation') {
                    const res = await axios.get(`${API_URL}/production/work-groups`, { headers });
                    // Handle both array and paginated response
                    const items = Array.isArray(res.data) ? res.data : (res.data.content || []);
                    data = items.map(wg => ({ id: wg.id, label: wg.name }));
                } else if (viewType === 'Employees') {
                    const res = await axios.get(`${API_URL}/employees/all`, { headers });
                    const items = Array.isArray(res.data) ? res.data : (res.data.content || []);
                    data = items.map(emp => ({ id: emp.id, label: `${emp.firstName} ${emp.lastName}` }));
                }
                setFilterOptions(data);
            } catch (err) {
                console.error("Failed to fetch filter options", err);
            }
        };
        fetchFilters();
    }, [viewType]);

    // Refetch schedules when Filter changes
    useEffect(() => {
        if (dateRange.start && dateRange.end) {
            fetchSchedules(dateRange.start, dateRange.end);
        }
    }, [selectedFilterId, finishedGoodsMap, customerMap, salesOrderMap]); // Add maps to dependencies to trigger re-render on load

    const fetchSchedules = async (start, end) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };

            const startDate = start.toISOString().split('T')[0];
            const endDate = end.toISOString().split('T')[0];

            let fetchedEvents = [];

            if (viewType === 'Manufacturing Order' || viewType === 'Employees') {
                let url = `${API_URL}/production/manufacturing-orders`;
                const params = {
                    size: 1000,
                    fromDate: startDate,
                    toDate: endDate
                };

                // Use specific endpoint for Employee filter
                if (viewType === 'Employees' && selectedFilterId !== 'all') {
                    url = `${API_URL}/production/manufacturing-orders/assigned-to/${selectedFilterId}`;
                    // Note: This endpoint might not support date filtering in backend, so we get all assigned.
                    delete params.fromDate;
                    delete params.toDate;
                }

                const response = await axios.get(url, { headers, params });
                let data = response.data.content || [];

                // Client-side filtering for MO Number specific filter (only for MO view)
                if (viewType === 'Manufacturing Order' && selectedFilterId !== 'all') {
                    data = data.filter(mo => mo.id === parseInt(selectedFilterId) || mo.id === selectedFilterId);
                }

                fetchedEvents = data.map(mo => {
                    let startDt = mo.scheduleStart || mo.createdAt;
                    let endDt = mo.scheduleFinish || mo.dueDate || mo.scheduleStart || mo.createdAt;

                    // Resolve Data using Maps
                    const itemName = mo.itemName || mo.finishedGoodName || mo.finishedGood?.name || (finishedGoodsMap[mo.finishedGoodId]?.name) || 'Unknown Item';
                    const customerName = mo.customerName || (customerMap[mo.customerId]?.companyName || customerMap[mo.customerId]?.primaryContactPerson) || '';
                    const soNumber = mo.salesOrder?.soNumber || salesOrderMap[mo.salesOrderId]?.soNumber || salesOrderMap[mo.salesOrder?.id]?.soNumber || '';

                    return {
                        id: `mo-${mo.id}`,
                        title: mo.moNumber,
                        start: startDt,
                        end: endDt,
                        backgroundColor: getStatusColor(mo.status),
                        borderColor: getStatusColor(mo.status),
                        extendedProps: {
                            type: 'MO',
                            moNumber: mo.moNumber,
                            itemName: itemName,
                            customerName: customerName,
                            soNumber: soNumber,
                            quantity: mo.quantity,
                            status: mo.status,
                            details: `${itemName} (${mo.quantity} ${mo.unit || ''})`
                        }
                    };
                });
            } else {
                // Workstation logic commented out
                /*
                // ... Workstation fetch logic ...
                */
            }

            setEvents(fetchedEvents);

        } catch (error) {
            console.error("Error fetching schedules", error);
        } finally {
            setLoading(false);
        }
    };



    const getStatusColor = (status) => {
        switch (status) {
            case 'SCHEDULED': return '#fbbf24';
            case 'IN_PROGRESS': return '#3b82f6';
            case 'COMPLETED': return '#10b981';
            case 'PAUSED': return '#f59e0b';
            case 'CANCELLED': return '#ef4444';
            default: return '#fbbf24';
        }
    };

    const handleDatesSet = (dateInfo) => {
        setDateRange({ start: dateInfo.start, end: dateInfo.end });
        fetchSchedules(dateInfo.start, dateInfo.end);
    };

    const handleViewTypeChange = (type) => {
        setViewType(type);
        setIsDropdownOpen(false);
    };

    const handleFilterChange = (id) => {
        setSelectedFilterId(id);
        setIsFilterDropdownOpen(false);
    };

    const renderEventContent = (eventInfo) => {
        const { start, end } = eventInfo.event;
        const props = eventInfo.event.extendedProps;

        const startTime = start ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const endTime = end ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const timeRange = `${startTime} - ${endTime}`;

        return (
            <div className="p-1 text-xs leading-none overflow-hidden h-full flex flex-col gap-0.5 text-white shadow-sm hover:opacity-90 transition-opacity">
                <div className="font-semibold truncate">
                    {timeRange} #{props.moNumber}
                </div>
                <div className="truncate opacity-90 text-[10px]">
                    {props.itemName}
                    {props.quantity && ` (${props.quantity})`}
                </div>
            </div>
        );
    };

    const selectedFilterLabel = selectedFilterId === 'all'
        ? 'All'
        : (filterOptions.find(o => o.id === selectedFilterId)?.label || 'All');

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
            {/* Custom Header with Primary Background */}
            <div className="bg-primary px-6 py-4 shadow-md z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Production Schedule</h1>
                        <p className="text-sm text-blue-100 opacity-90">Manage timelines and resources</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Level 1 Dropdown: View Type */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors justify-between min-w-[180px] backdrop-blur-sm"
                        >
                            {viewType}
                            <ChevronRight size={16} className={`transform transition-transform ${isDropdownOpen ? 'rotate-90' : 'rotate-0'}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl z-50 rounded-lg overflow-hidden py-1">
                                {['Manufacturing Order', /* 'Workstation', */ 'Employees'].map(type => (
                                    <div
                                        key={type}
                                        onClick={() => handleViewTypeChange(type)}
                                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${viewType === type ? 'bg-blue-50 text-priority font-medium' : 'text-gray-700'}`}
                                    >
                                        {type}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Level 2 Dropdown: Specific Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                            className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors justify-between min-w-[200px]"
                        >
                            <span className="truncate max-w-[180px]">{selectedFilterLabel}</span>
                            <ChevronRight size={16} className={`transform transition-transform text-primary ${isFilterDropdownOpen ? 'rotate-90' : 'rotate-0'}`} />
                        </button>

                        {isFilterDropdownOpen && (
                            <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 shadow-xl z-50 rounded-lg overflow-y-auto max-h-96 py-1">
                                <div
                                    onClick={() => handleFilterChange('all')}
                                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${selectedFilterId === 'all' ? 'bg-blue-50 text-priority font-medium' : 'text-gray-700'}`}
                                >
                                    All
                                </div>
                                {filterOptions.map(opt => (
                                    <div
                                        key={opt.id}
                                        onClick={() => handleFilterChange(opt.id)}
                                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors ${selectedFilterId === opt.id ? 'bg-blue-50 text-priority font-medium' : 'text-gray-700'}`}
                                    >
                                        {opt.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Calendar Container */}
            <div className="flex-1 p-4 md:p-6 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/60 dark:bg-slate-800/60 flex items-center justify-center backdrop-blur-[1px]">
                        <Loader className="h-10 w-10 text-primary animate-spin" />
                    </div>
                )}

                <style>{`
                    .fc-toolbar-title { 
                        font-size: 1.25rem !important; 
                        font-family: inherit; 
                        font-weight: 700; 
                        color: #1f2937;
                    }
                    .fc-col-header-cell-cushion {
                        color: #4b5563;
                        font-weight: 600;
                        padding-top: 12px;
                        padding-bottom: 12px;
                        text-transform: uppercase;
                        font-size: 0.75rem;
                        letter-spacing: 0.05em;
                    }
                    .fc .fc-button-primary { 
                        background-color: #ffffff; 
                        border-color: #e5e7eb; 
                        color: #374151; 
                        font-weight: 500;
                        text-transform: capitalize;
                        padding: 0.5rem 1rem;
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    }
                    .fc .fc-button-primary:hover { 
                        background-color: #f9fafb; 
                        border-color: #d1d5db;
                        color: #111827; 
                    }
                    .fc .fc-button-primary:not(:disabled).fc-button-active, 
                    .fc .fc-button-primary:not(:disabled):active { 
                        background-color: #eff6ff; 
                        border-color: #bfdbfe;
                        color: #1d4ed8;
                        box-shadow: none;
                    }
                    .fc-theme-standard td, .fc-theme-standard th {
                        border-color: #e5e7eb;
                    }
                    .fc-day-today {
                        background-color: #f9fafb !important;
                    }
                    .fc-event { 
                        border: none !important; 
                        margin-bottom: 2px !important; 
                        border-radius: 4px;
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    }
                    .fc-h-event { background-color: transparent; }
                `}</style>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full p-4">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        events={events}
                        datesSet={handleDatesSet}
                        eventContent={renderEventContent}
                        height="100%"
                        dayMaxEvents={4}
                        eventDisplay="block"
                        forceEventDuration={true}
                        defaultTimedEventDuration="01:00:00"
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductionSchedule;
