import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, PlusCircle, Play, Eye, CheckCircle, FileClock, AlertTriangle, Download, ArrowLeft, X } from 'lucide-react';
import ProcessPayrollRun from './ProcessPayrollRun';

const InputField = ({ label, id, type = 'text', children, ...props }) => (
    <div>
        {label && <label htmlFor={id} className="block text-[11px] font-medium text-foreground-muted mb-0.5">{label}</label>}
        <input
            id={id}
            type={type}
            {...props}
            className="w-full px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors h-7"
        />
    </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <div className="bg-card text-foreground border border-border rounded-xl shadow-xl p-4 w-full max-w-lg">
                <div className="flex justify-between items-center pb-2 mb-3 border-b border-border">
                    <h3 className="text-xs font-bold text-foreground">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-background-muted transition-colors">
                        <X size={14} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const statusStyles = {
    DRAFT: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    PROCESSING: 'bg-primary/10 text-primary border-primary/20',
    COMPLETED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    PAID: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    GENERATED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    FAILED: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

const CreateRunFormView = ({ onCancel, onCreate }) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(year, month);
    };

    return (
        <div className="p-4 border border-border rounded-lg bg-card text-foreground space-y-4 max-w-lg">
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground">Create New Payroll Run</h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-2 py-1 text-xs font-semibold rounded-md border border-border bg-background hover:bg-background-muted text-foreground transition-colors flex items-center gap-1"
                >
                    <ArrowLeft size={13} /> Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InputField label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
                    <InputField label="Month" type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} required />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1 text-xs font-semibold text-foreground-muted hover:bg-background-muted rounded-md transition-colors border border-border"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-3.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs h-7"
                    >
                        <PlusCircle size={13} /> Create Draft
                    </button>
                </div>
            </form>
        </div>
    );
};

