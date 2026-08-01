import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, Calculator, Download, AlertCircle } from 'lucide-react';

const InputField = ({ label, id, type = 'text', children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-[11px] font-medium text-foreground-muted mb-0.5">{label}</label>
        {type === 'select' ? (
            <select id={id} {...props} className="w-full px-2 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors h-7">
                {children}
            </select>
        ) : (
            <input id={id} type={type} {...props} className="w-full px-2 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors h-7" />
        )}
    </div>
);

const InfoDisplay = ({ label, value, isCurrency = false }) => (
    <div>
        <p className="text-[11px] text-foreground-muted font-medium">{label}</p>
        <p className="text-xs font-semibold text-foreground">{isCurrency ? formatCurrency(value) : (value || <span className="text-foreground-muted/60">N/A</span>)}</p>
    </div>
);

const formatCurrency = (amount, currency = 'AED') => new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount || 0);

const EndOfServiceTab = ({ employee }) => {
    const [eosDetails, setEosDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [formData, setFormData] = useState({
        lastWorkingDay: '',
        terminationReason: 'RESIGNATION',
    });
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchEosDetails = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/eos/${employee.employeeCode}`, { headers: { "Authorization": `Bearer ${token}` } });
            setEosDetails(response.data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setEosDetails(null);
            } else {
                setError('Failed to fetch End of Service details.');
            }
        } finally {
            setLoading(false);
        }
    }, [employee.employeeCode, API_URL]);

    useEffect(() => {
        fetchEosDetails();
    }, [fetchEosDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setIsCalculating(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/eos/calculate/${employee.employeeCode}`, formData, { headers: { "Authorization": `Bearer ${token}` } });
            setEosDetails(response.data);
            alert('Gratuity calculated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to calculate gratuity.');
        } finally {
            setIsCalculating(false);
        }
    };

    const handleDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/eos/download-settlement/${employee.employeeCode}`, {
                headers: { "Authorization": `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Final-Settlement-${employee.employeeCode}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to download settlement PDF.');
        }
    };

    if (loading) return <div className="flex justify-center items-center p-6"><Loader className="animate-spin h-5 w-5 text-primary" /></div>;

    return (
        <div className="space-y-4">
            <div className="p-3 border border-border rounded-lg bg-card text-foreground">
                <h3 className="text-xs font-bold text-foreground mb-3">Calculate Final Settlement</h3>
                <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-end">
                    <InputField label="Last Working Day" name="lastWorkingDay" type="date" value={formData.lastWorkingDay} onChange={handleChange} required />
                    <InputField label="Reason for Leaving" name="terminationReason" type="select" value={formData.terminationReason} onChange={handleChange} required>
                        <option value="RESIGNATION">Resignation</option>
                        <option value="TERMINATION">Termination</option>
                        <option value="REDUNDANCY">Redundancy</option>
                        <option value="TERMINATION_FOR_CAUSE">Termination for Cause</option>
                    </InputField>
                    <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 h-7 shadow-2xs"
                        disabled={isCalculating}
                    >
                        {isCalculating ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Calculator className="h-3.5 w-3.5" />}
                        {eosDetails ? 'Re-calculate' : 'Calculate'}
                    </button>
                </form>
                {error && <p className="text-rose-500 text-xs mt-2">{error}</p>}
            </div>

            {eosDetails ? (
                <div className="p-3 border border-border rounded-lg bg-card text-foreground space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                        <h3 className="text-xs font-bold text-foreground">Settlement Details</h3>
                        <button
                            onClick={handleDownload}
                            className="px-2.5 py-1 text-xs font-semibold border border-border rounded-md bg-background hover:bg-background-muted text-foreground transition-colors flex items-center gap-1.5"
                        >
                            <Download size={13} /> Download Statement
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <InfoDisplay label="Joining Date" value={new Date(eosDetails.joiningDate).toLocaleDateString()} />
                        <InfoDisplay label="Last Working Day" value={new Date(eosDetails.lastWorkingDay).toLocaleDateString()} />
                        <InfoDisplay label="Years of Service" value={eosDetails.totalYearsOfService?.toFixed(2)} />
                        <InfoDisplay label="Last Basic Salary" value={eosDetails.lastBasicSalary} isCurrency />
                        <div className="md:col-span-3 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center">
                            <p className="text-[11px] text-primary font-bold">Calculated Gratuity Amount</p>
                            <p className="text-xl font-extrabold text-primary mt-0.5">{formatCurrency(eosDetails.gratuityAmount)}</p>
                        </div>
                        <div className="md:col-span-3">
                            <p className="text-[11px] text-foreground-muted font-medium mb-1">Calculation Details</p>
                            <p className="font-mono text-[11px] bg-background-muted/60 p-2.5 rounded-md border border-border text-foreground">{eosDetails.calculationDetails}</p>
                        </div>
                        <InfoDisplay label="Paid Status" value={eosDetails.paid ? `Paid on ${new Date(eosDetails.paymentDate).toLocaleDateString()}` : 'Unpaid'} />
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 border border-dashed border-border rounded-lg bg-card">
                    <AlertCircle className="mx-auto h-7 w-7 text-foreground-muted/50 mb-1" />
                    <h4 className="text-xs font-bold text-foreground">No Settlement Calculated</h4>
                    <p className="mt-0.5 text-[11px] text-foreground-muted">Use the form above to calculate the final settlement for this employee.</p>
                </div>
            )}
        </div>
    );
};

export default EndOfServiceTab;