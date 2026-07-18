import { useNavigate } from "react-router-dom";
import AppButton from "../components/dashboard/AppButton"
import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import DataTable from "../components/table/DataTable";
import axios from "axios";
import VendorForm from "../components/form/VendorForm";


const Vendors = () => {

    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [vendorData,setVendorData] = useState([]);
    const [vendorFrom, setVendorFrom] = useState(false);
    const [editFormData, setEditFormData] = useState(null);


    const vendorColumns = [
    { key: "companyName", header: "Company Name", type: "avatarTitle" },
    { key: "contactPerson", header: "Contact Person" },
    { key: "phone", header: "Phone" },
    { key: "active", header: "Status", type: "active" },
    { key : "actions", header: "Actions", type: "actions", actions: [
      {
        label: <Edit size={18} />,
        title: "Edit",
        onClick: (row) => {
          setVendorFrom(true)
          setEditFormData(row)
        }
      },
      {
        label: <Trash2 size={18} color="red"/>,
        title: "Delete",
        onClick: (row) =>{}
      }
    ]}
    ];


    const fetchVendors = async () => {
      try {
        const VendorResponse = await axios.get(`${API_URL}/fleet/trip-vendors`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("Fetched Vendors:", VendorResponse.data);
        setVendorData(VendorResponse.data);
      } catch (error) { 
        console.error("Error fetching vendors:", error);
      }
    };
    useEffect(()=>{
      fetchVendors();
    }, []);
  return (
    <div>
      <div className="flex items-center justify-between mb-8">   
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Our Vendors 
          </h1>
          <p className="text-gray-500 mt-2">
            Manage coporate partners and individual clients in the GCC network
          </p>
        </div>
        <AppButton
            icon={<Plus/>}
            className="pr-5 py-2"
            onClick={()=> setVendorFrom(true)}
        >
            Create New Vendor
        </AppButton>
      </div>
      <div>
        <DataTable
          columns={vendorColumns}
          data={vendorData}
        />
      </div>
      {
        vendorFrom && 
          <VendorForm 
            isOpen={true} 
            onClose={() => {
              setVendorFrom(false)
              setEditFormData(null);
            }} 
            onSave={(newVendor) => {
            setVendorData([...vendorData, newVendor]);
            }}
            isEditing={!!editFormData}
            initialData={editFormData} 
          />
      }
    </div>
  )
}

export default Vendors