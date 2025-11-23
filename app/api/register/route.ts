import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import { User, Student, PersonalizedRoadmap, Career } from '@/lib/mongodb/models';
import bcrypt from 'bcryptjs';
import { PTIT_IT_COURSES } from '@/data/universities/ptit-courses';

const NCP_API_KEY = process.env.NCP_API_KEY;
const GENERATION_TASK_URL = process.env.NCP_CLOVASTUDIO_TUNING_ENDPOINT || 
  'https://clovastudio.stream.ntruss.com/v2/tasks/00vpqbzj/chat-completions';
const HCX_007_URL = 'https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-007';
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'https://clovax-456m.vercel.app';
const CLOVA_RAG_ROADMAP_URL = `${PYTHON_API_URL}/roadmap/personalized`;

// Map career names to available job files
function mapCareerToJobFile(career: string): string {
  const careerLower = career.toLowerCase().replace(/\s+/g, '_');
  
  // Direct matches
  const directMappings: Record<string, string> = {
    'information_technology': 'full_stack_developer',
    'software_engineer': 'full_stack_developer',
    'web_developer': 'full_stack_developer',
    'frontend_developer': 'full_stack_developer',
    'backend_developer': 'full_stack_developer',
    'data_analyst': 'data_analyst',
    'data_scientist': 'data_scientist',
    'machine_learning_engineer': 'machine_learning',
    'ml_engineer': 'machine_learning',
    'ai_engineer': 'machine_learning',
    'big_data_engineer': 'big_data_engineer',
    'cloud_architect': 'cloud_architect',
    'cloud_engineer': 'cloud_architect',
    'devops_engineer': 'cloud_architect',
    'security_analyst': 'information_security_analyst',
    'cybersecurity_analyst': 'information_security_analyst',
    'business_analyst': 'business_intelligence_analyst',
    'bi_analyst': 'business_intelligence_analyst',
  };
  
  // Check direct mappings
  if (directMappings[careerLower]) {
    return directMappings[careerLower];
  }
  
  // Partial match fallback
  if (careerLower.includes('data') && careerLower.includes('scien')) return 'data_scientist';
  if (careerLower.includes('data') && careerLower.includes('analy')) return 'data_analyst';
  if (careerLower.includes('machine') || careerLower.includes('learning')) return 'machine_learning';
  if (careerLower.includes('cloud')) return 'cloud_architect';
  if (careerLower.includes('security')) return 'information_security_analyst';
  if (careerLower.includes('business') && careerLower.includes('intel')) return 'business_intelligence_analyst';
  if (careerLower.includes('big') && careerLower.includes('data')) return 'big_data_engineer';
  
  // Default fallback
  return 'full_stack_developer';
}

// Get ALL courses for PTIT IT student (all 9 semesters)
function getAllPTITCourses(): Array<{ code: string; name: string; semester: number; grade: number }> {
  const allCourses: Array<{ code: string; name: string; semester: number; grade: number }> = [];
  
  // Loop through all semesters and collect all courses
  PTIT_IT_COURSES.semesters.forEach(semesterData => {
    console.log(`📚 Processing semester ${semesterData.semester} with ${semesterData.courses.length} courses`);
    semesterData.courses.forEach(course => {
      allCourses.push({
        code: course.courseId,
        name: course.name,
        semester: semesterData.semester,
        grade: 0, // Default grade 0 (chưa có điểm)
      });
    });
  });
  
  console.log(`✅ Total courses collected: ${allCourses.length}`);
  console.log(`📋 Sample courses:`, allCourses.slice(0, 3).map(c => ({ code: c.code, semester: c.semester })));
  return allCourses;
}

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

interface RegistrationRequest {
  // User account info
  email: string;
  password: string;
  name: string;
  
  // Student info
  fullName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  
  // Academic info
  university: string;
  major: string;
  currentYear: number;
  currentSemester: number;
  gpa?: number;
  
  // Skills
  skills: {
    itSkill: string[];
    softSkill: string[];
  };
  
  // Interests
  interests?: string[];
  careerGoals?: string;
  
  // AI Career Recommendation (from preview step)
  aiCareerRecommendation?: string;
}

