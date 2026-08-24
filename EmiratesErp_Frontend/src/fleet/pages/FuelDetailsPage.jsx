import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  ArrowRight,
  Edit, 
  Trash2, 
  Fuel, 
  User, 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  CircleDollarSign,
  Droplet,
  FileText,
  Upload
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const FuelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchEntry = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const response = await axios.get(`${API_URL}/fleet/fuel/${id}`, { headers });
      setEntry(response.data);
    } catch (error) {
      console.error('Error fetching fuel details:', error);
      toast.error('Failed to load fuel details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this fuel entry?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/fuel/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Fuel entry deleted successfully");
      navigate('/fleet-dashboard/fuel');
    } catch (error) {
      console.error("Error deleting fuel entry:", error);
      toast.error("Failed to delete fuel entry");
    }
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile) return;
    setUploading(true);
    try {
      const fileData = new FormData();
      fileData.append('file', receiptFile);
      await axios.post(`${API_URL}/fleet/fuel/${id}/upload-receipt`, fileData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Receipt photo uploaded successfully");
      fetchEntry();
    } catch (error) {
      console.error("Error uploading receipt:", error);
      toast.error("Failed to upload receipt photo");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل تفاصيل الوقود...' : 'Loading fuel details...'}
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="w-full p-8 text-center text-xs text-rose-500 font-bold">
        Fuel log entry not found.
      </div>
    );
  }

  const pricePerLiter = entry.amountAed && entry.quantityLiters 
    ? (entry.amountAed / entry.quantityLiters).toFixed(3) 
    : 'N/A';

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-card,#ffffff)] p-3 sm:p-4 rounded-xl border border-[var(--color-border,#D7E3EE)] shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/fuel')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D7E3EE)] flex items-center justify-center text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <Fuel className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-none font-mono">
                FUEL LOG #{entry.id}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-amber-50 text-amber-700 border border-amber-200">
                {entry.fuelType || 'DIESEL'}
              </span>
            </div>
            <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-1">
              Vehicle: <span className="font-semibold text-[var(--color-foreground,#102A43)] font-mono">{entry.vehiclePlateNumber || entry.vehicle?.plateNumber || '–'}</span> • Station: <span className="font-semibold text-[var(--color-foreground,#102A43)]">{entry.fuelStation || 'ADNOC Station'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/fleet-dashboard/fuel/fuel-form/${entry.id}`)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit className="w-3.5 h-3.5 text-[var(--color-foreground,#102A43)]" />
            <span>{t('fleet.fuelDetails.editEntry') || 'Edit Entry'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Vehicle & Driver */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">VEHICLE & DRIVER</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 font-mono truncate">{entry.vehiclePlateNumber || entry.vehicle?.plateNumber || 'N/A'}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">{entry.driverName || entry.driver?.name || 'Assigned Driver'}</p>
          </div>
        </div>

        {/* Fuel Type & Station */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Fuel className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">TYPE & STATION</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{entry.fuelType || 'DIESEL'}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">{entry.fuelStation || 'ADNOC Station'}</p>
          </div>
        </div>

        {/* Quantity & Amount */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">QUANTITY & SPEND</p>
            <p className="text-xs font-extrabold text-emerald-600 leading-tight my-0.5 font-mono truncate">{entry.amountAed} AED ({entry.quantityLiters} L)</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] font-mono truncate">Rate: {pricePerLiter} AED/L</p>
          </div>
        </div>

        {/* Odometer & Date */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">ODOMETER & DATE</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 font-mono truncate">{entry.odometerReading ? `${entry.odometerReading} KM` : 'N/A'}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] font-mono">{entry.fuelDate}</p>
          </div>
        </div>

      </div>

      {/* Main Specifications Section */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs space-y-4">
        <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
          <h2 className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] tracking-wider uppercase">FUEL FILL SPECIFICATIONS & RECEIPT PHOTO</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Station Name</p>
            <p className="font-bold text-[var(--color-foreground,#102A43)] mt-1">{entry.fuelStation || 'ADNOC Station'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Calculated Unit Rate</p>
            <p className="font-bold font-mono text-[var(--color-foreground,#102A43)] mt-1">{pricePerLiter} AED / Liter</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Remarks / Notes</p>
            <p className="font-bold text-[var(--color-foreground,#102A43)] mt-1">{entry.notes || '–'}</p>
          </div>
        </div>

        {/* Receipt Attachment Section */}
        <div className="pt-3 border-t border-[var(--color-border,#E4EAF4)] space-y-2">
          <p className="text-[11px] font-bold text-[var(--color-foreground,#102A43)]">Receipt Image / Attachment</p>
          {entry.receiptPhotoPath ? (
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-[var(--color-border,#D7E3EE)]">
              <FileText className="w-5 h-5 text-[var(--color-primary,#0178BC)]" />
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-bold text-[var(--color-foreground,#102A43)] truncate">Receipt Attached</p>
                <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] font-mono truncate">{entry.receiptPhotoPath}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files[0])}
                className="text-xs text-[var(--color-foreground,#102A43)] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-[var(--color-primary,#0178BC)]"
              />
              {receiptFile && (
                <button
                  onClick={handleReceiptUpload}
                  disabled={uploading}
                  className="px-3 py-1 bg-[#00A9A8] hover:bg-[#009190] text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions Bottom Bar */}
      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--color-border,#D7E3EE)]">
        <button 
          onClick={handleDelete}
          className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Entry
        </button>
      </div>

    </div>
  );
};

export default FuelDetailsPage;
