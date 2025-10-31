import NearbyList from "../../components/custom/nearby-list";
import RoomSearch from "../../components/custom/room-search";

type Props = {
  searchParams?:
    | { [key: string]: string | string[] | undefined }
    | Promise<any>;
};

export default async function Page({ searchParams }: Props) {
  const resolved = (await searchParams) ?? {};
  let roomId = undefined as string | undefined;
  if (resolved?.room) {
    roomId = Array.isArray(resolved.room) ? resolved.room[0] : resolved.room;
  }
  if (!roomId) roomId = "";

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <RoomSearch initial={roomId} />
      <h1 className="text-2xl font-semibold mb-4">Nearby rooms for {roomId}</h1>
      {/* NearbyList is a client component that will fetch from NEXT_PUBLIC_API_BASE */}
      <NearbyList roomId={roomId} />
    </div>
  );
}
