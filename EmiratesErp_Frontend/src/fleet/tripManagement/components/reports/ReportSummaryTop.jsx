const ReportSummaryTop = ({ month }) => {

  // In future: fetch(`/api/report-summary?month=${month}`)

  const data = {
    revenue: 482900,
    vendorCost: 215450,
    driverCommission: 92120,
    netProfit: 175330,
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-6">Profit & Loss Summary</h2>

      <div className="grid grid-cols-4 gap-6">
        <Card title="Total Revenue" value={data.revenue} color="text-green-600" />
        <Card title="Total Vendor Cost" value={data.vendorCost} color="text-red-600" />
        <Card title="Driver Commission" value={data.driverCommission} color="text-yellow-600" />
        <Card title="Net Profit" value={data.netProfit} color="text-blue-600" />
      </div>
    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div className="bg-gray-50 p-4 rounded-xl">
    <p className="text-sm text-gray-500">{title}</p>
    <h3 className={`text-2xl font-bold ${color}`}>
      {value.toLocaleString()} AED
    </h3>
  </div>
);

export default ReportSummaryTop;