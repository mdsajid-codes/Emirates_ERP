import React from 'react';
import { 
    MapPin, 
    CloudDownload, 
    UserPlus, 
    Users, 
    CalendarClock, 
    Coins, 
    Receipt,
    UserCheck,
    UserX,
    Plane
} from 'lucide-react';

const HrmsDashboardView = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
            
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">HR Dashboard</h1>
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>All Locations</span>
                    </button>

                    <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                        <CloudDownload className="h-4 w-4 text-gray-500" />
                        <span>Bulk Add</span>
                    </button>

                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#1E1B4B] text-white shadow-sm hover:bg-[#1E1B4B]/90 transition-colors">
                        <UserPlus className="h-4 w-4" />
                        <span>Add Employee</span>
                    </button>
                </div>
            </div>

            {/* Top KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                {/* Total Employees */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-600">Total Employees</p>
                        <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">0</p>
                </div>

                {/* Pending Leaves */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                        <CalendarClock className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">0</p>
                </div>

                {/* Pending Loans */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-600">Pending Loans</p>
                        <Coins className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">0</p>
                </div>

                {/* Pending Expenses */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-600">Pending Expenses</p>
                        <Receipt className="h-5 w-5 text-blue-800" />
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">0</p>
                </div>

            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Section (Span 8) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Today's Attendance Summary Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Today's Attendance Summary</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Present */}
                            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between h-[100px]">
                                <div className="flex justify-between items-start">
                                    <p className="text-xs font-semibold text-gray-600">Present</p>
                                    <UserCheck className="h-4 w-4 text-blue-600" />
                                </div>
                                <p className="text-2xl font-extrabold text-gray-900">0</p>
                            </div>

                            {/* Absent */}
                            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between h-[100px]">
                                <div className="flex justify-between items-start">
                                    <p className="text-xs font-semibold text-gray-600">Absent</p>
                                    <UserX className="h-4 w-4 text-indigo-600" />
                                </div>
                                <p className="text-2xl font-extrabold text-gray-900">0</p>
                            </div>

                            {/* On Leave */}
                            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between h-[100px]">
                                <div className="flex justify-between items-start">
                                    <p className="text-xs font-semibold text-gray-600">On Leave</p>
                                    <Plane className="h-4 w-4 text-purple-600" />
                                </div>
                                <p className="text-2xl font-extrabold text-gray-900">0</p>
                            </div>
                        </div>

                        {/* Recent Check-ins (Placeholder) */}
                        <div className="mt-8">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Check-ins</h3>
                            <div className="h-32 border border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50/50">
                                <p className="text-sm text-gray-500 font-medium">No recent check-ins.</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Section (Span 4) */}
                <div className="lg:col-span-4 flex flex-col h-full">
                    
                    {/* Recent Activity Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full min-h-[400px]">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                        
                        <div className="flex items-center justify-center h-[300px]">
                            <p className="text-sm text-gray-500 font-medium text-center">
                                No activity to show yet.
                            </p>
                        </div>
                    </div>

                </div>

            </div>
            
        </div>
    );
};

export default HrmsDashboardView;
