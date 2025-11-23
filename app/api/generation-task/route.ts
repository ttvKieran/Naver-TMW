import { NextRequest, NextResponse } from 'next/server';

const NCP_API_KEY = process.env.NCP_API_KEY;
// Use tuning endpoint (v2/tasks format for tuned model)
const GENERATION_TASK_URL = process.env.NCP_CLOVASTUDIO_TUNING_ENDPOINT || 
  'https://clovastudio.stream.ntruss.com/v2/tasks/00vpqbzj/chat-completions';

interface GenerationTaskRequest {
  itSkills: string[];
  softSkills: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { itSkills, softSkills }: GenerationTaskRequest = await request.json();

    if (!itSkills || !softSkills || itSkills.length === 0) {
      return NextResponse.json(
        { error: 'IT skills and Soft skills are required' },
        { status: 400 }
      );
    }

    // Prepare the prompt for CLOVA tuned model
    const systemPrompt = 'speak in English';
    const userPrompt = `Given the following IT skills: ${itSkills.join(', ')} and Soft skills: ${softSkills.join(', ')}, the job role`;

    const requestBody = {
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
    };

    console.log('🔍 Calling CLOVA Generation Task API');
    console.log('📍 URL:', GENERATION_TASK_URL);
    console.log('📝 Request:', JSON.stringify(requestBody, null, 2));

    // Call CLOVA tuned model API (v2/tasks chat-completions)
    const response = await fetch(GENERATION_TASK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NCP_API_KEY}`,
        'X-NCP-CLOVASTUDIO-REQUEST-ID': crypto.randomUUID(),
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ CLOVA Generation Task Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to call CLOVA Generation Task API', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the generated text from chat-completions response
    let generatedText = '';
    
    if (data.result && data.result.message && data.result.message.content) {
      generatedText = data.result.message.content.trim();
    } else if (data.result && data.result.text) {
      generatedText = data.result.text.trim();
    } else if (data.text) {
      generatedText = data.text.trim();
    } else {
      console.error('Unexpected CLOVA response format:', data);
      return NextResponse.json(
        { error: 'Unexpected response format from CLOVA API' },
        { status: 500 }
      );
    }

    // Extract just the job role name (first line or first sentence)
    const predictedCareer = generatedText.split('\n')[0].split('.')[0].trim();

    return NextResponse.json({
      predictedCareer,
      fullResponse: generatedText,
      rawData: data,
    });

  } catch (error) {
    console.error('Error in generation task:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
