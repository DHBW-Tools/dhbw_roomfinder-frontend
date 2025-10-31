import { Item } from "@/components/ui/item";
import Room from "@/components/custom/room";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full flex items-center justify-center h-screen">
      <Item>
        <Room name="A265" status="free"></Room>
        <Room name="A266" status="reserved"></Room>
      </Item>
    </div>
  );
}
