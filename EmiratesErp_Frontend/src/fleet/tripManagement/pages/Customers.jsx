import { useNavigate } from "react-router-dom";
import AppButton from "../components/dashboard/AppButton"
import { useEffect, useState } from "react";
import { Edit, Eye, Plus, Trash2, Search, Download, Filter } from "lucide-react";
import DataTable from "../components/table/DataTable";
import axios from "axios";
import CustomerForm from "../components/form/CustomerForm";
import { toast } from "react-toastify";


const Customers = () => {

    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [customerData,setCustomerData] = useState([]);
    const [customerFrom, setCustomerFrom] = useState(false);
    const [editFormData, setEditFormData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this customer?")) return;
      try {
        await axios.delete(`${API_URL}/fleet/trip-customers/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Customer deleted successfully");
        fetchCustomers(pagination.page, pagination.size, debouncedSearch);
      } catch (error) {
        console.error("Error deleting customer:", error);
        toast.error("Failed to delete customer");
      }
    };

    const customerColumns = [
      { key: "companyName", header: "Company Name", type: "avatarTitle" },
      { key: "contactPerson", header: "Contact Person" },
      { key: "email", header: "Email Address" },
      { key: "phone", header: "Phone" },
      { key: "trnNumber", header: "TRN (VAT ID)" },
      { key: "customerType", header: "Type", type: "chip" },
      { key: "active", header: "Status", type: "active" },
      { key : "actions", header: "Actions", type: "actions", actions: [
        {
          label: <Eye size={18} />,
          title: "View Details",
          onClick: (row) => navigate(`/fleet-dashboard/customer-details/${row.id}`)
        },
        {
          label: <Edit size={18} />,
          title: "Edit",
          onClick: (row) => {
            setCustomerFrom(true)
            setEditFormData(row)
          }
        },
        {
          label: <Trash2 size={18} color="red"/>,
          title: "Delete",
          onClick: (row) => handleDelete(row.id)
        }
      ]}
    ];
    const [pagination, setPagination] = useState({
      page: 0,
      size: 10,
      totalElements: 0
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search term
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearch(searchTerm);
      }, 500);
      return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchCustomers = async (page = 0, size = 10, searchVal = debouncedSearch) => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/fleet/trip-customers/paginated`, {
          params: { page, size, search: searchVal || undefined },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCustomerData(response.data.content || []);
        setPagination({
          page: response.data.number,
          size: response.data.size,
          totalElements: response.data.totalElements
        });
      } catch (error) { 
        console.error("Error fetching customers:", error);
        toast.error("Failed to fetch customers");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchCustomers(0, pagination.size, debouncedSearch);
    }, [debouncedSearch]);

    const handleExport = async () => {
      try {
        const response = await axios.get(`${API_URL}/fleet/trip-customers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        const allCustomers = response.data || [];
        if (allCustomers.length === 0) {
          toast.info("No customer records to export");
          return;
        }

        // Define columns to export
        const headers = ["Company Name", "Contact Person", "Email Address", "Phone", "TRN (VAT ID)", "Type", "Status"];
        
        const csvRows = [];
        csvRows.push(headers.join(","));

        allCustomers.forEach(c => {
          const row = [
            `"${(c.companyName || '').replace(/"/g, '""')}"`,
            `"${(c.contactPerson || '').replace(/"/g, '""')}"`,
            `"${(c.email || '').replace(/"/g, '""')}"`,
            `"${(c.phone || '').replace(/"/g, '""')}"`,
            `"${(c.trnNumber || '').replace(/"/g, '""')}"`,
            `"${(c.customerType || '').replace(/"/g, '""')}"`,
            `"${c.active ? 'ACTIVE' : 'INACTIVE'}"`
          ];
          csvRows.push(row.join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "Customers_Directory_Report.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Customers exported successfully");
      } catch (error) {
        console.error("Error exporting customers:", error);
        toast.error("Failed to export customers");
      }
    };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-theme shadow-sm border border-border">   
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Our Customers 
          </h1>
          <p className="text-sm text-foreground-muted mt-2">
            Manage coporate partners and individual clients in the GCC network
          </p>
        </div>
        <div className="flex gap-3">
          <AppButton
            variant="outline"
            icon={<Download size={18} />}
            className="border-border hover:bg-background-muted text-foreground transition-colors"
            onClick={handleExport}
          >
            Export
          </AppButton>
          <AppButton
            icon={<Plus size={18} />}
            className="bg-primary hover:opacity-90 text-primary-foreground border-none shadow-md shadow-primary/20"
            onClick={()=> setCustomerFrom(true)}
          >
            Create New Customer
          </AppButton>
        </div>
      </div>

      <div className="bg-card rounded-theme shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-background-muted/50">
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
              <input
                placeholder="Search by company name, contact, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <button className="p-2 border border-border rounded-theme hover:bg-background transition-colors text-foreground-muted">
              <Filter size={18} />
            </button>
          </div>
          <div className="text-xs font-bold text-foreground-muted uppercase tracking-widest">
            {pagination.totalElements} Total Customers
          </div>
        </div>

        <DataTable
          columns={customerColumns}
          data={customerData}
          loading={loading}
          page={pagination.page + 1}
          totalPages={Math.ceil(pagination.totalElements / pagination.size) || 1}
          totalRecords={pagination.totalElements}
          pageSize={pagination.size}
          onPageChange={(page) => fetchCustomers(page - 1, pagination.size)}
        />
      </div>
      {
        customerFrom && 
          <CustomerForm 
            isOpen={true} 
            onClose={() =>{
              setCustomerFrom(false)
              setEditFormData(null);
            }
            } 
            onSave={(newCustomer) => {
            setCustomerData([...customerData, newCustomer]);
            }} 
            isEditing={!!editFormData}
            initialData={editFormData}
          />
      }
    </div>
  )
}

export default Customers