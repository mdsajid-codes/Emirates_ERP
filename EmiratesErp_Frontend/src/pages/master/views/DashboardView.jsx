import React from 'react';
import StatCard from '../components/StatCard';

const DashboardView = ({ stats, loading, error }) => (
    <>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    </>
);

export default DashboardView;
