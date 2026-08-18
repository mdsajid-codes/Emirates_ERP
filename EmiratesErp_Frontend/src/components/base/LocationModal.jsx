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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center z-50 p-4 transition-all">
            <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-[500px] border border-[#E4EAF0] overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-[#F0F4F8] flex justify-between items-center bg-white">
                    <h2 className="text-[20px] font-bold text-[#102A5B] tracking-tight">
                        {location ? 'Edit' : 'Add'} Work Location
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#5F6F91] hover:text-[#102A5B] p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Modal Body */}
                    <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                        {/* Location Name */}
                        <div>
                            <label htmlFor="name" className="block text-[13px] font-semibold text-[#102A5B] mb-1.5">
                                Location Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full h-[40px] px-3.5 bg-white border border-[#D8E2F1] rounded-[8px] text-[13px] text-[#102A5B] placeholder:text-slate-300 outline-none focus:border-[var(--color-primary,#00A9A8)] transition-all"
                                placeholder="e.g. Main Warehouse"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-[13px] font-semibold text-[#102A5B] mb-1.5">
                                Address
                            </label>
                            <input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full h-[40px] px-3.5 bg-white border border-[#D8E2F1] rounded-[8px] text-[13px] text-[#102A5B] placeholder:text-slate-300 outline-none focus:border-[var(--color-primary,#00A9A8)] transition-all"
                                placeholder="Street address"
                            />
                        </div>

                        {/* City & State */}
                        <div className="grid grid-cols-2 gap-3.5">
                            <div>
                                <label htmlFor="city" className="block text-[13px] font-semibold text-[#102A5B] mb-1.5">
                                    City
                                </label>
                                <input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full h-[40px] px-3.5 bg-white border border-[#D8E2F1] rounded-[8px] text-[13px] text-[#102A5B] placeholder:text-slate-300 outline-none focus:border-[var(--color-primary,#00A9A8)] transition-all"
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-[13px] font-semibold text-[#102A5B] mb-1.5">
                                    State
                                </label>
                                <input
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full h-[40px] px-3.5 bg-white border border-[#D8E2F1] rounded-[8px] text-[13px] text-[#102A5B] placeholder:text-slate-300 outline-none focus:border-[var(--color-primary,#00A9A8)] transition-all"
                                    placeholder="State"
                                />
                            </div>
                        </div>

                        {/* Postal Code & Country */}
                        <div className="grid grid-cols-2 gap-3.5">
                            <div>
                                <label htmlFor="postalCode" className="block text-[13px] font-semibold text-[#102A5B] mb-1.5">
                                    Postal Code
                                </label>
                                <input
                                    id="postalCode"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    className="w-full h-[40px] px-3.5 bg-white border border-[#D8E2F1] rounded-[8px] text-[13px] text-[#102A5B] placeholder:text-slate-300 outline-none focus:border-[var(--color-primary,#00A9A8)] transition-all"
                                    placeholder="Postal code"
                                />
                            </div>
                            <div>
                                <label htmlFor="country" className="block text-[13px] font-semibold text-[#102A5B] mb-1.5">
                                    Country
                                </label>
                                <input
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full h-[40px] px-3.5 bg-white border border-[#D8E2F1] rounded-[8px] text-[13px] text-[#102A5B] placeholder:text-slate-300 outline-none focus:border-[var(--color-primary,#00A9A8)] transition-all"
                                    placeholder="Country"
                                />
                            </div>
                        </div>

                        {/* Primary Checkbox */}
                        <div className="pt-1">
                            <label className="inline-flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="primary"
                                    checked={formData.primary}
                                    onChange={handleChange}
                                    className="h-4 w-4 border-[#D8E2F1] rounded text-[var(--color-primary,#00A9A8)] focus:ring-[var(--color-primary,#00A9A8)] cursor-pointer"
                                />
                                <span className="text-[13px] font-normal text-[#102A5B]">Set as primary location</span>
                            </label>
                        </div>

                        {modalError && <p className="text-rose-500 text-xs font-semibold">{modalError}</p>}
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 border-t border-[#F0F4F8] bg-white flex justify-end items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-[13px] font-semibold text-[#102A5B] bg-white border border-[#D8E2F1] rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-[13px] font-semibold text-white bg-[var(--color-sidebar-bg,#06275C)] rounded-[8px] hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading && <Loader className="animate-spin h-4 w-4" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LocationModal;
