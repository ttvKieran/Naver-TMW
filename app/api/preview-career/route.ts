import { NextRequest, NextResponse } from 'next/server';

const NCP_API_KEY = process.env.NCP_API_KEY;
const GENERATION_TASK_URL = process.env.NCP_CLOVASTUDIO_TUNING_ENDPOINT || 
  'https://clovastudio.stream.ntruss.com/v2/tasks/00vpqbzj/chat-completions';
const HCX_007_URL = 'https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-007';

interface PreviewRequest {
  itSkill: string[];
  softSkill: string[];
  fullName: string;
  currentSemester?: number;
  gpa?: number;
  interests?: string[];
}

// Helper: Call Generation Task AI
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
  
  if (data.result && data.result.message && data.result.message.content) {
    generatedText = data.result.message.content.trim();
  } else if (data.result && data.result.text) {
    generatedText = data.result.text.trim();
  } else if (data.text) {
    generatedText = data.text.trim();
  }

  return generatedText.split('\n')[0].split('.')[0].trim();
}

// Helper: Call HCX-007 for career recommendation
async function callHCX007(studentInfo: PreviewRequest, predictedCareer: string): Promise<string> {
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
- IT Skills: ${studentInfo.itSkill.join(', ')}
- Soft Skills: ${studentInfo.softSkill.join(', ')}
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

export async function POST(request: NextRequest) {
  try {
    const data: PreviewRequest = await request.json();

    if (!data.itSkill || data.itSkill.length === 0) {
      return NextResponse.json(
        { error: 'IT skills are required' },
        { status: 400 }
      );
    }

    // Step 1: Predict career
    console.log('Predicting career...');
    const predictedCareer = await callGenerationTask(data.itSkill, data.softSkill || []);
    console.log('Predicted career:', predictedCareer);

    // Step 2: Get career recommendation
    console.log('Getting career recommendation...');
    const careerRecommendation = await callHCX007(data, predictedCareer);
    console.log('Recommendation received');

    return NextResponse.json({
      success: true,
      predictedCareer,
      careerRecommendation,
    });

  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate career preview', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
