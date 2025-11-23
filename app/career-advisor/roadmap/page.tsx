import { Suspense } from "react";
import RoadmapClient from "./RoadmapClient";
import type { RoadmapData, RoadmapStage, RoadmapArea, RoadmapItem } from "@/lib/roadmapGraph";
import connectDB from "@/lib/mongodb/connection";
import { Career, Roadmap, PersonalizedRoadmap } from "@/lib/mongodb/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from 'fs';
import path from 'path';

// Helper to transform Personalized Roadmap to RoadmapData
function transformPersonalizedRoadmap(roadmapDoc: any): RoadmapData {
  if (!roadmapDoc || !roadmapDoc.stages) return [];

  return roadmapDoc.stages.map((stage: any, stageIndex: number) => {
    const areas: RoadmapArea[] = [];

    if (stage.areas) {
      stage.areas.forEach((area: any, areaIndex: number) => {
        const items: RoadmapItem[] = [];

        if (area.items) {
          area.items.forEach((item: any, itemIndex: number) => {
            items.push({
              itemId: item.id || `item-${stageIndex}-${areaIndex}-${itemIndex}`,
              type: (item.itemType as any) || 'skill',
              category: (item.itemType as any) || 'skill',
              title: item.name,
              subtitle: item.personalization?.status ? item.personalization.status.replace('_', ' ') : 'Recommended',
              description: item.description,
              skillTags: item.skillTags,
              prerequisites: item.prerequisites,
              requiredSkills: item.requiredSkills,
              estimatedHours: item.estimatedHours,
              check: item.check,
              personalization: {
                ...item.personalization,
                priority: item.personalization?.priority?.toString()
              }
            });
          });
        }

        areas.push({
          areaId: area.id || `area-${stageIndex}-${areaIndex}`,
          title: area.name,
          description: area.description,
          items
        });
      });
    }

    return {
      stageId: stage.id || `stage-${stageIndex}`,
      title: stage.name,
      description: stage.description,
      index: stage.orderIndex || stageIndex + 1,
      areas
    };
  });
}

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

  // Try to find personalized roadmap first
  let roadmap: RoadmapData | null = null;
  let isPersonalized = false;

  if (studentId) {
    const personalizedDoc = await PersonalizedRoadmap.findOne({
      studentId: studentId,
      careerID: careerDoc.careerId
    }).sort({ generatedAt: -1 }).lean();

    if (personalizedDoc) {
      roadmap = transformPersonalizedRoadmap(personalizedDoc);
      isPersonalized = true;
    }
  }

  // Fallback to base roadmap if no personalized roadmap found
  if (!roadmap) {
    const roadmapDoc = await Roadmap.findOne({ careerId: careerDoc._id })
      .populate('levels.phases.skillsToLearn.skillId')
      .populate('levels.phases.recommendedCourses.courseId')
      .lean();
    
    if (roadmapDoc) {
      roadmap = transformRoadmap(roadmapDoc);
    } else {
      // Fallback to reading from JSON file in clova-rag-roadmap/data/jobs
      try {
        const jsonPath = path.join(process.cwd(), 'clova-rag-roadmap', 'data', 'jobs', `${careerDoc.careerId}.json`);
        if (fs.existsSync(jsonPath)) {
          const fileContent = fs.readFileSync(jsonPath, 'utf-8');
          const jsonRoadmap = JSON.parse(fileContent);
          roadmap = transformPersonalizedRoadmap(jsonRoadmap);
        }
      } catch (error) {
        console.error("Error reading roadmap JSON file:", error);
      }
    }
  }

  // Transform Career for Client Component
  const transformedCareer = {
    title: careerDoc.title,
    duration: careerDoc.overview?.timeToProficiency || "Unknown Duration",
    level: careerDoc.overview?.difficulty || "All Levels",
    skills: careerDoc.requiredSkills?.map((s: any) => s.skillId?.name) || [],
    certifications: careerDoc.certifications || [],
    isPersonalized // Pass this flag to client
  };

  if (!roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Roadmap Content Not Found</h2>
          <p className="text-muted-foreground mb-4">We found the career but couldn't load the roadmap content.</p>
          <a href="/dashboard" className="text-primary hover:underline">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <RoadmapClient 
      career={transformedCareer} 
      roadmap={roadmap} 
      studentId={studentId}
    />
  );
}
