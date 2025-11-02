"use client";

import React, { useEffect, useState } from "react";
import Room from "@/components/custom/room-card";

type NearestRoom = {
  id: string;
  distance?: number;
  free_now?: boolean;
};

export default function NearbyList({ roomId }: { roomId: string }) {
  const [rooms, setRooms] = useState<NearestRoom[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const base =
          process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
        const res = await fetch(
          `${base}/api/v1/rooms/nearest?room=${encodeURIComponent(
            roomId
          )}&limit=10`
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!cancelled) setRooms(data.rooms ?? []);
      } catch (err: unknown) {
        if (!cancelled) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError(String(err));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  if (loading) return <div className="p-4">Loading nearby rooms…</div>;
  if (error)
    return (
      <div className="p-4 text-red-600">
        Error loading nearby rooms: {error}
      </div>
    );
  if (!rooms || rooms.length === 0)
    return <div className="p-4">No nearby rooms found.</div>;

  return (
    <div className="space-y-3 p-4">
      {rooms.map((r) => (
        <div key={r.id} className="flex items-center justify-between">
          <div className="flex-1">
            <Room name={r.id} status={r.free_now ? "available" : "occupied"} />
          </div>
          <div className="ml-3 text-sm text-gray-600">
            {r.distance != null ? `${r.distance} m` : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}
