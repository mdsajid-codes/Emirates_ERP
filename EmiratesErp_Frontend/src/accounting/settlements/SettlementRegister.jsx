import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { settlementApi } from '../api/settlementApi';
import { toast } from 'react-toastify';
import StatusBadge from '../components/StatusBadge';

export const SettlementRegister = () => {
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await settlementApi.getAll();
      setSettlements(res.data || []);
    } catch (err) {
      toast.error('Failed to load settlements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSettlements = settlements.filter(s => 
    (s.partnerName && s.partnerName.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (s.settlementNumber && s.settlementNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 bg-background min-h-screen text-foreground">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mutual Settlements</h1>
          <p className="text-foreground-muted mt-1">Offset AP and AR invoices for a single partner</p>
        </div>
        <button 
          onClick={() => navigate('/account-dashboard/settlements/new')}
          className="bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-theme flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={20} />
          <span>New Settlement</span>
        </button>
      </div>

      <div className="bg-card rounded-theme shadow-sm border border-border p-4 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={20} />
          <input 
            type="text"
            placeholder="Search by Partner or Settlement No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background-muted border border-border rounded-theme focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-background-muted hover:bg-hover rounded-theme text-foreground-muted transition-all border border-border">
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      <div className="bg-card rounded-theme shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background-muted border-b border-border">
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted">Settlement No</th>
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted">Date</th>
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted">Partner</th>
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted">Amount</th>
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted">Status</th>
              <th className="py-4 px-6 text-sm font-semibold text-foreground-muted"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-foreground-muted">Loading settlements...</td>
              </tr>
            ) : filteredSettlements.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-foreground-muted">No settlements found.</td>
              </tr>
            ) : (
              filteredSettlements.map((settlement, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={settlement.id} 
                  className="border-b border-border hover:bg-hover transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-6 font-medium text-foreground">{settlement.settlementNumber}</td>
                  <td className="py-4 px-6 text-foreground-muted">{settlement.settlementDate}</td>
                  <td className="py-4 px-6 text-foreground-muted">{settlement.partnerName}</td>
                  <td className="py-4 px-6 font-semibold text-foreground">${settlement.amount?.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={settlement.status} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-foreground-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                      <ArrowRight size={20} />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
