import { useState } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const STATUS_OPTIONS = [
  "CREATED",
  "IN_PROGRESS",
  "COMPLETED",
  "INVOICED",
  "PAID",
  "CLOSED",
  "CANCELLED",
];

const UpdateTripStatusModal = ({
  isOpen,
  onClose,
  trip, // full trip object
  onSuccess, // refresh parent after update
}) => {

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [newStatus, setNewStatus] = useState(trip?.tripStatus || "");
  const [remarks, setRemarks] = useState("");
  const [updateDate, setUpdateDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    if (!newStatus) {
      alert("Please select new status");
      return;
    }

    try {
      setLoading(true);

      await axios.patch(
        `${API_URL}/fleet/trips/${trip.id}/status`,       
        {
          newStatus: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Status Updated Successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Update Trip Status</h2>
          <button onClick={onClose}>
            <FiX size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">

          {/* Target Trip */}
          <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">TARGET TRIP</p>
              <p className="font-semibold">
                TRP-{trip.tripNo || trip.id}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">CURRENT STATUS</p>
              <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                {trip.tripStatus}
              </span>
            </div>
          </div>

          {/* Current Status + Date */}
          {/* <div className="grid grid-cols-2 gap-4"> */}

            {/* <div>
              <label className="text-xs text-gray-500">
                CURRENT STATUS
              </label>
              <div className="mt-1 border rounded-lg p-3 bg-gray-100">
                {trip.tripStatus}
              </div>
            </div> */}

            {/* <div>
              <label className="text-xs text-gray-500">
                UPDATE DATE
              </label>
              <input
                type="date"
                value={updateDate}
                onChange={(e) => setUpdateDate(e.target.value)}
                className="mt-1 w-full border rounded-lg p-3"
              />
            </div> */}
          {/* </div> */}

          {/* New Status */}
          <div>
            <label className="text-xs text-gray-500">
              NEW STATUS
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mt-1 w-full border rounded-lg p-3"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          {/* <div>
            <label className="text-xs text-gray-500">
              REMARKS / INTERNAL NOTES
            </label>
            <textarea
              placeholder="Enter reason for status change or internal notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 w-full border rounded-lg p-3 h-24"
            />
          </div> */}

        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-6 py-2 bg-[#0A1A3E] text-white rounded-lg hover:bg-[#132a63]"
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpdateTripStatusModal;