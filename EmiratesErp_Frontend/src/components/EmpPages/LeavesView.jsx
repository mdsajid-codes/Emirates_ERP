import React, { useState, useEffect, useMemo } from 'react';
import * as leaveApi from '../../pages/leaveApi';
import { 
    Plus, 
    Loader, 
    AlertCircle, 
    X, 
    Calendar, 
    FileClock, 
    Check, 
    MessageSquare, 
    ArrowRight, 
    Trash2,
    Sparkles,
    CalendarDays,
    Info,
    Clock,
    User,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modern Full-Screen Overlay Modal (Exact layout style like Employee Management AddEmployeePage)
const RequestLeaveModal = ({ isOpen, onClose, onSubmit, loading, leaveTypes = [] }) => {
    const [formData, setFormData] = useState({
        leaveType: '',
        fromDate: '',
        toDate: '',
        reason: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                leaveType: leaveTypes[0]?.leaveType || '',
                fromDate: '',
                toDate: '',
                reason: ''
            });
            setError('');
        }
    }, [isOpen, leaveTypes]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculatedDays = useMemo(() => {
        if (!formData.fromDate || !formData.toDate) return 0;
        const start = new Date(formData.fromDate);
        const end = new Date(formData.toDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
        return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }, [formData.fromDate, formData.toDate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.fromDate || !formData.toDate || !formData.reason) {
            setError('All fields are required.');
            return;
        }
        if (new Date(formData.fromDate) > new Date(formData.toDate)) {
            setError('Start date cannot be after end date.');
            return;
        }
        setError('');
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="bg-card text-card-foreground rounded-2xl shadow-2xl w-full max-w-2xl border border-border overflow-hidden flex flex-col my-auto"
                >
                    {/* Header Banner */}
                    <div className="p-5 sm:p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-md">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">Apply for Leave</h2>
                                <p className="text-xs text-foreground-muted">Submit your time-off request for manager approval</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 rounded-xl text-foreground-muted hover:bg-background-muted hover:text-foreground transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                            {/* Leave Type Field */}
                            <div>
                                <label htmlFor="leaveType" className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                                    Leave Type <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    id="leaveType" 
                                    name="leaveType" 
                                    value={formData.leaveType} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
                                >
                                    {leaveTypes.length > 0 ? (
                                        leaveTypes.map(lt => (
                                            <option key={lt.id} value={lt.leaveType}>
                                                {lt.leaveType.replace('_', ' ')} {lt.isPaid ? '(Paid Leave)' : '(Unpaid Leave)'}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No leave types configured</option>
                                    )}
                                </select>
                            </div>

                            {/* Start & End Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="fromDate" className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="date" 
                                        id="fromDate" 
                                        name="fromDate" 
                                        value={formData.fromDate} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="toDate" className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="date" 
                                        id="toDate" 
                                        name="toDate" 
                                        value={formData.toDate} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                                    />
                                </div>
                            </div>

                            {/* Duration Indicator Box */}
                            {calculatedDays > 0 && (
                                <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-primary font-bold">
                                        <Clock className="h-4 w-4" />
                                        <span>Total Leave Duration:</span>
                                    </div>
                                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-extrabold rounded-lg shadow-xs">
                                        {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
                                    </span>
                                </div>
                            )}

                            {/* Reason for Leave */}
                            <div>
                                <label htmlFor="reason" className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                                    Reason / Notes <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    id="reason" 
                                    name="reason" 
                                    value={formData.reason} 
                                    onChange={handleChange} 
                                    rows="3" 
                                    required 
                                    className="w-full bg-background border border-border rounded-xl p-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-foreground-muted" 
                                    placeholder="Please state the reason for your time off application..."
                                ></textarea>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        {/* Footer Controls */}
                        <div className="p-4 sm:p-5 border-t border-border bg-background-muted/60 flex justify-end gap-3 shrink-0">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-4 py-2 bg-background border border-border text-foreground rounded-xl text-xs font-bold hover:bg-background-muted transition-colors" 
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md flex items-center gap-2" 
                                disabled={loading}
                            >
                                {loading ? <Loader className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                Submit Application
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const statusStyles = {
    SUBMITTED: { bg: 'bg-amber-500/10 text-amber-600 border border-amber-500/20', icon: FileClock, label: 'Submitted' },
    APPROVED: { bg: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20', icon: Check, label: 'Approved' },
    REJECTED: { bg: 'bg-red-500/10 text-red-600 border border-red-500/20', icon: X, label: 'Rejected' },
    CANCELLED: { bg: 'bg-background-muted text-foreground-muted border border-border', icon: X, label: 'Cancelled' },
};

const LeaveHistoryCard = ({ request, onCancel }) => {
    const { id, leaveType, fromDate, toDate, reason, status, leaveApprovals, daysRequested } = request;
    const displayStatus = status || 'SUBMITTED';
    const StatusIcon = statusStyles[displayStatus]?.icon || FileClock;

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

    return (
        <div className="bg-card p-5 rounded-2xl border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start gap-2"> 
                    <h4 className="font-bold text-sm text-foreground tracking-tight">
                        {(typeof leaveType === 'object' && leaveType !== null ? leaveType.leaveType : leaveType || '').replace('_', ' ')}
                    </h4>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full ${statusStyles[displayStatus]?.bg}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusStyles[displayStatus]?.label || displayStatus}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-foreground-muted mt-2 bg-background-muted p-2 rounded-xl border border-border/50">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{formatDate(fromDate)}</span>
                    <ArrowRight className="h-3 w-3 text-foreground-muted" />
                    <span>{formatDate(toDate)}</span>
                    {daysRequested && (
                        <span className="ml-auto font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {daysRequested}d
                        </span>
                    )}
                </div>

                <p className="text-xs text-foreground-muted mt-3 flex items-start gap-2 line-clamp-2">
                    <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-foreground-muted shrink-0" />
                    <span>{reason || 'No reason provided.'}</span>
                </p>

                {(status === 'APPROVED' || status === 'REJECTED') && leaveApprovals && leaveApprovals.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border text-[11px] text-foreground-muted space-y-1 bg-background-muted/40 p-2 rounded-lg">
                        {leaveApprovals.map((approval) => (
                            <div key={approval.id}>
                                <p className="font-medium">
                                    <span className={`font-bold ${approval.action === 'APPROVED' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {approval.action}
                                    </span>
                                    {' by '}
                                    <span className="font-bold text-foreground">{approval.approverName || 'HR Manager'}</span>
                                </p>
                                {approval.comment && <p className="italic text-[10px] mt-0.5">"{approval.comment}"</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {displayStatus === 'SUBMITTED' && (
                <div className="mt-4 pt-3 border-t border-border flex justify-end">
                    <button 
                        onClick={() => onCancel(id)} 
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Cancel Application
                    </button>
                </div>
            )}
        </div>
    );
};

const LeavesView = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('ALL');

    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const employeeCode = localStorage.getItem('employeeCode');

    const fetchLeaves = async () => {
        if (!employeeCode) {
            setError("Employee code not found. Cannot fetch leave data.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await leaveApi.getLeaveRequestsForEmployee(employeeCode);
            const sortedLeaves = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setLeaves(sortedLeaves);
        } catch (err) {
            setError('Failed to fetch leave history. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            try {
                const response = await leaveApi.getAllLeaveTypes();
                setLeaveTypes(response.data.filter(lt => lt.isPaid));
            } catch (err) {
                console.error("Failed to fetch leave types", err);
            }
        };

        fetchLeaves();
        fetchLeaveTypes();
    }, [API_URL, employeeCode]);

    const handleSubmitLeave = async (leaveData) => {
        setModalLoading(true);
        try {
            const startDate = new Date(leaveData.fromDate);
            const endDate = new Date(leaveData.toDate);
            const daysRequested = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

            const payload = {
                employeeCode,
                leaveType: leaveData.leaveType,
                fromDate: leaveData.fromDate,
                toDate: leaveData.toDate,
                reason: leaveData.reason,
                daysRequested,
                partialDayInfo: null,
            };

            await leaveApi.createLeaveRequest(payload);
            setIsModalOpen(false);
            fetchLeaves();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data || 'Failed to submit leave request. Please try again.';
            alert(`Error: ${errorMessage}`);
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCancelLeave = async (leaveId) => {
        if (!window.confirm("Are you sure you want to cancel this leave request?")) return;

        setLoading(true);
        setError('');
        try {
            await leaveApi.cancelLeaveRequest(leaveId);
            fetchLeaves();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to cancel leave request.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLeaves = useMemo(() => {
        if (activeTab === 'ALL') return leaves;
        return leaves.filter(leave => (leave.status || 'SUBMITTED') === activeTab);
    }, [leaves, activeTab]);

    const TABS = ['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'];

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground tracking-tight">My Leave Applications</h1>
                    <p className="text-xs text-foreground-muted mt-0.5">Submit new time-off requests and track approval history</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)} 
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all flex items-center gap-1.5 shrink-0"
                >
                    <Plus className="h-4 w-4" />
                    Apply for Leave
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-border overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                            activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-foreground-muted hover:text-foreground'
                        }`}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLeaves.length > 0 ? (
                        filteredLeaves.map(leave => (
                            <LeaveHistoryCard key={leave.id} request={leave} onCancel={handleCancelLeave} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 bg-card rounded-2xl border border-border p-8">
                            <FileClock className="mx-auto h-12 w-12 text-foreground-muted/50" />
                            <h3 className="mt-3 text-sm font-bold text-foreground">No leave records found</h3>
                            <p className="mt-1 text-xs text-foreground-muted">
                                {activeTab === 'ALL' ? "You haven't requested any leaves yet." : `You have no ${activeTab.toLowerCase()} leave applications.`}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Full Screen Overlay Form Modal */}
            <RequestLeaveModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitLeave}
                loading={modalLoading}
                leaveTypes={leaveTypes}
            />
        </div>
    );
}

export default LeavesView;
