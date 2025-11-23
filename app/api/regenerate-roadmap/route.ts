import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import { Student, PersonalizedRoadmap } from '@/lib/mongodb/models';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'https://clovax-456m.vercel.app';
const HCX_007_URL = 'https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-007';
const NCP_API_KEY = process.env.NCP_API_KEY;

// Helper function to map career to job file
function mapCareerToJobFile(career: string): string {
  const careerMap: Record<string, string> = {
    'Data Science': 'data_scientist',
    'Machine Learning': 'machine_learning',
    'Software Engineering': 'full_stack_developer',
    'Information Technology': 'full_stack_developer',
    'Data Analysis': 'data_analyst',
    'Business Intelligence': 'business_intelligence_analyst',
    'Cloud Computing': 'cloud_architect',
    'Cybersecurity': 'information_security_analyst',
    'Big Data': 'big_data_engineer',
  };

  return careerMap[career] || 'full_stack_developer';
}

// Helper: Call HCX-007 for career recommendation
async function callHCX007ForRegeneration(student: any, predictedCareer: string): Promise<string> {
  const systemPrompt = `You are an expert career advisor for IT students. Provide detailed career recommendations and guidance based on the student's profile and predicted career path.

Include:
1. Why this career fits the student
2. Key strengths to leverage
3. Skills to develop
4. Career trajectory and opportunities
5. Industry trends
6. Recommended certifications

Be encouraging, specific, and actionable.`;

  const userPrompt = `Student Profile:
- Name: ${student.fullName}
- IT Skills: ${student.itSkill.join(', ')}
- Soft Skills: ${student.softSkill.join(', ')}
${student.interests ? `- Interests: ${student.interests.join(', ')}` : ''}
- Current Semester: ${student.academic.currentSemester}
- GPA: ${student.academic.gpa}/4.0

Predicted Career: ${predictedCareer}

Provide career recommendations for this student.`;

  const response = await fetch(HCX_007_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NCP_API_KEY}`,
      'X-NCP-CLOVASTUDIO-REQUEST-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: [{ type: 'text', text: systemPrompt }],
        },
        {
          role: 'user',
          content: [{ type: 'text', text: userPrompt }],
        },
      ],
      topP: 0.8,
      topK: 0,
      maxCompletionTokens: 2000,
      temperature: 0.7,
      repetitionPenalty: 1.1,
      seed: 42,
      includeAiFilters: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`HCX-007 failed: ${await response.text()}`);
  }

  const data = await response.json();
  let recommendation = '';
  
  if (data.result?.message?.content) {
    const content = data.result.message.content;
    if (Array.isArray(content)) {
      recommendation = content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('\n');
    } else if (typeof content === 'string') {
      recommendation = content;
    }
  }

  return recommendation.trim();
}

// Helper: Call Generation Task AI (tuned model) - same as register
async function callGenerationTask(itSkill: string[], softSkill: string[]): Promise<string> {
  const GENERATION_TASK_URL = process.env.NCP_CLOVASTUDIO_TUNING_ENDPOINT || 
    'https://clovastudio.stream.ntruss.com/v2/tasks/00vpqbzj/chat-completions';
  
  const systemPrompt = 'speak in English';
  const userPrompt = `Given the following IT skills: ${itSkill.join(', ')} and Soft skills: ${softSkill.join(', ')}, the job role`;

  const response = await fetch(GENERATION_TASK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NCP_API_KEY}`,
      'X-NCP-CLOVASTUDIO-REQUEST-ID': crypto.randomUUID(),
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      topP: 0.8,
      topK: 0,
      maxTokens: 256,
      temperature: 0.5,
      repeatPenalty: 1.1,
      stopBefore: [],
      seed: 0,
      includeAiFilters: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Generation Task failed: ${await response.text()}`);
  }

  const data = await response.json();
  let generatedText = '';
  
  // Extract from chat-completions response
  if (data.result && data.result.message && data.result.message.content) {
    generatedText = data.result.message.content.trim();
  } else if (data.result && data.result.text) {
    generatedText = data.result.text.trim();
  } else if (data.text) {
    generatedText = data.text.trim();
  }

  // Extract just the job role name
  return generatedText.split('\n')[0].split('.')[0].trim();
}

// POST /api/regenerate-roadmap - Re-predict career và tạo lại roadmap
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Missing studentId' },
        { status: 400 }
      );
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    console.log('🔄 Re-predicting career for student:', student.studentCode);

    // Step 1: Predict career using Generation Task AI (tuned model)
    console.log('Step 1: Predicting career using Generation Task AI...');
    let predictedCareer: string;
    try {
      predictedCareer = await callGenerationTask(student.itSkill, student.softSkill);
      console.log('✅ Career predicted:', predictedCareer);
    } catch (error) {
      console.error('Generation Task error:', error);
      throw new Error('Failed to predict career');
    }

    // Step 2: Call HCX-007 for detailed career recommendation
    console.log('Step 2: Generating career recommendation with HCX-007...');
    let careerRecommendation: string;
    try {
      careerRecommendation = await callHCX007ForRegeneration(student, predictedCareer);
      console.log('✅ Career recommendation generated, length:', careerRecommendation.length);
    } catch (error) {
      console.error('❌ HCX-007 error:', error);
      // Fallback to simple text if HCX-007 fails
      careerRecommendation = `Career recommendation for ${predictedCareer} based on your skills and profile.`;
    }

    // Update student với career mới
    student.career.targetCareerID = mapCareerToJobFile(predictedCareer);
    student.career.actualCareer = predictedCareer;
    student.career.targetConfidence = 0.85;
    (student as any).aiCareerRecommendation = careerRecommendation;

    // Save student with updated career info
    await student.save();
    console.log('✅ Student career updated in database');

    // Step 3: Call Python API to generate personalized roadmap
    // Note: Python API will read student data directly from MongoDB
    console.log('Step 3: Generating personalized roadmap...');
    console.log('🔄 Calling Python API:', `${PYTHON_API_URL}/roadmap/personalized`);
    console.log('📦 Request body:', { user_id: student._id.toString(), jobname: student.career.actualCareer });
    
    const roadmapRes = await fetch(`${PYTHON_API_URL}/roadmap/personalized`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: student._id.toString(),
        jobname: student.career.actualCareer || student.career.targetCareerID,
      }),
    });

    if (!roadmapRes.ok) {
      const errorText = await roadmapRes.text();
      console.error('❌ Python API Error:', roadmapRes.status, errorText);
      throw new Error(`Python API error (${roadmapRes.status}): ${errorText}`);
    }

    const roadmapData = await roadmapRes.json();
    console.log(`✅ Generated roadmap with ${roadmapData.stages?.length || 0} stages`);

    // Step 4: Save PersonalizedRoadmap to MongoDB
    console.log('Step 4: Saving personalized roadmap to database...');
    
    // Delete old roadmap if exists
    await PersonalizedRoadmap.deleteMany({ studentId: student._id });
    
    // Add orderIndex to stages if missing
    const processedStages = roadmapData.stages?.map((stage: any, index: number) => ({
      ...stage,
      orderIndex: stage.orderIndex ?? index,
      areas: stage.areas?.map((area: any, areaIndex: number) => ({
        ...area,
        orderIndex: area.orderIndex ?? areaIndex,
        items: area.items?.map((item: any, itemIndex: number) => ({
          ...item,
          orderIndex: item.orderIndex ?? itemIndex,
        })),
      })),
    })) || [];
    
    const personalizedRoadmap = new PersonalizedRoadmap({
      studentId: student._id,
      roadmapId: null,
      
      careerID: roadmapData.career_id || student.career.targetCareerID,
      careerName: roadmapData.career_name || student.career.actualCareer,
      
      description: roadmapData.description || `Personalized learning roadmap for ${student.career.actualCareer}`,
      generatedAt: new Date(),
      lastUpdated: new Date(),
      
      stages: processedStages,
      
      overallProgress: {
        totalItems: 0,
        completedItems: 0,
        inProgressItems: 0,
        percentageComplete: 0,
      },
      
      generationSource: {
        model: 'HCX-007',
        generatedBy: 'clova-rag',
        confidence: student.career.targetConfidence || 0.85,
        apiVersion: 'v1',
      },
      
      isActive: true,
    });
    
    await personalizedRoadmap.save();
    console.log('✅ Personalized roadmap saved with', personalizedRoadmap.stages.length, 'stages');

    return NextResponse.json({
      success: true,
      message: 'Roadmap regenerated successfully',
      career: {
        predictedCareer: predictedCareer,
        confidence: 0.85,
        recommendation: careerRecommendation,
      },
      roadmap: roadmapData,
    });
  } catch (error) {
    console.error('❌ Error regenerating roadmap:', error);
    return NextResponse.json(
      {
        error: 'Failed to regenerate roadmap',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
