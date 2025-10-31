type RoomStatus =
  | "available"
  | "free"
  | "vacant"
  | "occupied"
  | "in use"
  | "busy"
  | "reserved"
  | "booked"
  | "maintenance"
  | "out of order"
  | "unknown"
  | string;

interface RoomProps {
  name: string;
  status?: RoomStatus;
}

function statusToParts(status?: string) {
  const s = (status ?? "unknown").toLowerCase();
  switch (s) {
    case "available":
    case "free":
    case "vacant":
      return {
        center: "bg-green-500",
        halo: "bg-green-500/40",
      };
    case "occupied":
    case "in use":
    case "busy":
      return {
        center: "bg-red-500",
        halo: "bg-red-500/40",
      };
    case "reserved":
    case "booked":
      return {
        center: "bg-yellow-500",
        halo: "bg-yellow-500/40",
      };
    case "maintenance":
    case "out of order":
      return {
        center: "bg-gray-500",
        halo: "bg-gray-500/30",
      };
    case "unknown":
    default:
      return {
        center: "bg-gray-300",
        halo: "bg-gray-300/20",
      };
  }
}

export default function RoomSmall({ name, status = "unknown" }: RoomProps) {
  const { center, halo } = statusToParts(status);

  return (
    <div className="flex items-center gap-3 border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-neutral-900">
      <div className="relative w-3 h-3 flex-none">
        <span
          className={`absolute inset-0 rounded-full ${halo} motion-safe:animate-halo`}
          aria-hidden
        />
        <div
          className={`${center} w-3 h-3 rounded-full relative z-10`}
          aria-hidden
        />
      </div>
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{status}</div>
      </div>
    </div>
  );
}
