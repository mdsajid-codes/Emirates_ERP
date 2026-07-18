import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';

const LocationModal = ({ isOpen, onClose, onSave, location, loading }) => {
    const [formData, setFormData] = useState({
        name: '', address: '', city: '', state: '', postalCode: '', country: '', primary: false
    });
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (location) {
            setFormData({
                name: location.name || '',
                address: location.address || '',
                city: location.city || '',
                state: location.state || '',
                postalCode: location.postalCode || '',
                country: location.country || '',
                primary: location.primary || false,
            });
        } else {
            setFormData({
                name: '', address: '', city: '', state: '', postalCode: '', country: '', primary: false
            });
        }
        setModalError('');
    }, [location, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setModalError('Location Name is required.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{location ? 'Edit' : 'Add'} Work Location</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Location Name *</label>
                            <input id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g. Main Warehouse" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                            <input id="address" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Street address" />
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">City</label>
                            <input id="city" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="City" />
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">State</label>
                            <input id="state" name="state" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="State" />
                        </div>
                        <div>
                            <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                            <input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Postal code" />
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                            <input id="country" name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Country" />
                        </div>
                        <div className="md:col-span-2 mt-2">
                            <label className="inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="primary" checked={formData.primary} onChange={handleChange} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                                <span className="ml-2 text-sm text-slate-700">Set as primary location</span>
                            </label>
                        </div>
                        {modalError && <p className="md:col-span-2 text-red-500 text-sm mt-1">{modalError}</p>}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#1a237e] rounded-md hover:bg-blue-900 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
                            {loading && <Loader className="animate-spin h-4 w-4 mr-2" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LocationModal;
