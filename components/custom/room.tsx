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

function statusToColor(status?: string) {
  const s = (status ?? "unknown").toLowerCase();
  switch (s) {
    case "available":
    case "free":
    case "vacant":
      return "bg-green-500";
    case "occupied":
    case "in use":
    case "busy":
      return "bg-red-500";
    case "reserved":
    case "booked":
      return "bg-yellow-500";
    case "maintenance":
    case "out of order":
      return "bg-gray-500";
    case "unknown":
    default:
      return "bg-gray-300";
  }
}

export default function Room({ name, status = "unknown" }: RoomProps) {
  const colorClass = statusToColor(status);

  return (
    <div className="flex items-center gap-3">
      <span className={`w-3 h-3 rounded-full ${colorClass}`} aria-hidden />
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{status}</div>
      </div>
    </div>
  );
}
