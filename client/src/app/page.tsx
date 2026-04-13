"use client";

import SmartCAF from "@/components/SmartCAF";

export default function Home() {
  return (
    <SmartCAF onExit={() => console.log("Exit Portal")} />
  );
}
