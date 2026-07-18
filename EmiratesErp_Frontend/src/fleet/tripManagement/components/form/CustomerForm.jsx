import axios from "axios";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import CustomInput from "../customFormComponents/CustomInput";
import CustomSelect from "../customFormComponents/CustomSelect";
import AppButton from "../dashboard/AppButton";

const CustomerForm = ({ isOpen, onClose, onSave, isEditing, initialData}) => {
  const [customerForm, setCustomerForm] = useState({
    companyName: initialData?.companyName || "",
    contactPerson: initialData?.contactPerson || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    trnNumber: initialData?.trnNumber || "",
    address: initialData?.address || "",
    creditLimit: initialData?.creditLimit || "",
    paymentTermsDays: initialData?.paymentTermsDays || "",
    contractStartDate: initialData?.contractStartDate || "",
    contractEndDate: initialData?.contractEndDate || "",
    customerType: initialData?.customerType || "COMPANY",
    status: initialData?.active === false ? "inactive" : "active"
  });
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setCustomerForm({ ...customerForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL;
      const formData = new FormData();
      
      // Construct customer object for the @RequestPart
      const customerData = {
        ...customerForm,
        creditLimit: customerForm.creditLimit ? parseFloat(customerForm.creditLimit) : null,
        paymentTermsDays: customerForm.paymentTermsDays ? parseInt(customerForm.paymentTermsDays) : null,
        active: customerForm.status === "active"
      };

      formData.append("customer", new Blob([JSON.stringify(customerData)], { type: "application/json" }));
      if (file) {
        formData.append("file", file);
      }

      const headers = { 
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data"
      };

      if (isEditing) {
        const response = await axios.put(`${API_URL}/fleet/trip-customers/${initialData.id}`, formData, { headers });
        toast.success("Customer updated successfully");
        onSave(response.data);
      } else {
        const response = await axios.post(`${API_URL}/fleet/trip-customers`, formData, { headers });
        toast.success("Customer created successfully");
        onSave(response.data);
      }
      onClose();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error(error.response?.data?.message || "Failed to save customer");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Quick {isEditing ? "Edit" : "Add"} Customer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          <div className="md:col-span-2">
             <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Basic Information</h3>
          </div>
          <div className="md:col-span-2">
            <CustomInput 
              label="Customer Code" 
              name="customerCode" 
              value={isEditing ? initialData?.customerCode : "Auto-generated"} 
              onChange={() => {}} 
              disabled 
              className="bg-gray-50 font-mono text-primary font-bold"
            />
          </div>
          <CustomInput label="Company Name" name="companyName" value={customerForm.companyName} onChange={handleChange} required />
          <CustomInput label="Contact Person" name="contactPerson" value={customerForm.contactPerson} onChange={handleChange} required />
          <CustomInput label="Email" name="email" type="email" value={customerForm.email} onChange={handleChange} required />
          <CustomInput label="Phone" name="phone" value={customerForm.phone} onChange={handleChange} required />
          <CustomSelect label="Type" name="customerType" value={customerForm.customerType} onChange={handleChange}>
            <option value="COMPANY">Company</option>
            <option value="INDIVIDUAL">Individual</option>
          </CustomSelect>
          <CustomInput label="TRN (Tax ID)" name="trnNumber" value={customerForm.trnNumber} onChange={handleChange} />
          
          <div className="md:col-span-2 mt-2">
             <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Contract & Financials</h3>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea 
              name="address" 
              value={customerForm.address} 
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px] text-sm"
              placeholder="Full office/billing address..."
            />
          </div>
          <CustomInput label="Contract Start Date" name="contractStartDate" type="date" value={customerForm.contractStartDate} onChange={handleChange} />
          <CustomInput label="Contract End Date" name="contractEndDate" type="date" value={customerForm.contractEndDate} onChange={handleChange} />
          <CustomInput label="Credit Limit (AED)" name="creditLimit" type="number" value={customerForm.creditLimit} onChange={handleChange} />
          <CustomInput label="Payment Terms (Days)" name="paymentTermsDays" type="number" value={customerForm.paymentTermsDays} onChange={handleChange} />
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contract Document (PDF/Image)</label>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>
          
          <CustomSelect label="Status" name="status" value={customerForm.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </CustomSelect>
        </div>
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
          <AppButton onClick={handleSubmit}>{isEditing ? "Save Changes" : "Save Customer"}</AppButton>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;