import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AppButton from "../components/dashboard/AppButton";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CustomSection from "../components/customFormComponents/CustomSection";
import CustomInput from "../components/customFormComponents/CustomInput";
import CustomSelect from "../components/customFormComponents/CustomSelect";

const initialFormValues = {
  tripDate: "",
  driverId: "",
  containerNumber: "",
  startTime: "",
  estimatedEndTime: "",
  cargoType: "",
  loadWeightKg: "",
  vehicleId: "",
  remarks: "",
  customerId: "",
  customerRefJobNo: "",
  contactPerson: "",
  customerType: "company",
  amount: "",
  tokenAmount: "",
  otherCharges: "",
  otherChargeType: "",
  tokenPaymentMethod: "",
  chequeNumber: "",
  otherReference: "",
  receivedBy: "",
  vendorId: "",
  vendorAmount: "",
  fromLocation: "",
  toLocation: "",
  routeId: "",
};



const TripForm = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [currentStep, setCurrentStep] = useState(1);
  const [isOutsourced, setIsOutsourced] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTrip, setFetchingTrip] = useState(false);
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const tripId = routeId || searchParams.get("id");
  const isEditMode = Boolean(tripId);
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(initialFormValues);

  const steps = [
    { id: 1, title: "Trip Manifest", description: "Logistics & Cargo" },
    { id: 2, title: "Customer Details", description: "Client Information" },
    { id: 3, title: "Financials", description: "Billing & Outsourcing" },
  ];

  const fetchTripById = async () => {
    if (!tripId) return;

    try {
      setFetchingTrip(true);
      const response = await axios.get(`${API_URL}/fleet/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const trip = response.data;

      setFormValues({
        tripDate: trip.tripDate || "",
        driverId: trip.driverId || trip.driver?.id || "",
        containerNumber: trip.containerNumber || "",
        fromLocation: trip.fromLocation || "",
        toLocation: trip.toLocation || "",
        remarks: trip.remarks || "",
        startTime: trip.startTime || "",
        estimatedEndTime: trip.estimatedEndTime || "",
        cargoType: trip.cargoType || "",
        loadWeightKg: trip.loadWeightKg || "",
        vehicleId: trip.vehicleId || "",
        customerId: trip.customerId || trip.customer?.id || "",
        customerRefJobNo: trip.customerRefJobNo || "",
        contactPerson: trip.contactPerson || "",
        customerType: trip.customerType || "company",
        amount: trip.amount ?? "",
        tokenAmount: trip.tokenAmount ?? "",
        otherCharges: trip.otherCharges ?? "",
        otherChargeType: trip.otherChargeType || "",
        tokenPaymentMethod: trip.tokenPaymentMethod || "",
        chequeNumber: trip.chequeNumber || "",
        otherReference: trip.otherReference || "",
        receivedBy: trip.receivedBy || "",
        vendorId: trip.vendorId || trip.vendor?.id || "",
        vendorAmount: trip.vendorAmount ?? "",
        routeId: trip.routeId || trip.route?.id || "",
      });
      setIsOutsourced(Boolean(trip.vendorId || trip.vendor?.id || trip.vendorAmount));
    } catch (error) {
      console.error("Error fetching trip:", error);
      toast.error("Error fetching trip details.");
    } finally {
      setFetchingTrip(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-fill logic for Route
    if (name === "routeId" && value) {
      const selectedRoute = routes.find(r => r.id === Number(value));
      if (selectedRoute) {
        setFormValues(prev => ({
          ...prev,
          routeId: value,
          fromLocation: selectedRoute.fromLocation || prev.fromLocation,
          toLocation: selectedRoute.toLocation || prev.toLocation
        }));
        return;
      }
    }

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Clean data: convert empty strings to null for numeric/ID fields
      const cleanedValues = { ...formValues };
      ["driverId", "vehicleId", "customerId", "amount", "tokenAmount", "otherCharges", "vendorAmount"].forEach(key => {
        if (cleanedValues[key] === "") cleanedValues[key] = null;
      });

      const response = await axios({
        method: isEditMode ? "put" : "post",
        url: isEditMode ? `${API_URL}/fleet/trips/${tripId}` : `${API_URL}/fleet/trips`,
        data: cleanedValues,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
      });

      navigate('/fleet-dashboard/trips');
      toast.success(isEditMode ? "Trip updated successfully" : "Trip created successfully");
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} trip:`, error);
      toast.error(`Error ${isEditMode ? "updating" : "creating"} trip.`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  useEffect(() => {
    fetchDrivers();
    fetchCustomers();
    fetchVehicles();
    fetchRoutes();
  }, []);

  useEffect(() => {
    fetchTripById();
  }, [tripId]);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/drivers/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };
  const fetchCustomers = async () => {
    try {
      const CustomerResponse = await axios.get(`${API_URL}/fleet/trip-customers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCustomers(CustomerResponse.data);
    } catch (error) { 
      console.error("Error fetching customers:", error);
    }
  };
  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/vehicles/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/routes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRoutes(response.data);
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black text-foreground-muted uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/fleet-dashboard/trips')}>TRIPS</span>
            <span className="text-[10px] font-black text-foreground-muted opacity-50 uppercase tracking-widest">/ {isEditMode ? "UPDATE TRIP" : "CREATE NEW TRIP"}</span>
          </div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tight">
            {isEditMode ? "Update Trip" : "Trip Registration"}
          </h1>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center gap-4 bg-card p-2 rounded-theme border border-border shadow-sm">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3 px-4 py-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${
                currentStep === step.id 
                ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" 
                : currentStep > step.id 
                ? "bg-success text-white" 
                : "bg-background-muted text-foreground-muted border border-border"
              }`}>
                {currentStep > step.id ? "✓" : step.id}
              </div>
              <div className="hidden lg:block">
                <p className={`text-[10px] font-black uppercase tracking-widest ${currentStep === step.id ? "text-primary" : "text-foreground-muted opacity-50"}`}>
                  {step.title}
                </p>
                <p className="text-[9px] font-bold text-foreground-muted opacity-40 uppercase">
                  {step.description}
                </p>
              </div>
              {step.id < steps.length && (
                <div className="w-8 h-px bg-border ml-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {fetchingTrip && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary animate-pulse">
          Loading trip details...
        </div>
      )}

      {/* Step Content */}
      <div className="animate-fade-in-up">
        {currentStep === 1 && (
          <CustomSection number="01" title="Trip Manifest & Logistics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CustomInput label="Trip Date" type="date" name="tripDate" value={formValues.tripDate} onChange={handleChange} />
              {/* <CustomSelect label="Driver" name="driverId" value={formValues.driverId} onChange={handleChange}>
                <option value="" disabled>Select Driver</option>
                {drivers.filter(d => d.status === 'AVAILABLE' || d.id === formValues.driverId).map(d => (
                  <option key={d.id} value={d.id}>{d.name} {d.status !== 'AVAILABLE' ? `(${d.status})` : ''}</option>
                ))}
              </CustomSelect>
              <CustomSelect label="Vehicle" name="vehicleId" value={formValues.vehicleId} onChange={handleChange}>
                <option value="">Select Vehicle</option>
                {vehicles.filter(v => v.vehicleStatus === 'ACTIVE' || v.id === formValues.vehicleId).map(v => (
                  <option key={v.id} value={v.id}>{v.plateNumber} ({v.make}) {v.vehicleStatus !== 'ACTIVE' ? `(${v.vehicleStatus})` : ''}</option>
                ))}
              </CustomSelect> */}
              <CustomInput label="Start Date & Time" type="datetime-local" name="startTime" value={formValues.startTime} onChange={handleChange} />
              <CustomInput label="Est. End Date & Time" type="datetime-local" name="estimatedEndTime" value={formValues.estimatedEndTime} onChange={handleChange} />
              <CustomInput label="Cargo Type" placeholder="General Cargo" name="cargoType" value={formValues.cargoType} onChange={handleChange} />
              <CustomInput label="Load Weight (Kg)" type="number" name="loadWeightKg" value={formValues.loadWeightKg} onChange={handleChange} />
              <CustomInput label="Container Number" name="containerNumber" value={formValues.containerNumber} onChange={handleChange} />
              <CustomSelect label="Pre-planned Route" name="routeId" value={formValues.routeId} onChange={handleChange}>
                <option value="">Manual Entry (No Template)</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.routeName} ({r.fromLocation} → {r.toLocation})</option>
                ))}
              </CustomSelect>
              <CustomInput label="From Location" name="fromLocation" value={formValues.fromLocation} onChange={handleChange} />
              <CustomInput label="To Location" name="toLocation" value={formValues.toLocation} onChange={handleChange} />
              <div className="md:col-span-2 lg:col-span-3">
                <CustomInput label="Remarks" name="remarks" value={formValues.remarks} onChange={handleChange} />
              </div>
            </div>
          </CustomSection>
        )}

        {currentStep === 2 && (
          <CustomSection number="02" title="Customer Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CustomSelect label="Customer" name="customerId" value={formValues.customerId} onChange={handleChange}>
                <option value="" disabled>Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </CustomSelect>
              <CustomInput label="Customer Ref / Job No" name="customerRefJobNo" value={formValues.customerRefJobNo} onChange={handleChange} />
              <CustomInput label="Contact Person" name="contactPerson" value={formValues.contactPerson} onChange={handleChange} />
              
              <div className="space-y-3 p-4 bg-background-muted rounded-theme border border-border/50 shadow-inner">
                <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest">Customer Type</label>
                <div className="flex gap-8">
                  {["company", "individual"].map(type => (
                    <label key={type} className="flex items-center gap-3 text-sm font-black text-foreground cursor-pointer group uppercase tracking-tight">
                      <input
                        type="radio"
                        name="customerType"
                        value={type}
                        checked={formValues.customerType === type}
                        onChange={handleChange}
                        className="accent-primary h-5 w-5 transition-transform group-hover:scale-110"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CustomSection>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            <CustomSection number="03" title="Financials & Payment" special={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CustomInput label="Base Amount (AED)" name="amount" value={formValues.amount} onChange={handleChange} />
                <CustomInput label="Toll / Advance" name="tokenAmount" value={formValues.tokenAmount} onChange={handleChange} />
                <CustomInput label="Other Charges" name="otherCharges" value={formValues.otherCharges} onChange={handleChange} />
                <CustomSelect label="Charge Type" name="otherChargeType" value={formValues.otherChargeType} onChange={handleChange}>
                  <option value="" disabled>Select Type</option>
                  {["INSPECTION", "WAITING", "COMMISSION", "TOKEN_CANCELLATION", "OTHER"].map(t => <option key={t} value={t}>{t}</option>)}
                </CustomSelect>
                <CustomSelect label="Payment Method" name="tokenPaymentMethod" value={formValues.tokenPaymentMethod} onChange={handleChange}>
                  <option value="">Select Method</option>
                  {["CASH", "BANK_TRANSFER", "CHEQUE", "ONLINE"].map(m => <option key={m} value={m}>{m}</option>)}
                </CustomSelect>
                <CustomInput label="Cheque Number" name="chequeNumber" value={formValues.chequeNumber} onChange={handleChange} />
                <CustomInput label="Reference ID" name="otherReference" value={formValues.otherReference} onChange={handleChange} />
                <CustomInput label="Received By" name="receivedBy" value={formValues.receivedBy} onChange={handleChange} />
              </div>
            </CustomSection>

            <CustomSection number="04" title="Vendor Assignment">
              <div className="flex items-center justify-between p-5 bg-background-muted rounded-theme border border-border shadow-inner">
                <div>
                  <p className="text-sm font-black text-foreground uppercase tracking-tight">Outsource trip to third-party vendor?</p>
                  <p className="text-[10px] text-foreground-muted font-bold uppercase mt-1 opacity-50">Enable to assign this manifest to an external partner</p>
                </div>
                <input
                  type="checkbox"
                  checked={isOutsourced}
                  onChange={() => setIsOutsourced(!isOutsourced)}
                  className="h-7 w-7 accent-primary cursor-pointer transition-all active:scale-90"
                />
              </div>

              {isOutsourced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-6 border border-primary/20 bg-primary/5 rounded-theme animate-scale-in">
                  <CustomSelect label="Select Vendor" name="vendorId" value={formValues.vendorId} onChange={handleChange}>
                    <option value="">Select Vendor</option>
                  </CustomSelect>
                  <CustomInput label="Vendor Amount (AED)" type="number" name="vendorAmount" value={formValues.vendorAmount} onChange={handleChange} />
                </div>
              )}
            </CustomSection>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-border">
        <button 
          className="text-[10px] font-black text-foreground-muted uppercase tracking-widest hover:text-error transition-colors flex items-center gap-2 group"
          onClick={() => navigate(-1)}
        >
          <span className="opacity-0 group-hover:opacity-100 transition-all">←</span> Exit Form
        </button>

        <div className="flex items-center gap-4">
          {currentStep > 1 && (
            <button 
              onClick={prevStep}
              className="px-8 py-2.5 rounded-theme text-[10px] font-black uppercase tracking-widest text-foreground bg-card border border-border hover:bg-background-muted transition-all active:scale-95"
            >
              Previous
            </button>
          )}
          
          {currentStep < steps.length ? (
            <AppButton onClick={nextStep} className="px-12">
              Next Step
            </AppButton>
          ) : (
            <AppButton onClick={handleSubmit} disabled={loading || fetchingTrip} className="px-12">
              {loading ? "Saving..." : isEditMode ? "Update Manifest" : "Submit Manifest"}
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripForm;
