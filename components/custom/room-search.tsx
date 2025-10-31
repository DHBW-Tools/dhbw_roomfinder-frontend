"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RoomSearch({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const router = useRouter();

  const go = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const id = value.trim();
    if (!id) return;
    router.push(`/nearby?room=${encodeURIComponent(id)}`);
  };

  return (
    <form onSubmit={go} className="mb-4">
      <div className="flex gap-2">
        <input
          aria-label="Room id"
          className="px-3 py-2 border rounded-md w-48"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter room id (e.g. A244)"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </form>
  );
}
