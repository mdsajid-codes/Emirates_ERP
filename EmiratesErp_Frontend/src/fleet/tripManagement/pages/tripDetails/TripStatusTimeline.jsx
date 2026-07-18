import {
  FiCheck,
  FiTruck,
  FiFileText,
  FiDollarSign,
  FiArchive,
  FiXCircle,
} from "react-icons/fi";

const STATUSES = [
  "CREATED",
  "IN_PROGRESS",
  "COMPLETED",
  "INVOICED",
  "PAID",
  "CLOSED",
];

const statusIcons = {
  CREATED: <FiCheck size={16} />,
  IN_PROGRESS: <FiTruck size={16} />,
  COMPLETED: <FiCheck size={16} />,
  INVOICED: <FiFileText size={16} />,
  PAID: <FiDollarSign size={16} />,
  CLOSED: <FiArchive size={16} />,
  CANCELLED: <FiXCircle size={16} />,
};

const TripStatusTimeline = ({ status, createdAt }) => {
  if (!status) return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
      <div className="animate-pulse flex flex-col gap-4">
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  // If cancelled → show single red state
  if (status === "CANCELLED") {
    return (
      <div className="bg-white rounded-xl p-6 border border-red-200 mt-6">
        <div className="flex items-center gap-3 text-red-600 font-semibold">
          <FiXCircle />
          Trip Cancelled
        </div>
      </div>
    );
  }

  const currentIndex = STATUSES.indexOf(status);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <h3 className="font-semibold text-gray-700 mb-8">
        Trip Status Timeline
      </h3>

      <div className="relative flex items-center justify-between">

        {/* Background Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded"></div>

        {/* Active Progress Line */}
        <div
          className="absolute top-5 left-0 h-1 bg-orange-400 rounded transition-all duration-500"
          style={{
            width: `${(currentIndex / (STATUSES.length - 1)) * 100}%`,
          }}
        ></div>

        {STATUSES.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={step}
              className="relative flex flex-col items-center text-center w-full"
            >
              {/* Circle */}
              <div
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full border-2 z-10
                  ${
                    isCompleted
                      ? "bg-orange-400 border-orange-400 text-white"
                      : isCurrent
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }
                `}
              >
                {isCompleted || isCurrent
                  ? statusIcons[step]
                  : index + 1}
              </div>

              {/* Label */}
              <div className="mt-3">
                <p
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-gray-700"
                      : "text-gray-400"
                  }`}
                >
                  {step.replace("_", " ")}
                </p>

                {isCurrent && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Current State
                  </p>
                )}

                {step === "CREATED" && createdAt && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TripStatusTimeline;