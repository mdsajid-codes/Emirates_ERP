import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AtsVendorEmailsTab = ({ vendorId }) => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEmails = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(`${API_URL}/ats/vendors/${vendorId}/email-activities`, { headers });
                setEmails(res.data || []);
            } catch (err) {
                console.error("Error fetching email activities:", err);
            } finally {
                setLoading(false);
            }
        };

        if (vendorId) {
            fetchEmails();
        }
    }, [vendorId]);

    return (
        <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-2">Email Logs (Read-Only)</h3>

            {loading && (
                <div className="text-center py-6 text-foreground-muted text-sm font-semibold">
                    Loading emails...
                </div>
            )}

            {!loading && emails.map(email => (
                <div key={email.id} className="p-4 rounded-theme border border-border bg-background/50 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{email.subject}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-theme ${email.direction === 'OUTBOUND' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                            {email.direction}
                        </span>
                    </div>
                    <div className="text-xs text-foreground-muted mt-1 font-semibold">
                        From: {email.fromAddress} | To: {email.toAddresses}
                    </div>
                    <p className="text-xs text-foreground mt-2 font-medium bg-card p-2 rounded-theme border border-border max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {email.body}
                    </p>
                </div>
            ))}

            {!loading && emails.length === 0 && (
                <div className="text-center py-10 text-foreground-muted text-sm">
                    No recent logged outbound/inbound mail activities.
                </div>
            )}
        </div>
    );
};

export default AtsVendorEmailsTab;
