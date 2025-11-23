import { Suspense } from "react";
import RoadmapClient from "./RoadmapClient";
import type { RoadmapData, RoadmapStage, RoadmapArea, RoadmapItem } from "@/lib/roadmapGraph";
import connectDB from "@/lib/mongodb/connection";
import { Career, Roadmap } from "@/lib/mongodb/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper to transform MongoDB Roadmap to RoadmapData
function transformRoadmap(roadmapDoc: any): RoadmapData {
  if (!roadmapDoc || !roadmapDoc.levels) return [];

  return roadmapDoc.levels.map((level: any, levelIndex: number) => {
    const areas: RoadmapArea[] = [];

    if (level.phases) {
      level.phases.forEach((p: any, phaseIndex: number) => {
        const items: RoadmapItem[] = [];

        // Add skills as items
        if (p.skillsToLearn) {
          p.skillsToLearn.forEach((skill: any, i: number) => {
             if (skill.skillId) {
               items.push({
                 itemId: skill.skillId.skillId || `skill-${levelIndex}-${phaseIndex}-${i}`,
                 type: 'skill',
                 title: skill.skillId.name || "Unknown Skill",
                 subtitle: skill.priority,
                 description: skill.skillId.description,
                 category: 'skill',
                 skillTags: skill.skillTags,
                 prerequisites: skill.prerequisites,
                 requiredSkills: skill.requiredSkills,
                 estimatedHours: skill.estimatedHours
               });
             }
          });
        }

        // Add courses as items
        if (p.recommendedCourses) {
           p.recommendedCourses.forEach((course: any, i: number) => {
             if (course.courseId) {
               items.push({
                 itemId: course.courseId.courseId || `course-${levelIndex}-${phaseIndex}-${i}`,
                 type: 'course',
                 title: course.courseId.name || "Unknown Course",
                 subtitle: course.courseId.provider,
                 description: `Level: ${course.courseId.level}`,
                 category: 'course',
                 prerequisites: course.prerequisites,
                 estimatedHours: course.estimatedHours
               });
             }
           });
        }

        // Add milestones as items (projects)
        if (p.milestones) {
          p.milestones.forEach((m: any, i: number) => {
            items.push({
              itemId: `project-${levelIndex}-${phaseIndex}-${i}`,
              type: 'project',
              title: m.title,
              subtitle: 'Milestone',
              description: m.description,
              category: 'project',
              skillTags: m.skillTags,
              prerequisites: m.prerequisites,
              requiredSkills: m.requiredSkills,
              estimatedHours: m.estimatedHours
            });
          });
        }

        areas.push({
          areaId: p.phaseId || p._id.toString(),
          title: p.title,
          description: p.description,
          items
        });
      });
    }

    return {
      stageId: level.levelId || level._id.toString(),
      title: level.title,
      description: level.description,
      index: level.levelNumber,
      areas
    };
  });
}

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ career?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const studentId = (session?.user as any)?.studentId;

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

  await connectDB();

  // Find career by title (case insensitive)
  const careerDoc = await Career.findOne({ 
    title: { $regex: new RegExp(`^${careerParam}$`, 'i') } 
  })
  .populate('requiredSkills.skillId')
  .lean();

  if (!careerDoc) {
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

  const roadmapDoc = await Roadmap.findOne({ careerId: careerDoc._id })
    .populate('levels.phases.skillsToLearn.skillId')
    .populate('levels.phases.recommendedCourses.courseId')
    .lean();

  // Transform data for Client Component
  const roadmap = transformRoadmap(roadmapDoc);
  
  // Transform Career for Client Component
  const transformedCareer = {
    title: careerDoc.title,
    duration: careerDoc.overview?.timeToProficiency || "Unknown Duration",
    level: careerDoc.overview?.difficulty || "All Levels",
    skills: careerDoc.requiredSkills?.map((s: any) => s.skillId?.name) || [],
    certifications: careerDoc.certifications || []
  };

  return (
    <RoadmapClient 
      career={transformedCareer} 
      roadmap={roadmap} 
      studentId={studentId}
    />
  );
}
