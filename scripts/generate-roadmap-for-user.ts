// Script to generate personalized roadmap for existing user
import connectDB from '../lib/mongodb/connection';
import { Student } from '../lib/mongodb/models/Student';
import { PersonalizedRoadmap } from '../lib/mongodb/models/PersonalizedRoadmap';

const CLOVA_RAG_ROADMAP_URL = 'http://localhost:8001/roadmap/personalized';

// Transform API response from snake_case to camelCase
function transformRoadmapData(data: any): any {
  if (!data || !data.stages) return data;
  
  return {
    ...data,
    career_id: data.career_id,
    career_name: data.career_name,
    stages: data.stages.map((stage: any) => ({
      ...stage,
      orderIndex: stage.order_index || stage.orderIndex || 0,
      recommendedSemesters: stage.recommended_semesters || stage.recommendedSemesters,
      areas: (stage.areas || []).map((area: any) => ({
        ...area,
        orderIndex: area.order_index || area.orderIndex,
        items: (area.items || []).map((item: any) => ({
          ...item,
          itemType: item.item_type || item.itemType,
          skillTags: item.skill_tags || item.skillTags,
          requiredSkills: item.required_skills || item.requiredSkills,
          estimatedHours: item.estimated_hours || item.estimatedHours,
          orderIndex: item.order_index || item.orderIndex,
          personalization: item.personalization ? {
            status: item.personalization.status,
            priority: item.personalization.priority,
            personalizedDescription: item.personalization.personalized_description || item.personalization.personalizedDescription,
            reason: item.personalization.reason,
          } : undefined,
        })),
      })),
    })),
  };
}

async function callClovaRagRoadmap(userId: string, jobname: string): Promise<any> {
  const response = await fetch(CLOVA_RAG_ROADMAP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      jobname: jobname,
    }),
  });

  if (!response.ok) {
    throw new Error(`CLOVA RAG Roadmap failed: ${await response.text()}`);
  }

  return await response.json();
}

async function generateRoadmapForUser(studentId: string) {
  try {
    await connectDB();

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      console.error('Student not found:', studentId);
      return;
    }

    console.log('Found student:', student.fullName);
    console.log('Career:', student.career?.actualCareer);

    // Call CLOVA RAG API
    console.log('Calling CLOVA RAG API...');
    const rawData = await callClovaRagRoadmap(
      studentId,
      student.career?.actualCareer || 'Full Stack Developer'
    );

    if (!rawData || !rawData.stages) {
      console.error('No roadmap data received');
      return;
    }
    
    // Transform snake_case to camelCase
    const personalizedRoadmapData = transformRoadmapData(rawData);

    console.log('Roadmap received with', personalizedRoadmapData.stages.length, 'stages');

    // Check if roadmap already exists
    const existing = await PersonalizedRoadmap.findOne({
      studentId: student._id,
      isActive: true,
    });

    if (existing) {
      console.log('Deactivating existing roadmap...');
      existing.isActive = false;
      await existing.save();
    }

    // Save new roadmap
    const personalizedRoadmap = new PersonalizedRoadmap({
      studentId: student._id,
      roadmapId: null,
      
      careerID: personalizedRoadmapData.career_id || student.career?.targetCareerID || '',
      careerName: personalizedRoadmapData.career_name || student.career?.actualCareer || '',
      
      description: personalizedRoadmapData.description || `Personalized learning roadmap`,
      generatedAt: new Date(),
      lastUpdated: new Date(),
      
      stages: personalizedRoadmapData.stages,
      
      overallProgress: {
        totalItems: 0,
        completedItems: 0,
        inProgressItems: 0,
        percentageComplete: 0,
      },
      
      generationSource: {
        model: 'HCX-007',
        generatedBy: 'clova-rag',
        confidence: 0.85,
        apiVersion: 'v1',
      },
      
      isActive: true,
    });

    await personalizedRoadmap.save();
    console.log('✅ Personalized roadmap saved successfully!');
    console.log('Roadmap ID:', personalizedRoadmap._id);

  } catch (error) {
    console.error('Error generating roadmap:', error);
  } finally {
    process.exit(0);
  }
}

// Run with studentId from command line
const studentId = process.argv[2] || '6922128ff907a50cc7236b99';
console.log('Generating roadmap for student:', studentId);
generateRoadmapForUser(studentId);
