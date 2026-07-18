import React from 'react';

const NotificationDashboard = () => {
    return (
        <div className="animate-fade-in-up">
            <h1 className="text-2xl font-bold text-foreground">Notification Dashboard</h1>
            <p className="text-foreground-muted mt-2">Overview of your notification delivery across all channels.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <div className="bg-card p-6 rounded-theme border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-foreground-muted">Total Emails</h3>
                    <p className="text-2xl font-bold text-foreground mt-2">1,234</p>
                </div>
                <div className="bg-card p-6 rounded-theme border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-foreground-muted">Total SMS</h3>
                    <p className="text-2xl font-bold text-foreground mt-2">567</p>
                </div>
                <div className="bg-card p-6 rounded-theme border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-foreground-muted">WhatsApp</h3>
                    <p className="text-2xl font-bold text-foreground mt-2">890</p>
                </div>
                <div className="bg-card p-6 rounded-theme border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-foreground-muted">Active Webhooks</h3>
                    <p className="text-2xl font-bold text-foreground mt-2">12</p>
                </div>
            </div>
        </div>
    );
};

export default NotificationDashboard;
