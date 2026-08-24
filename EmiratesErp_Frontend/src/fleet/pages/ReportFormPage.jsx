import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  X, 
  Save, 
  BarChart3, 
  Calendar, 
  Filter, 
  FileText, 
  CheckCircle2, 
  Download,
  DollarSign,
  Truck,
  User
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const ReportFormPage = () => {
  const navigate = useNavigate();
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const id = pathId || searchParams.get('id');
  const isEditing = Boolean(id);
  
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    reportScope: 'DRIVER_PERFORMANCE',
    timeFilter: 'MONTH',
    startDate: '',
    endDate: '',
    format: 'CSV',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    toast.success("Custom report configuration saved");
    setTimeout(() => {
      setSubmitting(false);
      navigate('/fleet-dashboard/trip-reports');
    }, 500);
  };

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-tight">
            {isEditing ? (t('fleet.reportForm.editTitle') || 'Edit Report Configuration') : (t('fleet.reportForm.addTitle') || 'Generate Custom Report')}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">
            {t('fleet.reportForm.subtitle') || 'Configure module scope, timeframe filters, and analytical metrics across UAE'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fleet-dashboard/trip-reports')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-[var(--color-foreground,#102A43)]" />
          <span>{t('fleet.driverForm.cancel') || 'Cancel'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Row 1: Section 1 & Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 1: Report Scope & Category */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Report Scope & Target Module</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Target Report Module *</label>
                <select
                  name="reportScope"
                  value={formData.reportScope}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="DRIVER_PERFORMANCE">DRIVER PERFORMANCE & COMMISSION</option>
                  <option value="CUSTOMER_BILLING">CUSTOMER BILLING & REVENUE</option>
                  <option value="VENDOR_LIABILITIES">VENDOR LIABILITIES & EXPENSES</option>
                  <option value="FUEL_CONSUMPTION">FUEL CONSUMPTION & EFFICIENCY</option>
                  <option value="MAINTENANCE_COSTS">MAINTENANCE & WORKSHOP COSTS</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Export Format</label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="CSV">EXCEL / CSV DOCUMENT</option>
                  <option value="PDF">PDF EXECUTIVE SUMMARY</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Timeframe & Dates */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Timeframe & Custom Date Filter</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Timeframe Period</label>
                <select
                  name="timeFilter"
                  value={formData.timeFilter}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="WEEK">THIS WEEK</option>
                  <option value="MONTH">THIS MONTH</option>
                  <option value="YEAR">THIS YEAR</option>
                  <option value="CUSTOM">CUSTOM DATE RANGE</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Section 3: Notes & Instructions */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
            <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Recipient Remarks & Analytics Notes</h2>
          </div>

          <div>
            <textarea
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Optional remarks or notes to include in the exported report header..."
              className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate('/fleet-dashboard/trip-reports')}
            className="px-5 py-2 border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] rounded-xl text-xs font-bold text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            {t('fleet.driverForm.cancel') || 'Cancel'}
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#00A9A8] hover:bg-[#009190] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{submitting ? 'Generating...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default ReportFormPage;