const PayslipsModal = ({ isOpen, onClose, run, payslips, loading, onUpdateStatus, employees }) => {
    if (!run) return null;

    const getEmployeeDisplay = (p) => {
        if (p.employeeName) {
            return { name: p.employeeName, code: p.employeeCode || p.employeeId };
        }
        if (employees && employees.length > 0) {
            const emp = employees.find(e => e.id === p.employeeId || e.employeeCode === p.employeeCode);
            if (emp) {
                return { name: emp.name || `${emp.firstName} ${emp.lastName}`, code: emp.employeeCode };
            }
        }
        return { name: null, code: p.employeeCode || p.employeeId };
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Payslips for ${new Date(run.payPeriodStart).toLocaleString('default', { month: 'long' })} ${run.year}`}>
            {loading ? (
                <div className="flex justify-center items-center p-6"><Loader className="animate-spin h-5 w-5 text-primary" /></div>
            ) : (
                <div className="overflow-y-auto max-h-[60vh] border border-border rounded-lg">
                    <table className="min-w-full bg-card text-foreground divide-y divide-border">
                        <thead className="bg-background-muted/60">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Employee</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Net Salary</th>
                                <th className="px-3 py-2 text-left text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-right text-[11px] font-bold text-foreground-muted uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {payslips.map(p => {
                                const { name, code } = getEmployeeDisplay(p);
                                return (
                                    <tr key={p.id} className="hover:bg-background-muted/40 transition-colors">
                                        <td className="px-3 py-2 text-xs font-semibold text-foreground">
                                            {name ? (
                                                <span>{name} <span className="text-foreground-muted font-normal">({code})</span></span>
                                            ) : (
                                                <span className="text-foreground-muted">{code}</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-xs font-medium text-foreground">{p.netSalary}</td>
                                        <td className="px-3 py-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${p.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-right">
                                            {p.status !== 'PAID' && (
                                                <button
                                                    onClick={() => onUpdateStatus(p.id, 'PAID')}
                                                    className="px-2 py-0.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-md transition-colors inline-flex items-center gap-1"
                                                >
                                                    <CheckCircle size={12} /> Mark Paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Modal>
    );
};

const PayrollRun = () => {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPayslipsModalOpen, setPayslipsModalOpen] = useState(false);
    const [selectedRun, setSelectedRun] = useState(null);
    const [view, setView] = useState('list'); // 'list' | 'create' | 'process'
    const [payslips, setPayslips] = useState([]);
    const [payslipsLoading, setPayslipsLoading] = useState(false);
    const [employees, setEmployees] = useState([]);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchRuns = useCallback((showLoading = true) => {
        if (showLoading) setLoading(true);

        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/payroll-runs`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => setRuns(res.data.sort((a, b) => new Date(b.payPeriodStart) - new Date(a.payPeriodStart))))
            .catch(err => {
                console.error("Error fetching payroll runs:", err);
                setError('Failed to load payroll runs.');
            })
            .finally(() => setLoading(false));
    }, [API_URL]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/employees/all`, { headers: { "Authorization": `Bearer ${token}` } });
                setEmployees(response.data);
            } catch (err) {
                console.error("Error fetching employees for lookup:", err);
            }
        };
        fetchEmployees();
    }, [API_URL]);

    useEffect(() => { fetchRuns(); }, [fetchRuns]);

    const handleCreateRun = async (year, month) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/payroll-runs`, { year, month }, { headers: { "Authorization": `Bearer ${token}` } });
            setView('list');
            fetchRuns();
            alert('Payroll run created successfully as a draft.');
        } catch (err) {
            console.error("Error creating payroll run:", err);
            alert(err.response?.data?.message || 'Failed to create payroll run.');
        }
    };

    const handleExecuteRun = async (runId) => {
        const runToProcess = runs.find(r => r.id === runId);
        if (!runToProcess) return;
        setSelectedRun(runToProcess);
        setView('process');
    };

    const handleViewPayslips = async (run) => {
        setSelectedRun(run);
        setPayslipsModalOpen(true);
        setPayslipsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/payroll-runs/${run.id}/payslips`, { headers: { "Authorization": `Bearer ${token}` } });
            setPayslips(response.data);
        } catch (err) {
            console.error("Error fetching payslips:", err);
            alert('Failed to fetch payslips for this run.');
        } finally {
            setPayslipsLoading(false);
        }
    };

    const handleUpdatePayslipStatus = async (payslipId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/payslips/${payslipId}/status`, null, {
                params: { status: newStatus },
                headers: { "Authorization": `Bearer ${token}` }
            });

            setPayslips(prev => prev.map(p => p.id === payslipId ? { ...p, status: newStatus } : p));
        } catch (err) {
            console.error("Error updating payslip status:", err);
            alert('Failed to update payslip status.');
        }
    };

    const handleDownloadWpsSif = async (runId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/payroll-runs/${runId}/wps-sif`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'wps_sif.SIF';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (fileNameMatch.length === 2)
                    fileName = fileNameMatch[1];
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error downloading WPS SIF:", err);
            alert('Failed to download WPS SIF file.');
        }
    };

    const handleUpdateStatus = async (runId, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this run as ${newStatus}? This will update all employee payslips.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/payroll-runs/${runId}/status`, null, {
                params: { status: newStatus },
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchRuns(false);
            alert(`Payroll run marked as ${newStatus} successfully.`);
        } catch (err) {
            console.error("Error updating status:", err);
            alert('Failed to update payroll run status.');
        }
    };

    if (loading) return <div className="flex justify-center items-center p-6"><Loader className="animate-spin h-5 w-5 text-primary" /></div>;
    if (error) return <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-md border border-rose-500/20">{error}</div>;

    if (view === 'create') {
        return <CreateRunFormView onCancel={() => setView('list')} onCreate={handleCreateRun} />;
    }

    if (view === 'process' && selectedRun) {
        return <ProcessPayrollRun run={selectedRun} onBack={() => setView('list')} onRunComplete={() => { setView('list'); fetchRuns(false); }} />;
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-foreground">Payroll Runs</h3>
                <button
                    onClick={() => setView('create')}
                    className="px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-2xs"
                >
                    <PlusCircle size={13} /> Create Payroll Run
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {runs.map(run => (
                    <div key={run.id} className="bg-card border border-border rounded-lg shadow-2xs flex flex-col text-foreground">
                        <div className="p-3 border-b border-border">
                            <div className="flex justify-between items-start">
                                <h4 className="text-xs font-bold text-foreground">
                                    {new Date(run.payPeriodStart).toLocaleString('default', { month: 'long' })} {run.year}
                                </h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[run.status] || 'bg-background-muted text-foreground-muted border-border'}`}>
                                    {run.status}
                                </span>
                            </div>
                            <p className="text-[10px] text-foreground-muted mt-0.5">
                                Period: {new Date(run.payPeriodStart).toLocaleDateString()} - {new Date(run.payPeriodEnd).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="p-3 space-y-2 text-xs text-foreground-muted flex-grow">
                            <div className="flex items-center gap-1.5">
                                {run.status === 'DRAFT' ? <FileClock className="h-3.5 w-3.5 text-amber-500" /> : run.status === 'FAILED' ? <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> : <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                                <span className="text-xs font-medium text-foreground">Status: {run.status}</span>
                            </div>
                            {run.executedAt && <p className="text-[10px] text-foreground-muted">Executed: {new Date(run.executedAt).toLocaleString()}</p>}
                        </div>
                        <div className="p-2.5 bg-background-muted/40 border-t border-border flex justify-end flex-wrap gap-1.5">
                            {run.status === 'DRAFT' && (
                                <button onClick={() => handleExecuteRun(run.id)} className="px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1">
                                    <Play size={13} /> Process Payroll
                                </button>
                            )}
                            {run.status === 'PROCESSING' && (
                                <span className="text-xs italic text-foreground-muted flex items-center gap-1.5"><Loader className="animate-spin h-3.5 w-3.5" /> Processing...</span>
                            )}
                            {(run.status === 'GENERATED' || run.status === 'COMPLETED') && (
                                <>
                                    <button onClick={() => handleViewPayslips(run)} className="px-2 py-1 text-xs font-semibold border border-border bg-background hover:bg-background-muted text-foreground rounded-md transition-colors flex items-center gap-1">
                                        <Eye size={13} /> View Payslips
                                    </button>
                                    <button onClick={() => handleUpdateStatus(run.id, 'PAID')} className="px-2 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors flex items-center gap-1">
                                        <CheckCircle size={13} /> Mark as Paid
                                    </button>
                                </>
                            )}
                            {(run.status === 'PAID') && (
                                <>
                                    <button onClick={() => handleViewPayslips(run)} className="px-2 py-1 text-xs font-semibold border border-border bg-background hover:bg-background-muted text-foreground rounded-md transition-colors flex items-center gap-1">
                                        <Eye size={13} /> View Payslips
                                    </button>
                                    <button onClick={() => handleDownloadWpsSif(run.id)} className="px-2 py-1 text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors flex items-center gap-1" title="Download WPS SIF File">
                                        <Download size={13} /> WPS SIF
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <PayslipsModal
                isOpen={isPayslipsModalOpen}
                onClose={() => setPayslipsModalOpen(false)}
                run={selectedRun}
                payslips={payslips}
                loading={payslipsLoading}
                onUpdateStatus={handleUpdatePayslipStatus}
            />
        </div>
    );
};

export default PayrollRun;