import { NextRequest, NextResponse } from 'next/server';

const NCP_API_KEY = process.env.NCP_API_KEY;
const HCX_007_URL = 'https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-007';

interface CareerRecommendationRequest {
  studentInfo: {
    fullName: string;
    skills: {
      itSkill: string[];
      softSkill: string[];
    };
    interests?: string[];
    currentSemester?: number;
    gpa?: number;
  };
  predictedCareer: string;
}

export async function POST(request: NextRequest) {
  try {
    const { studentInfo, predictedCareer }: CareerRecommendationRequest = await request.json();

    if (!studentInfo || !predictedCareer) {
      return NextResponse.json(
        { error: 'Student info and predicted career are required' },
        { status: 400 }
      );
    }

    // Build comprehensive prompt
    const systemPrompt = `You are an expert career advisor for IT students. Your task is to provide detailed career recommendations and guidance based on the student's profile and the predicted career path.

Provide a comprehensive analysis including:
1. Why this career is a good fit for the student
2. Key strengths the student should leverage
3. Skills they should focus on developing
4. Potential career trajectory and growth opportunities
5. Industry trends and job market outlook
6. Recommended certifications or additional learning paths

Be encouraging, specific, and actionable in your advice.`;

    const userPrompt = `Student Profile:
- Name: ${studentInfo.fullName}
- IT Skills: ${studentInfo.skills.itSkill.join(', ')}
- Soft Skills: ${studentInfo.skills.softSkill.join(', ')}
${studentInfo.interests ? `- Interests: ${studentInfo.interests.join(', ')}` : ''}
${studentInfo.currentSemester ? `- Current Semester: ${studentInfo.currentSemester}` : ''}
${studentInfo.gpa ? `- GPA: ${studentInfo.gpa}/4.0` : ''}

Predicted Career Path: ${predictedCareer}

Please provide detailed career recommendations and guidance for this student.`;

    // Call HCX-007 API
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
      const errorText = await response.text();
      console.error('HCX-007 API Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get career recommendations from HCX-007', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the recommendation
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

    if (!recommendation) {
      console.error('Unexpected HCX-007 response format:', data);
      return NextResponse.json(
        { error: 'Unexpected response format from HCX-007' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      recommendation: recommendation.trim(),
      predictedCareer,
      rawData: data,
    });

  } catch (error) {
    console.error('Error in career recommendation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
