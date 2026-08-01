import React, { useState } from 'react';
import { Clock, Target, Camera, Monitor, Fingerprint, Network, ArrowLeft } from 'lucide-react';
import ShiftPolicy from '../../../components/base/ShiftPolicy';
import AttendanceTracking from '../../../components/attendance/AttendanceTracking';
import AttendanceCapturingPolicy from '../../../components/attendance/AttendanceCapturingPolicy';

const componentMap = {
    'Shift Policy': <ShiftPolicy embedded={true} />,
    'Attendance Tracking Policy': <AttendanceTracking />,
    'Attendance Capturing Policy': <AttendanceCapturingPolicy />,
};

const policyItems = [
    { name: 'Shift Policy', icon: Clock, action: 'modal', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { name: 'Attendance Capturing Policy', icon: Camera, action: 'modal', color: 'text-sky-600', bgColor: 'bg-sky-100' },
    { name: 'Attendance Tracking Policy', icon: Target, action: 'modal', color: 'text-green-600', bgColor: 'bg-green-100' },
    // { name: 'On-Screen Display Policy', icon: Monitor, path: '#', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    // { name: 'Biometric Integration Policy', icon: Fingerprint, path: '#', color: 'text-rose-600', bgColor: 'bg-rose-100' },
    // { name: 'Network Policy', icon: Network, path: '#', color: 'text-teal-600', bgColor: 'bg-teal-100' },
];

const AttendencePolicy = () => {
    const [activeItem, setActiveItem] = useState(null);

    const handleItemClick = (item) => {
        const component = componentMap[item.name];
        if (component) {
            setActiveItem({ name: item.name, component });
        } else if (item.path) {
            alert('This feature is not yet implemented.');
        }
    };

    if (activeItem) {
        return (
            <div className="p-4 md:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
                    <button 
                        onClick={() => setActiveItem(null)} 
                        className="p-1.5 hover:bg-background-muted rounded-lg border border-border flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Policies</span>
                    </button>
                    <h2 className="text-xs font-bold text-foreground">Manage {activeItem.name}</h2>
                </div>
                {activeItem.component}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                {policyItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => handleItemClick(item)}
                        className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-border/80 shadow-2xs hover:shadow-md hover:border-primary/40 hover:bg-background-muted/40 transition-all duration-200 focus:outline-none cursor-pointer"
                    >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${item.bgColor} ${item.color} mb-2.5 shadow-2xs border border-current/10 group-hover:scale-110 transition-transform duration-200`}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors text-center line-clamp-2 leading-tight">
                            {item.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AttendencePolicy;
