"use client";

import dynamic from "next/dynamic";

const OurikaExperience = dynamic(() => import("./OurikaExperience"), {
  ssr: false,
  loading: () => (
    <main className="loading-screen">
      <div className="loading-mark" />
      <p>Preparing the UP map</p>
    </main>
  )
});

export default function ExperienceLoader() {
  return <OurikaExperience />;
}
