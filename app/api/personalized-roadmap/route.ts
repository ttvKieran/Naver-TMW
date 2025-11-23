import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import { PersonalizedRoadmap } from '@/lib/mongodb/models';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId parameter required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { error: 'Invalid studentId format' },
        { status: 400 }
      );
    }
    
    console.log('Fetching personalized roadmap for studentId:', studentId);
    
    // Get personalized roadmap for student (studentId can be ObjectId or string)
    const roadmap = await PersonalizedRoadmap.findOne({ 
      studentId: studentId,
      isActive: true 
    })
      .sort({ generatedAt: -1 }) // Get most recent
      .lean();
    
    if (!roadmap) {
      console.log('No personalized roadmap found for student:', studentId);
      return NextResponse.json(
        { error: 'Personalized roadmap not found for this student' },
        { status: 404 }
      );
    }
    
    console.log('Found personalized roadmap:', roadmap.careerName, 'with', roadmap.stages?.length, 'stages');
    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error('Error fetching personalized roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalized roadmap', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
