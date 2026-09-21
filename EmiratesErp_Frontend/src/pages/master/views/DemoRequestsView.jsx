import React, { useState } from 'react';
import { Loader, RefreshCw } from 'lucide-react';
import DemoRequestList from '../components/DemoRequestList';

const ALL_STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DEMO_SENT'];

const DemoRequestsView = ({ requests, loading, onRefresh }) => {
    const [filter, setFilter] = useState('ALL');

    const filtered = filter === 'ALL'
        ? requests
        : requests.filter(r => r.status === filter);

    const counts = ALL_STATUSES.reduce((acc, key) => {
        acc[key] = key === 'ALL'
            ? requests.length
            : requests.filter(r => r.status === key).length;
        return acc;
    }, {});

    return (
        <>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Demo Requests</h1>
                    <p className="text-sm text-foreground-muted mt-1">
                        Clients who requested a live module demo from emirateserp.com
                    </p>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2AA2A5] text-white
                               rounded-lg text-sm font-medium hover:bg-[#1d8a8d] transition-colors
                               disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
                {ALL_STATUSES.map(key => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            filter === key
                                ? 'bg-[#2AA2A5] text-white shadow-sm'
                                : 'bg-card text-foreground-muted border border-border hover:border-[#2AA2A5] hover:text-[#2AA2A5]'
                        }`}
                    >
                        {key} <span className="opacity-70">({counts[key]})</span>
                    </button>
                ))}
            </div>

            {/* Table card */}
            <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader className="animate-spin text-primary h-8 w-8" />
                    </div>
                ) : (
                    <DemoRequestList requests={filtered} onRefresh={onRefresh} />
                )}
            </div>
        </>
    );
};

export default DemoRequestsView;
