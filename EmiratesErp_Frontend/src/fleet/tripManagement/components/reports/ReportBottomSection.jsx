import { useEffect, useState } from "react";
import axios from "axios";

const TABS = [
  { label: "Driver Performance", key: "driver" },
  { label: "Customer Billing", key: "customer" },
  { label: "Vendor Liabilities", key: "vendor" },
];

const ReportBottomSection = ({ month }) => {

  const [activeTab, setActiveTab] = useState("driver");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchReport = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/fleet/trip-reports/${activeTab}?month=${month}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      console.log(" Fetched Report  ",res.data);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, month]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">

      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Total Trips</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Total Commission</th>
            </tr>
          </thead>
          <tbody>
            {data?.length > 0 ? (
              data.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3">{item?.entityName}</td>
                  <td className="p-3">{item?.tripCount}</td>
                  <td className="p-3">{item?.amount} AED</td>
                  <td className="p-3 text-green-600">
                    {item?.commission} AED
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReportBottomSection;
