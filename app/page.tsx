import { redirect } from "next/navigation";

export default function Home() {
  // Default landing: go straight to a nearby page for a sensible default room.
  // This keeps the app starting on the Nearby page as requested.
  redirect("/nearby");
}
// Root now redirects to the Nearby page for a default room so the app starts there.
