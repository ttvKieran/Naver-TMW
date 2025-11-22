import { Suspense } from "react";
import roadmapsData from "@/data/career-roadmaps.json";
import RoadmapClient from "./RoadmapClient";
import type { RoadmapPhases } from "@/lib/roadmapGraph";

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ career?: string }>;
}) {
  const params = await searchParams;
  const careerParam = params.career;

  if (!careerParam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No Career Selected</h2>
          <p className="text-muted-foreground mb-4">Please select a career from the results page.</p>
          <a href="/career-advisor/results" className="text-primary hover:underline">Go to Results</a>
        </div>
      </div>
    );
  }

  const career = roadmapsData.careers.find(c => c.title === careerParam);

  if (!career) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Roadmap Not Found</h2>
          <p className="text-muted-foreground mb-4">We couldn't find a roadmap for "{careerParam}".</p>
          <a href="/career-advisor/results" className="text-primary hover:underline">Go back to Results</a>
        </div>
      </div>
    );
  }

  const roadmap = career.roadmap as RoadmapPhases;

  return (
    <RoadmapClient career={career} roadmap={roadmap} />
  );
}