// Helper: Call Generation Task AI (tuned model)
async function callGenerationTask(itSkill: string[], softSkill: string[]): Promise<string> {
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

// Helper: Call HCX-007 for career recommendation
async function callHCX007(studentInfo: any, predictedCareer: string): Promise<string> {
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
- Name: ${studentInfo.fullName}
- IT Skills: ${studentInfo.skills.itSkill.join(', ')}
- Soft Skills: ${studentInfo.skills.softSkill.join(', ')}
${studentInfo.interests ? `- Interests: ${studentInfo.interests.join(', ')}` : ''}
${studentInfo.currentSemester ? `- Current Semester: ${studentInfo.currentSemester}` : ''}
${studentInfo.gpa ? `- GPA: ${studentInfo.gpa}/4.0` : ''}

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

// Helper: Call CLOVA RAG Roadmap API
async function callClovaRagRoadmap(userId: string, jobname: string): Promise<any> {
  console.log('🔄 Calling CLOVA RAG API:', CLOVA_RAG_ROADMAP_URL);
  console.log('📦 Request body:', { user_id: userId, jobname: jobname });
  
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
    const errorText = await response.text();
    console.error('❌ CLOVA RAG API Error:', response.status, errorText);
    throw new Error(`CLOVA RAG Roadmap failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ CLOVA RAG API Success, stages:', result.stages?.length || 0);
  return result;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data: RegistrationRequest = await request.json();

    // Validate required fields
    if (!data.email || !data.password || !data.name || !data.fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!data.skills?.itSkill || data.skills.itSkill.length === 0) {
      return NextResponse.json(
        { error: 'At least one IT skill is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // STEP 1: Call Generation Task AI to predict career
    console.log('Step 1: Predicting career using Generation Task AI...');
    let predictedCareer: string;
    try {
      predictedCareer = await callGenerationTask(data.skills.itSkill, data.skills.softSkill || []);
      console.log('Predicted career:', predictedCareer);
    } catch (error) {
      console.error('Generation Task error:', error);
      return NextResponse.json(
        { error: 'Failed to predict career', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // STEP 2: Get career recommendation (from preview or call HCX-007)
    console.log('Step 2: Getting career recommendation...');
    let careerRecommendation: string;
    
    if (data.aiCareerRecommendation) {
      // Use recommendation from preview step (already generated in Step 5)
      careerRecommendation = data.aiCareerRecommendation;
      console.log('✓ Using career recommendation from preview, length:', careerRecommendation.length);
    } else {
      // Fallback: Call HCX-007 if not provided (shouldn't happen in normal flow)
      console.log('⚠ No preview data, calling HCX-007...');
      try {
        careerRecommendation = await callHCX007(data, predictedCareer);
        console.log('Career recommendation received, length:', careerRecommendation.length);
        console.log('Preview:', careerRecommendation.substring(0, 100));
      } catch (error) {
        console.error('❌ HCX-007 error:', error);
        console.error('Error details:', error instanceof Error ? error.message : JSON.stringify(error));
        careerRecommendation = '';
      }
    }

    // STEP 3: Create User account
    console.log('Step 3: Creating user account...');
    
    // Hash password before saving
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const newUser = new User({
      email: data.email,
      passwordHash: passwordHash,
      name: data.name,
      role: 'student',
      isActive: true,
      emailVerified: false,
    });

    await newUser.save();

    // STEP 4: Create Student profile
    console.log('Step 4: Creating student profile...');
    const studentCode = `STU${Date.now().toString().slice(-6)}`;
    
    // Build skills maps for technical and general
    const technicalSkills: Record<string, number> = {};
    const generalSkills: Record<string, number> = {};
    
    // Assign default proficiency levels (can be customized later)
    data.skills.itSkill.forEach(skill => {
      technicalSkills[skill.toLowerCase().replace(/\s+/g, '_')] = 5; // Default level
    });
    
    data.skills.softSkill?.forEach(skill => {
      generalSkills[skill.toLowerCase().replace(/\s+/g, '_')] = 5; // Default level
    });
    
    // Get ALL courses if PTIT IT student (all 9 semesters)
    let studentCourses: Array<{ code: string; name: string; semester: number; grade: number }> = [];
    const isPTIT = data.university?.toLowerCase().includes('ptit') || 
                   data.university?.toLowerCase().includes('bưu chính');
    const isIT = data.major?.toLowerCase().includes('công nghệ thông tin') ||
                 data.major?.toLowerCase().includes('cntt');
    
    if (isPTIT && isIT) {
      studentCourses = getAllPTITCourses();
      console.log(`✅ Assigned ${studentCourses.length} courses from all semesters (1-9)`);
    }
    
    const newStudent = new Student({
      userId: newUser._id,
      studentCode,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender,
      phone: data.phone,
      university: data.university || PTIT_IT_COURSES.university,
      major: data.major || PTIT_IT_COURSES.major,
      
      // Academic info matching users.json structure
      academic: {
        currentSemester: data.currentSemester,
        gpa: data.gpa || 0,
        courses: studentCourses, // Auto-assigned from PTIT data
      },
      
      // Career info
      career: {
        targetCareerID: predictedCareer.toLowerCase().replace(/\s+/g, '_'),
        actualCareer: predictedCareer,
        targetConfidence: 0.8,
      },
      
      // Availability
      availability: {
        timePerWeekHours: 10, // Default 10 hours per week
      },
      
      // Skills
      skills: {
        technical: technicalSkills,
        general: generalSkills,
      },
      
      // IT and Soft Skills arrays
      itSkill: data.skills.itSkill,
      softSkill: data.skills.softSkill || [],
      
      // Interests & Projects
      interests: data.interests || [],
      projects: [],
      
      // Career Goals & AI Recommendation
      careerGoals: data.careerGoals,
      careerStatus: 'exploring',
      aiCareerRecommendation: careerRecommendation, // Save HCX-007 recommendation
      
      // Metadata
      meta: {
        source: 'web_registration',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await newStudent.save();

    // Update user with student reference
    newUser.studentId = newStudent._id;
    await newUser.save();

    // STEP 5: Find or create Career entry
    console.log('Step 5: Finding career entry...');
    let careerEntry = await Career.findOne({ 
      title: { $regex: new RegExp(predictedCareer, 'i') } 
    });

    if (!careerEntry) {
      console.log('Career not found, creating new entry...');
      careerEntry = new Career({
        careerId: predictedCareer.toLowerCase().replace(/\s+/g, '-'),
        title: predictedCareer,
        category: 'Information Technology',
        level: 'mid-level',
        description: careerRecommendation || `Career path in ${predictedCareer}`,
        requiredSkills: [],
        averageSalary: {},
        isActive: true,
      });
      await careerEntry.save();
    }

    // STEP 6: Bỏ đồng bộ user sang clova-rag-roadmap vì server Flask đã đọc từ MongoDB
    // ...existing code...

    // STEP 7: Call CLOVA RAG Roadmap API for personalized roadmap
    console.log('Step 7: Generating personalized roadmap...');
    let personalizedRoadmapData: any;
    try {
      const rawData = await callClovaRagRoadmap(
        newStudent._id.toString(),
        predictedCareer
      );
      console.log('📦 Raw API response:', JSON.stringify(rawData).substring(0, 200));
      // Transform snake_case to camelCase
      personalizedRoadmapData = transformRoadmapData(rawData);
      console.log('Personalized roadmap generated with', personalizedRoadmapData.stages?.length || 0, 'stages');
    } catch (error) {
      console.error('CLOVA RAG Roadmap error:', error);
      // Non-critical, continue without personalized roadmap
      personalizedRoadmapData = null;
    }

    // STEP 8: Save personalized roadmap to database
    if (personalizedRoadmapData && personalizedRoadmapData.stages) {
      console.log('Step 8: Saving personalized roadmap to database...');
      
      // API returns format matching data/jobs/*.json with career_id and career_name
      const personalizedRoadmap = new PersonalizedRoadmap({
        studentId: newStudent._id,
        roadmapId: null, // Optional, we don't have base roadmap reference
        
        // Use career_id and career_name from API response
        careerID: personalizedRoadmapData.career_id || predictedCareer.toLowerCase().replace(/\s+/g, '_'),
        careerName: personalizedRoadmapData.career_name || predictedCareer,
        
        description: personalizedRoadmapData.description || `Personalized learning roadmap for ${predictedCareer}`,
        generatedAt: new Date(),
        lastUpdated: new Date(),
        
        // Save full stages structure from API (includes check + personalization per item)
        stages: personalizedRoadmapData.stages,
        
        // Calculate overall progress
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
      console.log('Personalized roadmap saved with', personalizedRoadmap.stages.length, 'stages');
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      data: {
        userId: newUser._id,
        studentId: newStudent._id,
        studentCode,
        predictedCareer,
        careerRecommendation,
        email: data.email,
        name: data.name,
      },
      redirectTo: '/dashboard',
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Registration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
