import axios from "axios";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import CustomInput from "../customFormComponents/CustomInput";
import AppButton from "../dashboard/AppButton";

const VendorForm = ({ isOpen, onClose, onSave, isEditing, initialData }) => {
  const [vendorForm, setVendorForm] = useState({
    companyName: "" || initialData?.companyName,
    contactPerson: "" || initialData?.contactPerson,
    phone: "" || initialData?.phone,
    status: "active"
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setVendorForm({ ...vendorForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL;
      if (isEditing) {
        const response = await axios.put(`${API_URL}/fleet/trip-vendors/${initialData.id}`, vendorForm, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Vendor updated successfully");
        onSave(response.data);
      } else {
        const response = await axios.post(`${API_URL}/fleet/trip-vendors`, vendorForm, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Vendor created successfully");
        onSave(response.data);
      }
      onClose();
    } catch (error) {
      console.error("Error creating vendor:", error);
      toast.error("Failed to create vendor");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? "Edit Vendor" : "Quick Add Vendor"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <CustomInput label="Company Name" name="companyName" value={vendorForm.companyName} onChange={handleChange} />
          <CustomInput label="Contact Person" name="contactPerson" value={vendorForm.contactPerson} onChange={handleChange} />
          <CustomInput label="Phone" name="phone" value={vendorForm.phone} onChange={handleChange} />
        </div>
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
          <AppButton onClick={handleSubmit}>{isEditing ? "Update" : "Create"}  Vendor</AppButton>
        </div>
      </div>
    </div>
  );
};

export default VendorForm;