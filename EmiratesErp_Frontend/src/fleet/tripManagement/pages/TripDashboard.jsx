import { useEffect, useState } from 'react';
import PendingPaymentsCard from '../components/dashboard/PendingPaymentsCard';
import StatsCard from '../components/dashboard/StatsCard';
import DataTable from '../components/table/DataTable';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TripDashboard = () => {
    const statsData = [
    {
      id: 1,
      title: "Total Trips",
      value: "1,284",
      subtitle: "↑ 12% vs last month",
    },
    {
      id: 2,
      title: "In Progress",
      value: "42",
      subtitle: "Currently active",
    },
    {
      id: 3,
      title: "Completed",
      value: "1,192",
      subtitle: "93% success rate",
    },
    {
      id: 4,
      title: "Pending Invoices",
      value: "15",
      subtitle: "3 Overdue",
    },
    {
      id: 5,
      title: "Total Revenue",
      value: "842,500.00",
      subtitle: "AED"
    },
    {
      id: 6,
      title: "Unpaid Vendor",
      value: "124,320.50",
      subtitle: "AED"
    },
    ];

    const tripColumns = [
    { key: "tripNo", header: "Trip No" },
    { key: "tripDate", header: "Date" },
    { key: "driverName", header: "Driver", type: "avatarTitle" },
    { key: "customerName", header: "Customer" },
    { key1: "fromLocation", key2: "toLocation", header: "Route", type: "route" },
    { key: "amount", header: "Amount (AED)" },
    { key: "tripStatus", header: "Status", type: "chip" },
    ];

    const paymentData = [
  {
    company: "DP World",
    subtitle: "4 Overdue Invoices",
    amount: "42,850.00",
    amountVariant: "danger",
  },
  {
    company: "ADNOC Logistics",
    subtitle: "2 Overdue Invoices",
    amount: "18,200.00",
    amountVariant: "danger",
  },
  {
    company: "Global Logistics Co.",
    subtitle: "1 Pending Invoice",
    amount: "5,400.00",
    amountVariant: "warning",
  },
  {
    company: "Emirates SkyCargo",
    subtitle: "3 Overdue Invoices",
    amount: "31,120.00",
    amountVariant: "danger",
  },
    ];

    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchTrips = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/fleet/trips`, {
          params: { page: page - 1, size: pageSize },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setData(response.data.content);
        setTotalRecords(response.data.totalElements);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
      fetchTrips();
    }, [page, pageSize]);

  return (
    <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {statsData.map((item, index) => (
                <StatsCard
                key={item.id}
                title={item.title}
                value={item.value}
                subtitle={item.subtitle}
                variant={['primary', 'success', 'warning', 'error', 'info', 'primary'][index % 6]}
                />
            ))}
        </div>
        <div className='flex justify-between py-6 gap-6 flex-col lg:flex-row'>
            <div className="flex-1 overflow-hidden">
                <div className=" flex items-center justify-between px-6 py-4 border-b border-border bg-background-muted rounded-t-theme shadow-sm">
                    <h2 className="text-xl font-black text-primary uppercase tracking-tight">
                        Recent Trips
                    </h2>
                    <h2 
                        className="text-xs text-warning mt-1 cursor-pointer font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                        onClick={()=>navigate('/fleet-dashboard/trips')}
                    >
                        View All Trips
                    </h2>
                </div>
                <DataTable
                    columns={tripColumns}
                    data={data}
                    page={page}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    loading={loading}
                    height="500px"
                />
            </div>
            <div className='flex-col space-y-6 w-full max-w-md'>
                <PendingPaymentsCard
                    payments={paymentData}
                    onSendReminders={() => console.log("Reminders Sent")}
                />
                <StatsCard
                    key={"001"}
                    title={"--------"}
                    value={"Graph in Progress"}
                    subtitle={"--------"}
                />
            </div>
        </div>
    </div>
  )
}

export default TripDashboard