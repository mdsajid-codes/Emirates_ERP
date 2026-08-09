import React, { useState } from 'react';
import axios from 'axios';
import { Loader, X } from 'lucide-react';

const InputField = ({ label, id, type = 'text', ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        <input id={id} type={type} {...props} className="input mt-1" />
    </div>
);

const MissingAttendanceRequestModal = ({ isOpen, onClose, employeeCode, onRequestSubmitted }) => {
    const [formData, setFormData] = useState({
        attendanceDate: new Date().toISOString().split('T')[0],
        requestedCheckIn: '',
        requestedCheckOut: '',
        reason: '',
    });
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.requestedCheckIn && !formData.requestedCheckOut) {
            setError('You must provide at least a Check In or Check Out time.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const empCode = employeeCode || localStorage.getItem('employeeCode');

            const formDataObj = new FormData();
            const requestDto = {
                attendanceDate: formData.attendanceDate,
                requestedCheckIn: formData.requestedCheckIn ? (formData.requestedCheckIn.length === 5 ? `${formData.requestedCheckIn}:00` : formData.requestedCheckIn) : null,
                requestedCheckOut: formData.requestedCheckOut ? (formData.requestedCheckOut.length === 5 ? `${formData.requestedCheckOut}:00` : formData.requestedCheckOut) : null,
                reason: formData.reason,
            };

            formDataObj.append('request', new Blob([JSON.stringify(requestDto)], { type: 'application/json' }));
            if (file) {
                formDataObj.append('file', file);
            }

            await axios.post(`${API_URL}/missing-attendance/request/${empCode}`, formDataObj, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (onRequestSubmitted) onRequestSubmitted();
            onClose();
        } catch (err) {
            console.error('Error submitting missing attendance request:', err);
            setError(err.response?.data?.message || err.response?.data || 'Failed to submit regularization request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Request Attendance Regularization</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <InputField label="Attendance Date" name="attendanceDate" type="date" value={formData.attendanceDate} onChange={handleChange} required />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Requested Check In" name="requestedCheckIn" type="time" value={formData.requestedCheckIn} onChange={handleChange} />
                            <InputField label="Requested Check Out" name="requestedCheckOut" type="time" value={formData.requestedCheckOut} onChange={handleChange} />
                        </div>
                        <InputField label="Reason" name="reason" type="textarea" value={formData.reason} onChange={handleChange} required />
                        <div><label htmlFor="attachment" className="block text-sm font-medium text-slate-700">Attachment (Optional)</label><input id="attachment" type="file" onChange={handleFileChange} className="input mt-1" /></div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>{loading && <Loader className="animate-spin h-4 w-4 mr-2" />} Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MissingAttendanceRequestModal;