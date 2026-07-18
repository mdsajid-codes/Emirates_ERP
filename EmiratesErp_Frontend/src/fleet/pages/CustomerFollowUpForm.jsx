import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, MessageSquare, Calendar, User, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import CustomInput from '../tripManagement/components/customFormComponents/CustomInput';
import CustomSelect from '../tripManagement/components/customFormComponents/CustomSelect';
import AppButton from '../tripManagement/components/dashboard/AppButton';

const CustomerFollowUpForm = ({ isOpen, onClose, onSave, customerId }) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    followUpDate: new Date().toISOString().split('T')[0],
    purpose: 'PAYMENT',
    notes: '',
    nextFollowUpDate: '',
    assignedToId: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        customer: { id: customerId },
        assignedTo: formData.assignedToId ? { id: formData.assignedToId } : null
      };
      
      await axios.post(`${API_URL}/fleet/trip-customers/${customerId}/follow-ups`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      toast.success("Follow-up logged successfully");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error logging follow-up:", error);
      toast.error("Failed to log follow-up");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3 text-primary">
            <MessageSquare size={24} />
            <h2 className="text-xl font-bold text-foreground">Log Customer Interaction</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CustomInput 
              label="Interaction Date" 
              name="followUpDate" 
              type="date" 
              value={formData.followUpDate} 
              onChange={handleChange} 
              required 
            />
            <CustomSelect 
              label="Purpose" 
              name="purpose" 
              value={formData.purpose} 
              onChange={handleChange} 
              required
            >
              <option value="PAYMENT">Payment Follow-up</option>
              <option value="RENEWAL">Contract Renewal</option>
              <option value="FEEDBACK">Service Feedback</option>
              <option value="ISSUE">Complaint/Issue</option>
              <option value="SALES">New Sales/Upsell</option>
              <option value="OTHER">Other</option>
            </CustomSelect>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1">Detailed Notes</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px] text-sm"
              placeholder="What was discussed with the customer?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustomInput 
              label="Next Follow-up Date" 
              name="nextFollowUpDate" 
              type="date" 
              value={formData.nextFollowUpDate} 
              onChange={handleChange} 
            />
            <CustomSelect 
              label="Assigned To" 
              name="assignedToId" 
              value={formData.assignedToId} 
              onChange={handleChange}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeCode})</option>
              ))}
            </CustomSelect>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl flex gap-3 items-start border border-primary/10 mt-2">
            <Info className="text-primary shrink-0" size={18} />
            <p className="text-[10px] text-foreground-muted leading-relaxed">
              Recording this interaction will update the customer timeline and help track account health. 
              If a next follow-up date is set, it will appear on your dashboard reminders.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button 
              type="button"
              onClick={onClose} 
              className="px-6 py-2.5 text-sm font-bold text-foreground-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <AppButton 
              type="submit"
              loading={loading}
              className="px-8 py-2.5"
            >
              Save Interaction
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFollowUpForm;
