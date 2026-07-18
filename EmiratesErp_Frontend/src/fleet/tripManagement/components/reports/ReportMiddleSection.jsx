import { TrendingUp } from "lucide-react";

const ReportMiddleSection = ({ month }) => {

  // Future: weekly revenue chart API
  // Future: efficiency API

  return (
    <div className="grid grid-cols-3 gap-6">
      
      <div className="col-span-2 bg-white p-6 rounded-2xl shadow-md">
        <h3 className="font-semibold mb-4">Revenue vs Operational Cost (Weekly)</h3>
        <div className="h-48 flex items-center justify-center text-gray-400">
          Chart Placeholder (Future API Based)
        </div>
      </div>

      <div className="flex flex-col justify-between bg-blue-900 text-white p-6 rounded-2xl shadow-md">
        <div>
            <TrendingUp color="gold"/>
            <h3 className="text-sm opacity-70">Monthly Efficiency Score</h3>
            <h2 className="text-4xl font-bold">94.2%</h2>
        </div>

        <div className="">
          <p className="text-sm opacity-70">Top Performing Driver</p>
          <h4 className="font-semibold mt-2">Ahmed Al-Maktoum</h4>
          <p className="text-sm opacity-70 text-yellow-400">14,200 AED Commission</p>
        </div>
      </div>
    </div>
  );
};

export default ReportMiddleSection;