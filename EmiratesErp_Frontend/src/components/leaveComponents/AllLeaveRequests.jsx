import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as leaveApi from '../../pages/leaveApi';
import { Check, X, FileClock, Loader, AlertCircle, Search, BookOpen, Plus, Trash2, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

// --- Leave Requests Section ---

// A map for styling statuses with dynamic theme compatibility
const leaveStatusStyles = {
    SUBMITTED: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: FileClock },
    APPROVED: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: Check },
    REJECTED: { bg: 'bg-rose-500/10', text: 'text-rose-600', icon: X },
    CANCELLED: { bg: 'bg-slate-500/10', text: 'text-slate-500', icon: X },
};

const LeaveRequestRow = ({ request, onUpdate }) => {
    // Use optional chaining for safety
    const { id, employeeName, employeeCode, leaveType, fromDate, toDate, reason, status, employee, leaveTypeMaster } = request || {};
    const displayStatus = status || 'SUBMITTED';
    const StatusIcon = leaveStatusStyles[displayStatus]?.icon || FileClock;

    const displayName = employeeName || (employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() : null) || employee?.name || 'N/A';
    const displayCode = employeeCode || employee?.employeeCode || employee?.code || '';
    const displayLeaveType = leaveType || leaveTypeMaster?.name || 'N/A';

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

    return (
        <tr className="border-b border-border/40 hover:bg-background-muted/40 transition-colors">
            <td className="px-3 py-2 text-xs">
                <div className="font-semibold text-foreground">{displayName}</div>
                {displayCode && <div className="text-[11px] text-foreground-muted">{displayCode}</div>}
            </td>
            <td className="px-3 py-2 text-xs text-foreground font-medium">{displayLeaveType}</td>
            <td className="px-3 py-2 text-xs text-foreground">{formatDate(fromDate)} to {formatDate(toDate)}</td>
            <td className="px-3 py-2 text-xs text-foreground-muted max-w-xs truncate" title={reason}>{reason || '-'}</td>
            <td className="px-3 py-2 text-xs">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full ${leaveStatusStyles[displayStatus]?.bg || 'bg-gray-100'} ${leaveStatusStyles[displayStatus]?.text || 'text-gray-800'}`}>
                    <StatusIcon className="h-3 w-3" />
                    {displayStatus.toLowerCase()}
                </span>
            </td>
            <td className="px-3 py-2 text-xs text-right">
                {displayStatus === 'SUBMITTED' ? (
                    <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => onUpdate(id, 'REJECTED')} className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors" title="Reject"><X className="h-3.5 w-3.5" /></button>
                        <button onClick={() => onUpdate(id, 'APPROVED')} className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-colors" title="Approve"><Check className="h-3.5 w-3.5" /></button>
                    </div>
                ) : null}
            </td>
        </tr>
    );
};

export const AllLeaveRequests = ({ searchTerm: externalSearchTerm }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('SUBMITTED');
    const [internalSearchTerm, setInternalSearchTerm] = useState('');

    const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;

    const fetchRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await leaveApi.getAllLeaveRequests();
            setRequests(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError('Failed to fetch leave requests.');
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (leaveRequestId, action) => {
        let comment = '';
        if (action === 'REJECTED') {
            comment = prompt("Please provide a reason for rejection (optional):");
            if (comment === null) { // User clicked cancel on the prompt
                return;
            }
        }

        try {
            const payload = {
                leaveRequestId,
                action,
                comment,
            };
            await leaveApi.processLeaveApproval(payload);
            fetchRequests(); // Refetch to get the updated list
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update leave status.';
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
            console.error("Update Error:", err);
        }
    };

    const filteredRequests = useMemo(() => {
        let filtered = requests.filter(req => (req.status || 'SUBMITTED') === activeTab);
        if (searchTerm && searchTerm.trim()) {
            const lowercasedFilter = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(req => {
                const name = (
                    req.employeeName ||
                    `${req.employee?.firstName || ''} ${req.employee?.lastName || ''}` ||
                    req.employee?.name ||
                    ''
                ).toLowerCase();
                const code = (
                    req.employeeCode ||
                    req.employee?.employeeCode ||
                    req.employee?.code ||
                    ''
                ).toLowerCase();
                const leaveTypeName = (req.leaveType || req.leaveTypeMaster?.name || '').toLowerCase();
                const reasonStr = (req.reason || '').toLowerCase();

                return name.includes(lowercasedFilter) ||
                       code.includes(lowercasedFilter) ||
                       leaveTypeName.includes(lowercasedFilter) ||
                       reasonStr.includes(lowercasedFilter);
            });
        }
        return filtered;
    }, [requests, activeTab, searchTerm]);

    const TABS = ['SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'];

    return (
        <div>
            <div className="flex border-b border-border w-full mb-3 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-primary text-primary font-bold'
                                : 'border-b-2 border-transparent text-foreground-muted hover:text-foreground'
                        }`}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {error && <div className="text-center text-red-600 p-3 bg-red-500/10 rounded-md text-xs mb-3">{error}</div>}

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full bg-card text-foreground divide-y divide-border">
                    <thead className="bg-background-muted/60">
                        <tr>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Employee</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Leave Type</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Dates</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Reason</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-8"><Loader className="h-6 w-6 animate-spin text-primary mx-auto" /></td></tr>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map(req => (<LeaveRequestRow key={req.id} request={req} onUpdate={handleUpdateStatus} />))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-foreground-muted">
                                    <FileClock className="mx-auto h-8 w-8 text-foreground-muted/40 mb-1.5" />
                                    <h3 className="text-xs font-semibold text-foreground">No requests found</h3>
                                    <p className="mt-0.5 text-[11px] text-foreground-muted">There are no leave requests matching your criteria.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Leave Balances & Allocation Section ---

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Balance Management View (Rendered Inline on Screen) ---
const BalanceManagementView = ({ employee, onClose, leaveTypes }) => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [newBalanceData, setNewBalanceData] = useState({
        leaveType: leaveTypes[0]?.leaveType || '',
        availableDays: '',
        asOfDate: new Date().toISOString().split('T')[0], // today's date
    });

    const fetchBalances = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/leave-balances/employee/${employee.employeeCode}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setBalances(response.data);
        } catch (err) {
            setError('Failed to fetch leave balances.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [employee.employeeCode]);

    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    const handleAddBalance = async (e) => {
        e.preventDefault();
        if (!newBalanceData.leaveType || !newBalanceData.availableDays) {
            setError('Leave Type and Allocated Days are required.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...newBalanceData,
                employeeCode: employee.employeeCode,
            };
            await axios.post(`${API_URL}/leave-balances`, payload, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setIsAddFormVisible(false);
            setNewBalanceData({
                leaveType: leaveTypes[0]?.leaveType || '',
                availableDays: '',
                asOfDate: new Date().toISOString().split('T')[0],
            });
            fetchBalances(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add balance.');
        }
    };

    const handleDeleteBalance = async (balanceId) => {
        if (!window.confirm("Are you sure you want to delete this balance record? This action cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/leave-balances/${balanceId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchBalances(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete balance.');
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewBalanceData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            {/* Page Sub-header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-background-muted transition-colors flex items-center gap-1.5 text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Employees
                    </button>
                    <div>
                        <h2 className="text-sm font-bold text-foreground">
                            Manage Balances for {employee.firstName} {employee.lastName}
                        </h2>
                        <span className="text-[11px] text-foreground-muted">Code: {employee.employeeCode}</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddFormVisible(!isAddFormVisible)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                    <Plus className="h-3.5 w-3.5" /> {isAddFormVisible ? 'Cancel' : 'Add/Update Balance'}
                </button>
            </div>

            {/* Form */}
            {isAddFormVisible && (
                <form onSubmit={handleAddBalance} className="p-3.5 border border-border rounded-xl bg-card shadow-2xs space-y-3">
                    <h3 className="text-xs font-bold text-foreground">Add or Update Leave Balance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label htmlFor="leaveType" className="block text-xs font-medium text-foreground-muted mb-1">Leave Type</label>
                            <select id="leaveType" name="leaveType" value={newBalanceData.leaveType} onChange={handleFormChange} required className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                                {leaveTypes.map(lt => <option key={lt.id} value={lt.leaveType}>{lt.leaveType.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="availableDays" className="block text-xs font-medium text-foreground-muted mb-1">Allocated Days</label>
                            <input type="number" step="0.5" id="availableDays" name="availableDays" value={newBalanceData.availableDays} onChange={handleFormChange} required className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g., 12" />
                        </div>
                        <div>
                            <label htmlFor="asOfDate" className="block text-xs font-medium text-foreground-muted mb-1">As of Date</label>
                            <input type="date" id="asOfDate" name="asOfDate" value={newBalanceData.asOfDate} onChange={handleFormChange} required className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-1">
                        <button type="submit" className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs">Save Balance</button>
                    </div>
                </form>
            )}

            {error && <div className="text-center text-red-600 p-2.5 bg-red-500/10 rounded-md text-xs">{error}</div>}

            {/* Table */}
            {loading ? (
                <div className="flex justify-center items-center h-32"><Loader className="h-6 w-6 animate-spin text-primary" /></div>
            ) : balances.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="min-w-full bg-card text-foreground divide-y divide-border">
                        <thead className="bg-background-muted/60">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Leave Type</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Allocated</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Used</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Pending</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Available</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">As of Date</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {balances.map(bal => (
                                <tr key={bal.id} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs font-semibold text-foreground">{bal.leaveType.leaveType.replace('_', ' ')}</td>
                                    <td className="px-3 py-2 text-xs text-right text-foreground">{bal.totalAllocated}</td>
                                    <td className="px-3 py-2 text-xs text-right text-foreground">{bal.used}</td>
                                    <td className="px-3 py-2 text-xs text-right text-foreground">{bal.pending}</td>
                                    <td className="px-3 py-2 text-xs text-right font-bold text-foreground">{bal.available}</td>
                                    <td className="px-3 py-2 text-xs text-foreground-muted">{new Date(bal.asOfDate).toLocaleDateString('en-IN')}</td>
                                    <td className="px-3 py-2 text-xs text-right">
                                        <button onClick={() => handleDeleteBalance(bal.id)} className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-foreground-muted py-8 bg-card rounded-lg border border-border">
                    <BookOpen className="mx-auto h-8 w-8 text-foreground-muted/40 mb-1.5" />
                    <h3 className="text-xs font-semibold text-foreground">No Balances Found</h3>
                    <p className="mt-0.5 text-[11px] text-foreground-muted">No leave balances have been configured for this employee.</p>
                </div>
            )}
        </div>
    );
};

export const LeaveBalancesSection = ({ searchTerm: externalSearchTerm, syncRef, setIsSyncing }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [internalSearchTerm, setInternalSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [syncing, setSyncing] = useState(false);
    const [allBalances, setAllBalances] = useState({});
    const [syncProgress, setSyncProgress] = useState(0);
    const [totalSyncCount, setTotalSyncCount] = useState(0);
    const [showSyncConfirmModal, setShowSyncConfirmModal] = useState(false);

    const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { "Authorization": `Bearer ${token}` };
            const [employeesRes, leaveTypesRes] = await Promise.all([
                axios.get(`${API_URL}/employees/all`, { headers }),
                axios.get(`${API_URL}/leave-types`, { headers })
            ]);
            const fetchedEmployees = employeesRes.data;
            setEmployees(fetchedEmployees);
            setLeaveTypes(leaveTypesRes.data);

            const balancePromises = fetchedEmployees.map(emp =>
                axios.get(`${API_URL}/leave-balances/employee/${emp.employeeCode}`, { headers })
            );
            const balanceResults = await Promise.allSettled(balancePromises);

            const balancesByEmployee = {};
            balanceResults.forEach((result, index) => {
                const employeeCode = fetchedEmployees[index].employeeCode;
                if (result.status === 'fulfilled') {
                    balancesByEmployee[employeeCode] = result.value.data;
                } else {
                    balancesByEmployee[employeeCode] = []; // Default to empty on error
                }
            });
            setAllBalances(balancesByEmployee);
        } catch (err) {
            setError('Failed to fetch employee or balance data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const executeSyncAllBalances = useCallback(async () => {
        setSyncing(true);
        if (setIsSyncing) setIsSyncing(true);
        setError('');
        setSyncProgress(0);
        let successCount = 0;
        let errorCount = 0;

        const token = localStorage.getItem('token');
        const headers = { "Authorization": `Bearer ${token}` };
        const asOfDate = new Date().toISOString().split('T')[0];

        const applicableLeaveTypes = leaveTypes.filter(lt => lt.maxDaysPerYear != null && lt.maxDaysPerYear > 0);
        const totalOperations = employees.length * applicableLeaveTypes.length;
        setTotalSyncCount(totalOperations);

        if (totalOperations === 0) {
            alert("No applicable leave types with 'Max Days Per Year' found to sync.");
            setSyncing(false);
            if (setIsSyncing) setIsSyncing(false);
            return;
        }

        for (const employee of employees) {
            for (const leaveType of applicableLeaveTypes) {
                try {
                    const payload = {
                        employeeCode: employee.employeeCode,
                        leaveType: leaveType.leaveType,
                        availableDays: leaveType.maxDaysPerYear,
                        asOfDate: asOfDate,
                    };
                    await axios.post(`${API_URL}/leave-balances`, payload, { headers });
                    successCount++;
                } catch (err) {
                    console.error(`Failed to sync for ${employee.employeeCode} and ${leaveType.leaveType}:`, err);
                    errorCount++;
                } finally {
                    setSyncProgress(prev => prev + 1);
                }
            }
        }

        setSyncing(false);
        if (setIsSyncing) setIsSyncing(false);
        alert(`Sync complete! \n- ${successCount} balances created/updated successfully. \n- ${errorCount} operations failed.`);
        fetchInitialData(); // Refresh all data
    }, [employees, leaveTypes, fetchInitialData, setIsSyncing]);

    const handleTriggerSync = useCallback(() => {
        setShowSyncConfirmModal(true);
    }, []);

    useEffect(() => {
        if (syncRef) {
            syncRef.current = handleTriggerSync;
        }
    }, [syncRef, handleTriggerSync]);

    const calculateTotalAvailable = (employeeCode) => {
        const balances = allBalances[employeeCode];
        if (!balances || balances.length === 0) {
            return 0;
        }
        return balances.reduce((total, balance) => total + (balance.available || 0), 0);
    };

    const filteredEmployees = useMemo(() => {
        if (!searchTerm || !searchTerm.trim()) return employees;
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        return employees.filter(emp =>
            (emp.firstName || '').toLowerCase().includes(lowercasedFilter) ||
            (emp.lastName || '').toLowerCase().includes(lowercasedFilter) ||
            (`${emp.firstName || ''} ${emp.lastName || ''}`).toLowerCase().includes(lowercasedFilter) ||
            (emp.employeeCode || '').toLowerCase().includes(lowercasedFilter)
        );
    }, [employees, searchTerm]);

    const handleManageBalances = (employee) => {
        setSelectedEmployee(employee);
    };

    const handleCloseView = () => {
        setSelectedEmployee(null);
        fetchInitialData(); // Refresh data when view closes
    };

    if (selectedEmployee) {
        return (
            <BalanceManagementView
                employee={selectedEmployee}
                onClose={handleCloseView}
                leaveTypes={leaveTypes}
            />
        );
    }

    return (
        <div>
            {syncing && (
                <div className="mb-3 p-3 bg-card border border-border rounded-lg shadow-2xs">
                    <p className="text-xs text-foreground-muted font-medium">Syncing balances... ({syncProgress} / {totalSyncCount})</p>
                    <div className="w-full bg-background-muted rounded-full h-2 mt-1.5 overflow-hidden">
                        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: totalSyncCount > 0 ? `${(syncProgress / totalSyncCount) * 100}%` : '0%' }}></div>
                    </div>
                </div>
            )}

            {error && <div className="text-center text-red-600 p-3 bg-red-500/10 rounded-md text-xs mb-3">{error}</div>}

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full bg-card text-foreground divide-y divide-border">
                    <thead className="bg-background-muted/60">
                        <tr>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Employee</th>
                            <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Employee Code</th>
                            <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Total Available Balance</th>
                            <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-8"><Loader className="h-6 w-6 animate-spin text-primary mx-auto" /></td></tr>
                        ) : filteredEmployees.length > 0 ? (
                            filteredEmployees.map(emp => (
                                <tr key={emp.employeeCode} className="hover:bg-background-muted/40 transition-colors">
                                    <td className="px-3 py-2 text-xs font-semibold text-foreground">{`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'N/A'}</td>
                                    <td className="px-3 py-2 text-xs text-foreground-muted">{emp.employeeCode}</td>
                                    <td className="px-3 py-2 text-xs text-right font-bold text-foreground">
                                        {calculateTotalAvailable(emp.employeeCode)} days
                                    </td>
                                    <td className="px-3 py-2 text-xs text-right">
                                        <button onClick={() => handleManageBalances(emp)} className="px-2.5 py-1 text-xs font-semibold rounded-md border border-border bg-background hover:bg-background-muted transition-colors text-foreground">
                                            Manage Balances
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-foreground-muted">
                                    <AlertCircle className="mx-auto h-8 w-8 text-foreground-muted/40 mb-1.5" />
                                    <h3 className="text-xs font-semibold text-foreground">No employees found</h3>
                                    <p className="mt-0.5 text-[11px] text-foreground-muted">No employees match your search criteria.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Sync Confirmation Warning Modal */}
            {showSyncConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
                    <div className="bg-card text-foreground rounded-xl border border-border shadow-2xl w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 rounded-full bg-amber-500/10 shrink-0">
                                <AlertTriangle className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Sync Leave Balances</h3>
                                <p className="text-xs text-foreground-muted">Confirmation Required</p>
                            </div>
                        </div>
                        <p className="text-xs text-foreground-muted leading-relaxed mb-5">
                            This will create or update leave balances for all <strong className="text-foreground">{employees.length}</strong> employees based on the defined leave types for the current year. This may take a while and cannot be undone. Do you want to proceed?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowSyncConfirmModal(false)}
                                className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-background-muted text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSyncConfirmModal(false);
                                    executeSyncAllBalances();
                                }}
                                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllLeaveRequests;