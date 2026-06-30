"use client";

import dynamic from "next/dynamic";

const PrimlandExperience = dynamic(() => import("./PrimlandExperience"), {
  ssr: false,
  loading: () => (
    <main className="loading-screen">
      <div className="loading-mark" />
      <p>Preparing the mountain map</p>
    </main>
  )
});

export default function ExperienceLoader() {
  return <PrimlandExperience />;
}
